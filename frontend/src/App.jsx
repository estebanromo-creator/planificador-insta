import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Gift, CalendarPlus, LogOut } from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Comments from "./pages/Comments";
import Giveaways from "./pages/Giveaways";
import Scheduler from "./pages/Scheduler";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span style={{ color: "var(--primary-color)" }}>✦</span> ClínicaMent
      </div>
      <nav style={{ flex: 1 }}>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/comments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <MessageSquare size={20} />
          Comentarios
        </NavLink>
        <NavLink to="/giveaways" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Gift size={20} />
          Sorteos
        </NavLink>
        <NavLink to="/scheduler" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <CalendarPlus size={20} />
          Programación
        </NavLink>
      </nav>
      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
        <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "flex-start" }}>
          <LogOut size={16} /> Salir (Meta)
        </button>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/comments" element={<Comments />} />
            <Route path="/giveaways" element={<Giveaways />} />
            <Route path="/scheduler" element={<Scheduler />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
