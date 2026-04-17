import { useEffect, useState } from "react";
import { getPosts, getComments } from "../services/api";
import { MessageSquare, Filter } from "lucide-react";

export default function Comments() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPosts().then(setPosts).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedPost) {
      setLoading(true);
      getComments(selectedPost)
        .then(res => {
          setComments(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setComments([]);
    }
  }, [selectedPost]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Directorio de Comentarios</h1>
      </div>

      <div className="card" style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <Filter size={20} color="var(--text-muted)" />
        <select 
          className="btn btn-secondary" 
          style={{ minWidth: "300px" }}
          value={selectedPost} 
          onChange={(e) => setSelectedPost(e.target.value)}
        >
          <option value="">Todas las publicaciones (Selecciona una)...</option>
          {posts.map(p => (
            <option key={p.id} value={p.id}>{p.title} - {p.date}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <MessageSquare size={20} color="var(--primary-color)" /> Comentarios 
          {selectedPost && <span style={{ fontSize: "1rem", color: "var(--text-muted)", marginLeft: "auto" }}>{comments.length} encontrados</span>}
        </h2>
        
        {loading && <p>Cargando comentarios...</p>}
        {!loading && comments.length === 0 && selectedPost && <p style={{color: "var(--text-muted)"}}>No hay comentarios para esta publicación.</p>}
        {!selectedPost && <p style={{color: "var(--text-muted)"}}>Selecciona una publicación del filtro arriba para ver sus comentarios.</p>}
        
        <div className="item-list">
          {comments.map((c) => (
            <div key={c.id} className="list-item">
              <div className="list-item-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span className="list-item-title" style={{ color: "var(--primary-color)" }}>@{c.user}</span>
                  <span className="list-item-subtitle" style={{ fontSize: "0.75rem" }}>{new Date(c.date).toLocaleString()}</span>
                </div>
                <span style={{ color: "var(--text-main)", lineHeight: "1.5" }}>{c.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
