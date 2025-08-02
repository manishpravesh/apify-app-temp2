import axios from "axios";

// This is the base client, configured for production and local development
const baseURL = import.meta.env.PROD ? "/api" : "http://localhost:3001/api";

export const apiClient = axios.create({ baseURL });

// This helper function sets the API key as a default header for all future requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common["x-apify-key"] = token;
  } else {
    delete apiClient.defaults.headers.common["x-apify-key"];
  }
};
