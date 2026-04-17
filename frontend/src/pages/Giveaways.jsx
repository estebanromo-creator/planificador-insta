import { useEffect, useState } from "react";
import { getPosts, drawGiveaway } from "../services/api";
import { Gift, Trophy, RefreshCcw } from "lucide-react";

export default function Giveaways() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState("");
  const [allowDupes, setAllowDupes] = useState(false);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPosts().then(setPosts).catch(console.error);
  }, []);

  const handleDraw = async () => {
    if (!selectedPost) return setError("Selecciona una publicación");
    setError("");
    setWinner(null);
    try {
      const res = await drawGiveaway(selectedPost, allowDupes);
      setWinner(res.winner);
    } catch (e) {
      setError(e.response?.data?.error || "Error al realizar el sorteo");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestión de Sorteos</h1>
      </div>

      <div className="card" style={{ maxWidth: "600px", marginBottom: "2rem" }}>
        <h2 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Gift size={24} color="var(--primary-color)" /> Configurar Sorteo
        </h2>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Publicación Base</label>
          <select 
            className="btn btn-secondary" 
            style={{ width: "100%", justifyContent: "space-between", textAlign: "left" }}
            value={selectedPost} 
            onChange={(e) => setSelectedPost(e.target.value)}
          >
            <option value="">Selecciona una publicación...</option>
            {posts.map(p => (
              <option key={p.id} value={p.id}>{p.title} ({p.platform}) - {p.date}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input 
              type="checkbox" 
              checked={allowDupes} 
              onChange={e => setAllowDupes(e.target.checked)} 
              style={{ width: "18px", height: "18px", accentColor: "var(--primary-color)" }}
            />
            <span style={{ fontWeight: "500" }}>Permitir múltiples participaciones por usuario</span>
          </label>
        </div>
        
        {error && <div style={{ color: "#ef4444", marginBottom: "1rem", fontWeight: "500" }}>{error}</div>}

        <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleDraw}>
          <RefreshCcw size={18} /> Generar Ganador Aleatorio
        </button>
      </div>

      {winner && (
        <div className="card" style={{ maxWidth: "600px", textAlign: "center", border: "2px solid var(--primary-color)", backgroundColor: "var(--secondary-color)" }}>
          <Trophy size={48} color="var(--primary-color)" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "2rem", color: "var(--text-main)", marginBottom: "0.5rem" }}>¡Tenemos un Ganador!</h2>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--primary-color)", marginBottom: "1rem" }}>
            @{winner.user}
          </div>
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
            " {winner.text} "
          </p>
        </div>
      )}
    </div>
  );
}
