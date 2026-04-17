import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Base de datos simulada en memoria
const mockData = {
  stats: {
    newComments: 14,
    newMessages: 5,
    likesCard: 342
  },
  comments: [
    { id: "1", user: "maria_garcia", text: "Me encanta esta clínica!", date: "2026-04-17T10:30:00Z", post: "post_1" },
    { id: "2", user: "juan_perez", text: "Participo @amigo", date: "2026-04-17T11:00:00Z", post: "post_1" },
    { id: "3", user: "ana_lopez", text: "Qué buen servicio", date: "2026-04-16T15:20:00Z", post: "post_2" },
    { id: "4", user: "juan_perez", text: "Participo también ;)", date: "2026-04-17T11:05:00Z", post: "post_1" }
  ],
  posts: [
    { id: "post_1", title: "Sorteo Blanqueamiento", platform: "instagram", date: "2026-04-15" },
    { id: "post_2", title: "Consejos Salud Dental", platform: "facebook", date: "2026-04-10" }
  ]
};

app.get("/api/dashboard", (req, res) => {
  res.json({
    stats: mockData.stats,
    recentActivity: [
      { text: "Nuevo comentario de maria_garcia", time: "Hace 2 mins" },
      { text: "Mensaje privado en Instagram", time: "Hace 15 mins" }
    ]
  });
});

app.get("/api/posts", (req, res) => {
  res.json(mockData.posts);
});

app.get("/api/comments/:postId", (req, res) => {
  const { postId } = req.params;
  const filtered = mockData.comments.filter(c => c.post === postId);
  res.json(filtered);
});

app.post("/api/giveaway/draw", (req, res) => {
  const { postId, allowDuplicates } = req.body;
  let participants = mockData.comments.filter(c => c.post === postId);
  
  if (!allowDuplicates) {
    // Filtrar usuarios únicos
    const uniqueUsers = new Set();
    participants = participants.filter(p => {
      if (uniqueUsers.has(p.user)) return false;
      uniqueUsers.add(p.user);
      return true;
    });
  }

  if (participants.length === 0) {
    return res.status(400).json({ error: "No hay participantes válidos" });
  }

  const winnerIndex = Math.floor(Math.random() * participants.length);
  res.json({ winner: participants[winnerIndex] });
});

export default app;

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend simulator running on http://localhost:${PORT}`);
});
