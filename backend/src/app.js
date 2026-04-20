import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import axios from "axios";
import { supabase } from "./supabase.js";
import { requireApiKey, requireAdminPassword } from "./middleware/auth.js";

dotenv.config();

const app = express();

// ─── SEGURIDAD: Headers HTTP ──────────────────────────────────────────────────
app.use(helmet());

// ─── SEGURIDAD: CORS restringido ──────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:4173",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS: origen no permitido — " + origin));
    }
  }
}));

// ─── SEGURIDAD: Rate Limiting ─────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones. Por favor espera 15 minutos." }
});
app.use(limiter);
app.use(bodyParser.json());

// ─── HELPER: Obtener configuración Meta desde Supabase ────────────────────────
async function getSetting(key) {
  try {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", key)
      .single();
    return data?.value || null;
  } catch {
    return null;
  }
}

// ─── MOCK DATA (fallback si Supabase no tiene datos) ─────────────────────────
const mockPosts = [
  { id: "post_1", title: "Sorteo Blanqueamiento", platform: "instagram", date: "2026-04-15", instagram_media_id: null },
  { id: "post_2", title: "Consejos Salud Dental", platform: "facebook", date: "2026-04-10", instagram_media_id: null }
];
const mockComments = [
  { id: "1", user_handle: "maria_garcia", text: "Me encanta esta clínica! @lucia_smile", date: "2026-04-17T10:30:00Z", post_id: "post_1" },
  { id: "2", user_handle: "juan_perez", text: "Participo! Me lo merece @amigo_carlos", date: "2026-04-17T11:00:00Z", post_id: "post_1" },
  { id: "3", user_handle: "ana_lopez", text: "Qué buen servicio @mi_amiga_rosa", date: "2026-04-16T15:20:00Z", post_id: "post_1" },
  { id: "4", user_handle: "pedro_ruiz", text: "Interesante contenido", date: "2026-04-17T11:05:00Z", post_id: "post_1" },
  { id: "5", user_handle: "sofia_mv", text: "Me apunto @carolina_dent", date: "2026-04-17T12:00:00Z", post_id: "post_1" }
];

// =============================================================================
// RUTA PÚBLICA — Login admin (sin API Key, usa contraseña de admin)
// =============================================================================
app.post("/api/admin/login", (req, res) => {
  const { adminPassword } = req.body;
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: "ADMIN_PASSWORD no configurada en el servidor." });
  }
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Contraseña incorrecta." });
  }
  res.json({ success: true });
});

// =============================================================================
// RUTAS PROTEGIDAS — Requieren API Key en header: x-api-key
// =============================================================================
app.use("/api", requireApiKey);

// ─── Admin: Estado del token Meta ─────────────────────────────────────────────
app.get("/api/admin/token/status", async (req, res) => {
  const token = await getSetting("meta_access_token");
  const accountId = await getSetting("meta_instagram_account_id");
  if (!token) return res.json({ configured: false });
  const masked = token.substring(0, 6) + "..." + token.substring(token.length - 4);
  res.json({ configured: true, masked, accountId });
});

// ─── Admin: Guardar token Meta (requiere API Key + contraseña admin) ──────────
app.post("/api/admin/token", requireAdminPassword, async (req, res) => {
  const { metaToken, metaAccountId } = req.body;
  if (!metaToken || !metaAccountId) {
    return res.status(400).json({ error: "Se requieren metaToken y metaAccountId." });
  }
  try {
    await supabase.from("app_settings").upsert([
      { key: "meta_access_token", value: metaToken, updated_at: new Date().toISOString() },
      { key: "meta_instagram_account_id", value: metaAccountId, updated_at: new Date().toISOString() }
    ]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Error guardando configuración en Supabase." });
  }
});

// ─── Dashboard ─────────────────────────────────────────────────────────────────
app.get("/api/dashboard", async (req, res) => {
  const token = await getSetting("meta_access_token");
  try {
    const { data: comments } = await supabase.from("comments").select("*").order("date", { ascending: false }).limit(5);
    const { count } = await supabase.from("comments").select("*", { count: "exact", head: true });
    res.json({
      stats: { newComments: count || 0, newMessages: "--", likesCard: "--" },
      tokenConfigured: !!token,
      recentActivity: (comments || []).map(c => ({
        text: `Comentario de @${c.user_handle}: "${c.text.substring(0, 40)}..."`,
        time: new Date(c.date).toLocaleString("es-ES")
      }))
    });
  } catch {
    res.json({
      stats: { newComments: 0, newMessages: "--", likesCard: "--" },
      tokenConfigured: !!token,
      recentActivity: []
    });
  }
});

// ─── Posts ─────────────────────────────────────────────────────────────────────
app.get("/api/posts", async (req, res) => {
  try {
    const { data, error } = await supabase.from("posts").select("*").order("date", { ascending: false });
    if (error || !data?.length) return res.json(mockPosts);
    res.json(data);
  } catch {
    res.json(mockPosts);
  }
});

// ─── Comentarios de un post ───────────────────────────────────────────────────
app.get("/api/comments/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const { data, error } = await supabase.from("comments").select("*").eq("post_id", postId).order("date", { ascending: false });
    if (error) return res.json(mockComments.filter(c => c.post_id === postId));
    res.json(data?.length ? data : mockComments.filter(c => c.post_id === postId));
  } catch {
    res.json(mockComments.filter(c => c.post_id === postId));
  }
});

// ─── Sorteo: Cargar participantes ────────────────────────────────────────────
// - Comentarios con @ → disponible en Instagram Y Facebook (con token)
// - Likers → Solo en posts de FACEBOOK (con token). Instagram no permite esto por privacidad.
app.get("/api/giveaway/participants/:postId", async (req, res) => {
  const { postId } = req.params;
  const token = await getSetting("meta_access_token");

  let mentioners = [];
  let likers = [];
  let platform = "instagram";

  // Obtener el post para saber la plataforma y los IDs
  let postData = null;
  try {
    const { data } = await supabase.from("posts").select("*").eq("id", postId).single();
    postData = data;
    platform = postData?.platform || "instagram";
  } catch {
    // fallback a mock
    postData = mockPosts.find(p => p.id === postId);
    platform = postData?.platform || "instagram";
  }

  if (token) {
    // ── Comentarios con @ (Instagram o Facebook) ──────────────────────────────
    try {
      const mediaId = postData?.instagram_media_id || postData?.facebook_post_id;
      if (mediaId) {
        // Instagram usa graph.instagram.com, Facebook usa graph.facebook.com
        const baseUrl = platform === "facebook"
          ? `https://graph.facebook.com/v19.0/${mediaId}/comments`
          : `https://graph.instagram.com/v19.0/${mediaId}/comments`;

        let url = baseUrl;
        let allComments = [];
        while (url) {
          const response = await axios.get(url, {
            params: { fields: "from,message,created_time", access_token: token, limit: 500 }
          });
          allComments = allComments.concat(response.data?.data || []);
          url = response.data?.paging?.next || null;
        }
        mentioners = allComments
          .filter(c => (c.message || c.text || "").includes("@"))
          .map(c => ({
            user: c.from?.name || c.username || "desconocido",
            source: "comment_mention",
            text: c.message || c.text || ""
          }));
      }
    } catch (err) {
      console.error("[META API] Comentarios:", err.message);
    }

    // ── Likers de Facebook (NO disponible para Instagram) ────────────────────
    if (platform === "facebook" && postData?.facebook_post_id) {
      try {
        let url = `https://graph.facebook.com/v19.0/${postData.facebook_post_id}/likes`;
        while (url) {
          const response = await axios.get(url, {
            params: { fields: "name,username", access_token: token, limit: 500 }
          });
          likers = likers.concat(
            (response.data?.data || []).map(u => ({
              user: u.username || u.name,
              source: "like",
              text: "Dio Me gusta"
            }))
          );
          url = response.data?.paging?.cursors?.after
            ? `https://graph.facebook.com/v19.0/${postData.facebook_post_id}/likes?after=${response.data.paging.cursors.after}&access_token=${token}&fields=name,username&limit=500`
            : null;
        }
      } catch (err) {
        console.error("[META API] Likers Facebook:", err.message);
      }
    }
  } else {
    // Modo simulación
    mentioners = mockComments
      .filter(c => c.post_id === postId && c.text.includes("@"))
      .map(c => ({ user: c.user_handle, source: "comment_mention", text: c.text }));
  }

  // Mensaje informativo según plataforma
  let note;
  if (!token) {
    note = "⚠️ Modo simulación. Configura el token Meta en Ajustes para datos reales.";
  } else if (platform === "facebook") {
    note = "✅ Participantes extraídos de Facebook (comentarios con @ y likers automáticos).";
  } else {
    note = "✅ Comentarios con @ extraídos de Instagram. Los likers de Instagram no son accesibles por la API de Meta (limitación de privacidad) — añádelos manualmente.";
  }

  res.json({
    mentioners,
    likers,             // Solo viene relleno en posts de Facebook con token
    platform,
    tokenConfigured: !!token,
    note
  });
});

// ─── Sorteo: Realizar el sorteo ───────────────────────────────────────────────
app.post("/api/giveaway/draw", async (req, res) => {
  const { postId, mentioners = [], manualLikers = [] } = req.body;

  // Unir ambas listas y deduplicar por nombre de usuario
  const all = [
    ...mentioners.map(u => ({ user: u.user, source: u.source, text: u.text })),
    ...manualLikers.map(u => ({ user: u.trim(), source: "like", text: "Dio Me gusta" }))
  ];
  const seen = new Set();
  const participants = all.filter(p => {
    const key = p.user.toLowerCase();
    if (!p.user || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (participants.length === 0) {
    return res.status(400).json({ error: "No hay participantes válidos para el sorteo." });
  }

  const winner = participants[Math.floor(Math.random() * participants.length)];

  // Guardar resultado en Supabase
  try {
    await supabase.from("giveaway_results").insert([{
      post_id: postId,
      winner_user: winner.user,
      winner_text: winner.text,
      winner_source: winner.source,
      total_participants: participants.length
    }]);
  } catch (err) {
    console.warn("[SUPABASE] No se pudo guardar resultado:", err.message);
  }

  res.json({ winner, totalParticipants: participants.length });
});

// ─── Sorteo: Historial ────────────────────────────────────────────────────────
app.get("/api/giveaway/history", async (req, res) => {
  try {
    const { data } = await supabase
      .from("giveaway_results")
      .select("*, posts(title)")
      .order("drawn_at", { ascending: false })
      .limit(20);
    res.json(data || []);
  } catch {
    res.json([]);
  }
});

export default app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Backend ClínicaMent corriendo en http://localhost:${PORT}`);
  console.log(`   API Key:  ${process.env.API_KEY ? "✅ Configurada" : "⚠️  Sin configurar (acceso abierto)"}`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL ? "✅ Conectado" : "❌ Sin configurar"}`);
  console.log(`   Admin:    ${process.env.ADMIN_PASSWORD ? "✅ Contraseña configurada" : "❌ Sin contraseña admin"}\n`);
});
