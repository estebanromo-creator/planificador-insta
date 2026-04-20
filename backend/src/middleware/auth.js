/**
 * Middleware de API Key
 * Todas las rutas deben incluir el header: x-api-key: <API_KEY>
 * La clave se define en el .env del backend y en el .env del frontend.
 */
export function requireApiKey(req, res, next) {
  const key = req.headers["x-api-key"];

  if (!process.env.API_KEY) {
    // Si no hay API_KEY configurada, se permite el acceso (modo desarrollo)
    console.warn("[AUTH] API_KEY no configurada. Las rutas están abiertas.");
    return next();
  }

  if (!key || key !== process.env.API_KEY) {
    return res.status(401).json({ error: "No autorizado. API Key inválida o ausente." });
  }

  next();
}

/**
 * Middleware de contraseña de Admin
 * Solo para rutas /api/admin/*
 * Espera: { adminPassword: "..." } en el body de la petición
 */
export function requireAdminPassword(req, res, next) {
  const { adminPassword } = req.body;

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: "ADMIN_PASSWORD no configurada en el servidor." });
  }

  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Contraseña de administrador incorrecta." });
  }

  next();
}
