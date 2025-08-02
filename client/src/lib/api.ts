import axios from "axios";

// This will be your Vercel URL in production, or localhost in development
const baseURL = import.meta.env.PROD ? "/api" : "http://localhost:3001/api";
export const apiClient = axios.create({ baseURL });
