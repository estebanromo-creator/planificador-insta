import { CalendarPlus, Image, Send } from "lucide-react";

export default function Scheduler() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Programación de Contenido</h1>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "2fr 1fr" }}>
        
        <div className="card">
          <h2 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CalendarPlus size={20} color="var(--primary-color)" /> Nueva Publicación
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Plataformas</label>
              <div style={{ display: "flex", gap: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: "var(--primary-color)" }} /> Instagram
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: "var(--primary-color)" }} /> Facebook
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Texto de la publicación</label>
              <textarea 
                className="btn-secondary"
                style={{ width: "100%", padding: "1rem", borderRadius: "12px", minHeight: "150px", resize: "vertical", fontFamily: "inherit" }}
                placeholder="Escribe el copy aquí... ¡No olvides los hashtags!"
              ></textarea>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Multimedia</label>
              <div style={{ border: "2px dashed var(--border-color)", padding: "2rem", borderRadius: "12px", textAlign: "center", cursor: "pointer" }}>
                <Image size={32} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
                <p style={{ color: "var(--text-muted)" }}>Haz clic o arrastra imágenes/vídeos aquí</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Fecha</label>
                <input type="date" className="btn btn-secondary" style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Hora</label>
                <input type="time" className="btn btn-secondary" style={{ width: "100%" }} />
              </div>
            </div>

            <button className="btn btn-primary" style={{ marginTop: "1rem", justifyContent: "center" }}>
              <Send size={18} /> Programar Publicación
            </button>
          </div>
        </div>

        <div className="card" style={{ alignSelf: "start" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>Próximas Entregas</h2>
          
          <div className="item-list">
            <div className="list-item" style={{ borderLeft: "4px solid var(--primary-color)" }}>
              <div className="list-item-content">
                <span className="list-item-title">Sorteo Blanqueamiento (Recordatorio)</span>
                <span className="list-item-subtitle">Mañana, 10:00 AM • IG & FB</span>
              </div>
            </div>
            <div className="list-item" style={{ borderLeft: "4px solid #f59e0b" }}>
              <div className="list-item-content">
                <span className="list-item-title">Consejos Bracket Invisible</span>
                <span className="list-item-subtitle">Jueves, 15:30 PM • Instagram</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
