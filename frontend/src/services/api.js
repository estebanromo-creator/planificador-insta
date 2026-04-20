import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "x-api-key": import.meta.env.VITE_API_KEY || ""
  }
});

// Dashboard
export const getDashboardData = () => API.get("/dashboard").then(r => r.data);

// Posts
export const getPosts = () => API.get("/posts").then(r => r.data);

// Comentarios
export const getComments = (postId) => API.get(`/comments/${postId}`).then(r => r.data);

// Sorteos
export const getGiveawayParticipants = (postId) => API.get(`/giveaway/participants/${postId}`).then(r => r.data);
export const drawGiveaway = (postId, mentioners, manualLikers) =>
  API.post("/giveaway/draw", { postId, mentioners, manualLikers }).then(r => r.data);
export const getGiveawayHistory = () => API.get("/giveaway/history").then(r => r.data);

// Admin — token Meta
export const getTokenStatus = () => API.get("/admin/token/status").then(r => r.data);
export const adminLogin = (adminPassword) =>
  axios.post(
    `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/admin/login`,
    { adminPassword }
  ).then(r => r.data);
export const saveMetaToken = (adminPassword, metaToken, metaAccountId) =>
  API.post("/admin/token", { adminPassword, metaToken, metaAccountId }).then(r => r.data);

export default API;

