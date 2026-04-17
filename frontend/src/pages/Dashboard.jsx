import { useEffect, useState } from "react";
import { getDashboardData } from "../services/api";
import { Bell, MessageCircle, Heart, Inbox } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData().then(res => {
      setData(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando dashboard...</div>;
  if (!data) return <div>Error al cargar datos. Comprueba que el backend local está corriendo.</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Bienvenido (a), Equipo ClínicaMent</h1>
        <button className="btn btn-secondary">
          <Bell size={18} /> Alertas
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="card stat-card">
          <span className="stat-title"><MessageCircle size={16} style={{display:'inline', marginBottom:'-3px'}}/> Comentarios Nuevos</span>
          <span className="stat-value">{data.stats.newComments}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-title"><Inbox size={16} style={{display:'inline', marginBottom:'-3px'}}/> Mensajes Privados</span>
          <span className="stat-value">{data.stats.newMessages}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-title"><Heart size={16} style={{display:'inline', marginBottom:'-3px'}}/> Likes Totales (Hoy)</span>
          <span className="stat-value">{data.stats.likesCard}</span>
        </div>
      </div>

      <h2 style={{ marginBottom: "1rem", color: "var(--text-main)" }}>Actividad Reciente</h2>
      <div className="card">
        <div className="item-list">
          {data.recentActivity.map((act, i) => (
            <div key={i} className="list-item">
              <div className="list-item-content">
                <span className="list-item-title">{act.text}</span>
                <span className="list-item-subtitle">{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
