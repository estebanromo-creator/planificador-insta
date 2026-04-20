import { useState, useEffect } from "react";
import { getTokenStatus, adminLogin, saveMetaToken } from "../services/api";
import { ShieldCheck, KeyRound, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, Loader } from "lucide-react";

export default function AdminConfig() {
  // Paso 1: Login de admin | Paso 2: Configuración token
  const [step, setStep] = useState(1);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [metaToken, setMetaToken] = useState("");
  const [metaAccountId, setMetaAccountId] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");

  const [tokenStatus, setTokenStatus] = useState(null);

  useEffect(() => {
    getTokenStatus()
      .then(setTokenStatus)
      .catch(() => setTokenStatus({ configured: false }));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      await adminLogin(adminPassword);
      setStep(2);
    } catch {
      setLoginError("Contraseña incorrecta. Inténtalo de nuevo.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSaveToken = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    setSaveError("");
    try {
      await saveMetaToken(adminPassword, metaToken, metaAccountId);
      setSaveMsg("✅ Token guardado correctamente. La app ya puede acceder a Instagram.");
      setTokenStatus({ configured: true, masked: metaToken.substring(0, 6) + "..." + metaToken.slice(-4), accountId: metaAccountId });
      setMetaToken("");
    } catch (err) {
      setSaveError(err.response?.data?.error || "Error al guardar el token.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">
          <ShieldCheck size={28} style={{ display: "inline", marginRight: "0.5rem", color: "var(--primary-color)" }} />
          Configuración Avanzada
        </h1>
      </div>

      {/* Estado actual del token */}
      <div className="card" style={{ maxWidth: "640px", marginBottom: "2rem" }}>
        <h2 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem" }}>
          <KeyRound size={18} color="var(--primary-color)" /> Estado del Token Meta
        </h2>
        {tokenStatus === null ? (
          <p style={{ color: "var(--text-muted)" }}>Comprobando...</p>
        ) : tokenStatus.configured ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", background: "rgba(16,185,129,0.1)", borderRadius: "10px", border: "1px solid rgba(16,185,129,0.3)" }}>
            <CheckCircle size={22} color="#10b981" />
            <div>
              <p style={{ color: "#10b981", fontWeight: "600", margin: 0 }}>Token configurado</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.15rem 0 0" }}>
                Token: <code>{tokenStatus.masked}</code> &nbsp;·&nbsp; Cuenta ID: {tokenStatus.accountId}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", background: "rgba(239,68,68,0.08)", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.25)" }}>
            <AlertCircle size={22} color="#ef4444" />
            <div>
              <p style={{ color: "#ef4444", fontWeight: "600", margin: 0 }}>Token no configurado</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.15rem 0 0" }}>La app funciona en modo simulación. Configura el token para datos reales.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── PASO 1: Login Admin ── */}
      {step === 1 && (
        <div className="card" style={{ maxWidth: "640px" }}>
          <h2 style={{ marginBottom: "0.5rem" }}>Acceso de Administrador</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            Introduce la contraseña de administrador para modificar la configuración.
          </p>
          <form onSubmit={handleLogin}>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Contraseña de Admin</label>
            <div style={{ position: "relative", marginBottom: "1rem" }}>
              <input
                type={showPass ? "text" : "password"}
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: "100%", padding: "0.75rem 3rem 0.75rem 1rem",
                  borderRadius: "10px", border: "1px solid var(--border-color)",
                  background: "var(--secondary-color)", color: "var(--text-main)",
                  fontSize: "1rem", boxSizing: "border-box"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {loginError && <p style={{ color: "#ef4444", marginBottom: "1rem", fontWeight: "500" }}>{loginError}</p>}
            <button className="btn btn-primary" type="submit" disabled={loginLoading} style={{ width: "100%" }}>
              {loginLoading ? <Loader size={18} style={{ animation: "spin 1s linear infinite" }} /> : <><ArrowRight size={18} /> Acceder</>}
            </button>
          </form>
        </div>
      )}

      {/* ── PASO 2: Configurar Token ── */}
      {step === 2 && (
        <div className="card" style={{ maxWidth: "640px" }}>
          <h2 style={{ marginBottom: "0.5rem" }}>Configurar Token de Meta</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            Introduce el <strong>Access Token</strong> de Meta Business y el <strong>ID de tu cuenta de Instagram</strong>.{" "}
            <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-color)" }}>
              ¿Cómo obtenerlo?
            </a>
          </p>
          <form onSubmit={handleSaveToken}>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Meta Access Token</label>
            <div style={{ position: "relative", marginBottom: "1.25rem" }}>
              <input
                type={showToken ? "text" : "password"}
                value={metaToken}
                onChange={e => setMetaToken(e.target.value)}
                placeholder="EAAxxxxxxxxxxxxxxxx..."
                required
                style={{
                  width: "100%", padding: "0.75rem 3rem 0.75rem 1rem",
                  borderRadius: "10px", border: "1px solid var(--border-color)",
                  background: "var(--secondary-color)", color: "var(--text-main)",
                  fontSize: "0.9rem", fontFamily: "monospace", boxSizing: "border-box"
                }}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>ID de Cuenta de Instagram</label>
            <input
              type="text"
              value={metaAccountId}
              onChange={e => setMetaAccountId(e.target.value)}
              placeholder="17841xxxxxxxx"
              required
              style={{
                width: "100%", padding: "0.75rem 1rem", marginBottom: "1.5rem",
                borderRadius: "10px", border: "1px solid var(--border-color)",
                background: "var(--secondary-color)", color: "var(--text-main)",
                fontSize: "0.9rem", fontFamily: "monospace", boxSizing: "border-box"
              }}
            />

            {saveMsg && (
              <div style={{ padding: "0.75rem 1rem", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "10px", color: "#10b981", marginBottom: "1rem" }}>
                {saveMsg}
              </div>
            )}
            {saveError && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{saveError}</p>}

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>Cancelar</button>
              <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
                {saving ? "Guardando..." : "Guardar Token"}
              </button>
            </div>
          </form>

          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(99,102,241,0.07)", borderRadius: "10px", border: "1px solid rgba(99,102,241,0.2)", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            <strong style={{ color: "var(--text-main)" }}>🔒 Seguridad:</strong> El token se guarda cifrado en la base de datos Supabase.
            Nunca aparece en el código fuente ni en el repositorio.
            Solo los administradores con la contraseña pueden modificarlo.
          </div>
        </div>
      )}
    </div>
  );
}
