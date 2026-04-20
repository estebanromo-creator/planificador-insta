import { useEffect, useState } from "react";
import { getDashboardData } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Bell, MessageCircle, Heart, Inbox, Settings, CheckCircle, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardData().then(res => {
      setData(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "2rem", color: "var(--text-muted)" }}>Cargando dashboard...</div>;
  if (!data) return <div style={{ padding: "2rem", color: "#ef4444" }}>Error al cargar datos. Comprueba que el backend está activo.</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Bienvenido/a, Equipo ClínicaMent</h1>
        <button className="btn btn-secondary">
          <Bell size={18} /> Alertas
        </button>
      </div>

      {/* Banner de estado del token Meta */}
      <div
        onClick={() => navigate("/admin")}
        style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.85rem 1.25rem", borderRadius: "12px", marginBottom: "1.5rem",
          cursor: "pointer", transition: "opacity 0.2s",
          background: data.tokenConfigured ? "rgba(16,185,129,0.08)" : "rgba(251,191,36,0.08)",
          border: `1px solid ${data.tokenConfigured ? "rgba(16,185,129,0.25)" : "rgba(251,191,36,0.3)"}`,
        }}
        title="Ir a Ajustes"
      >
        {data.tokenConfigured
          ? <CheckCircle size={18} color="#10b981" />
          : <AlertCircle size={18} color="#f59e0b" />}
        <span style={{ fontSize: "0.88rem", color: data.tokenConfigured ? "#10b981" : "#f59e0b", flex: 1 }}>
          {data.tokenConfigured
            ? "Token de Meta configurado — Los datos son reales."
            : "Token de Meta no configurado — La app usa datos de simulación."}
        </span>
        <Settings size={15} style={{ color: "var(--text-muted)" }} />
      </div>

      <div className="dashboard-grid">
        <div className="card stat-card" style={{ cursor: "pointer" }} onClick={() => navigate("/comments")}>
          <span className="stat-title"><MessageCircle size={16} style={{ display: "inline", marginBottom: "-3px" }} /> Comentarios Nuevos</span>
          <span className="stat-value">{data.stats.newComments}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-title"><Inbox size={16} style={{ display: "inline", marginBottom: "-3px" }} /> Mensajes Privados</span>
          <span className="stat-value" style={{ fontSize: "1.5rem", color: "var(--text-muted)" }}>
            {data.tokenConfigured ? data.stats.newMessages : "—"}
          </span>
          {!data.tokenConfigured && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Requiere token Meta</span>}
        </div>
        <div className="card stat-card">
          <span className="stat-title"><Heart size={16} style={{ display: "inline", marginBottom: "-3px" }} /> Likes Totales (Hoy)</span>
          <span className="stat-value" style={{ fontSize: "1.5rem", color: "var(--text-muted)" }}>
            {data.tokenConfigured ? data.stats.likesCard : "—"}
          </span>
          {!data.tokenConfigured && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Requiere token Meta</span>}
        </div>
      </div>

      <h2 style={{ marginBottom: "1rem", color: "var(--text-main)" }}>Actividad Reciente</h2>
      <div className="card">
        <div className="item-list">
          {data.recentActivity.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No hay actividad reciente en la base de datos.</p>
          ) : (
            data.recentActivity.map((act, i) => (
              <div key={i} className="list-item">
                <div className="list-item-content">
                  <span className="list-item-title">{act.text}</span>
                  <span className="list-item-subtitle">{act.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
