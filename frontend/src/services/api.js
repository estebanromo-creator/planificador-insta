import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api"
});

export const getDashboardData = () => API.get("/dashboard").then(res => res.data);
export const getPosts = () => API.get("/posts").then(res => res.data);
export const getComments = (postId) => API.get(`/comments/${postId}`).then(res => res.data);
export const drawGiveaway = (postId, allowDuplicates) => API.post("/giveaway/draw", { postId, allowDuplicates }).then(res => res.data);

export default API;
