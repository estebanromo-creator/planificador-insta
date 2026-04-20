import { useEffect, useState } from "react";
import { getGiveawayParticipants, drawGiveaway, getGiveawayHistory } from "../services/api";
import { getPosts } from "../services/api";
import { Gift, Trophy, Users, Heart, Tag, RefreshCcw, Loader, History, AlertTriangle } from "lucide-react";

export default function Giveaways() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState("");
  const [participants, setParticipants] = useState(null);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [manualLikers, setManualLikers] = useState("");
  const [winner, setWinner] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    getPosts().then(setPosts).catch(console.error);
    getGiveawayHistory().then(setHistory).catch(() => {});
  }, []);

  const handleLoadParticipants = async () => {
    if (!selectedPost) return setError("Selecciona una publicación primero.");
    setError("");
    setWinner(null);
    setParticipants(null);
    setLoadingParticipants(true);
    try {
      const data = await getGiveawayParticipants(selectedPost);
      setParticipants(data);
    } catch {
      setError("Error al cargar participantes. Verifica que el backend esté activo.");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleDraw = async () => {
    setError("");
    setWinner(null);
    setDrawing(true);
    try {
      const manualArray = manualLikers
        .split("\n")
        .map(u => u.replace("@", "").trim())
        .filter(Boolean);
      // Combinar likers de API (Facebook) + manuales (Instagram)
      const allLikers = [
        ...(participants?.likers || []).map(l => l.user),
        ...manualArray
      ];
      const res = await drawGiveaway(selectedPost, participants?.mentioners || [], allLikers);
      setWinner(res);
      getGiveawayHistory().then(setHistory).catch(() => {});
    } catch (e) {
      setError(e.response?.data?.error || "Error al realizar el sorteo.");
    } finally {
      setDrawing(false);
    }
  };

  const parsedManualLikers = manualLikers.split("\n").map(u => u.replace("@", "").trim()).filter(Boolean);
  const apiLikers = participants?.likers || [];
  const isFacebook = participants?.platform === "facebook";

  const totalParticipants = new Set([
    ...(participants?.mentioners || []).map(p => p.user.toLowerCase()),
    ...apiLikers.map(l => l.user.toLowerCase()),
    ...parsedManualLikers.map(u => u.toLowerCase())
  ]).size;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Gestión de Sorteos</h1>
        <button className="btn btn-secondary" onClick={() => setShowHistory(!showHistory)}>
          <History size={18} /> Historial
        </button>
      </div>

      {/* Historial */}
      {showHistory && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <History size={20} color="var(--primary-color)" /> Historial de Ganadores
          </h2>
          {history.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>Aún no se han realizado sorteos.</p>
          ) : (
            <div className="item-list">
              {history.map((h, i) => (
                <div key={i} className="list-item">
                  <div className="list-item-content">
                    <span className="list-item-title">🏆 @{h.winner_user}</span>
                    <span className="list-item-subtitle">
                      {h.posts?.title || h.post_id} · {new Date(h.drawn_at).toLocaleString("es-ES")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>

        {/* ── Panel izquierdo: Configurar sorteo ── */}
        <div>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Gift size={22} color="var(--primary-color)" /> Configurar Sorteo
            </h2>

            <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Publicación</label>
            <select
              className="btn btn-secondary"
              style={{ width: "100%", justifyContent: "flex-start", textAlign: "left", marginBottom: "1.25rem" }}
              value={selectedPost}
              onChange={e => { setSelectedPost(e.target.value); setParticipants(null); setWinner(null); }}
            >
              <option value="">Selecciona una publicación...</option>
              {posts.map(p => (
                <option key={p.id} value={p.id}>{p.title} ({p.platform}) · {p.date}</option>
              ))}
            </select>

            <button
              className="btn btn-secondary"
              style={{ width: "100%", marginBottom: "0.5rem" }}
              onClick={handleLoadParticipants}
              disabled={!selectedPost || loadingParticipants}
            >
              {loadingParticipants
                ? <><Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> Cargando...</>
                : <><Users size={16} /> Cargar Participantes</>}
            </button>
          </div>

          {/* Likers */}
          <div className="card">
            <h3 style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem" }}>
              <Heart size={18} color="#f43f5e" />
              Me Gustas
              {isFacebook && apiLikers.length > 0 && (
                <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "0.85rem" }}>{apiLikers.length} (automático)</span>
              )}
            </h3>

            {/* Facebook: muestra lista automática */}
            {isFacebook && participants?.tokenConfigured ? (
              apiLikers.length > 0 ? (
                <div>
                  <div style={{ padding: "0.5rem 0.75rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "8px", color: "#10b981", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                    ✅ Likers cargados automáticamente desde la API de Facebook.
                  </div>
                  <div className="item-list" style={{ maxHeight: "160px", overflowY: "auto" }}>
                    {apiLikers.map((l, i) => (
                      <div key={i} className="list-item" style={{ padding: "0.5rem 0.75rem" }}>
                        <span style={{ color: "var(--text-main)", fontWeight: "500" }}>@{l.user}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No se encontraron likers para esta publicación de Facebook.</p>
              )
            ) : (
              /* Instagram o sin token: entrada manual */
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.75rem" }}>
                  {!participants
                    ? "Carga los participantes primero para ver las opciones."
                    : "La API de Instagram no permite obtener la lista de likers (limitación de privacidad de Meta). Expórtalos desde Meta Business Suite y pégalos aquí."
                  }
                </p>
                <textarea
                  value={manualLikers}
                  onChange={e => setManualLikers(e.target.value)}
                  placeholder={"@usuario1\n@usuario2\n@usuario3"}
                  rows={5}
                  style={{
                    width: "100%", padding: "0.75rem 1rem",
                    borderRadius: "10px", border: "1px solid var(--border-color)",
                    background: "var(--secondary-color)", color: "var(--text-main)",
                    fontFamily: "monospace", fontSize: "0.85rem", resize: "vertical",
                    boxSizing: "border-box"
                  }}
                />
                {parsedManualLikers.length > 0 && (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.5rem" }}>
                    <Heart size={12} style={{ display: "inline" }} /> {parsedManualLikers.length} likers añadidos manualmente
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Panel derecho: Participantes y ganador ── */}
        <div>
          {/* Lista de participantes (comentarios con @) */}
          {participants && (
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem" }}>
                <Tag size={18} color="var(--primary-color)" /> Comentarios con Mención (@)
                <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "0.85rem" }}>{participants.mentioners.length}</span>
              </h3>

              {participants.note && (
                <div style={{ padding: "0.6rem 0.9rem", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "8px", marginBottom: "1rem", color: "#f59e0b", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <AlertTriangle size={14} /> {participants.note}
                </div>
              )}

              <div className="item-list" style={{ maxHeight: "260px", overflowY: "auto" }}>
                {participants.mentioners.length === 0 ? (
                  <p style={{ color: "var(--text-muted)" }}>No se encontraron comentarios con mención @ en esta publicación.</p>
                ) : (
                  participants.mentioners.map((p, i) => (
                    <div key={i} className="list-item">
                      <div className="list-item-content">
                        <span className="list-item-title" style={{ color: "var(--primary-color)" }}>@{p.user}</span>
                        <span className="list-item-subtitle" style={{ fontStyle: "italic" }}>{p.text}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Resumen y botón sortear */}
          {participants && (
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Total participantes únicos</p>
                  <p style={{ fontSize: "2rem", fontWeight: "700", color: "var(--primary-color)", margin: 0 }}>{totalParticipants}</p>
                </div>
              <div style={{ textAlign: "right", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <div><Tag size={12} style={{ display: "inline" }} /> {participants.mentioners.length} menciones @</div>
                  <div><Heart size={12} style={{ display: "inline" }} /> {apiLikers.length + parsedManualLikers.length} likers</div>
                </div>
              </div>

              {error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>}

              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={handleDraw}
                disabled={drawing || totalParticipants === 0}
              >
                {drawing
                  ? <><Loader size={18} style={{ animation: "spin 1s linear infinite" }} /> Sorteando...</>
                  : <><RefreshCcw size={18} /> Realizar Sorteo</>}
              </button>
            </div>
          )}

          {/* Ganador */}
          {winner && (
            <div className="card" style={{ textAlign: "center", border: "2px solid var(--primary-color)", background: "var(--secondary-color)" }}>
              <Trophy size={52} color="var(--primary-color)" style={{ margin: "0 auto 1rem" }} />
              <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>¡Tenemos Ganador!</h2>
              <div style={{ fontSize: "1.6rem", fontWeight: "700", color: "var(--primary-color)", marginBottom: "0.75rem" }}>
                @{winner.winner.user}
              </div>
              <p style={{ color: "var(--text-muted)", fontStyle: "italic", marginBottom: "0.5rem" }}>
                "{winner.winner.text}"
              </p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Seleccionado entre {winner.totalParticipants} participantes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
