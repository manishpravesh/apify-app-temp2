import axios from "axios";
// changed from locHost to
const baseURL = import.meta.env.PROD ? "/api" : "http://localhost:3001/api";
export const apiClient = axios.create({ baseURL });
