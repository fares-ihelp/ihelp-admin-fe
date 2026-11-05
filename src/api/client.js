import axios from 'axios';

// All API and Server URLs are strictly loaded from environment variables (.env)
export const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const SERVER_HOST = import.meta.env.VITE_SERVER_URL || (BASE_URL ? BASE_URL.replace(/\/api\/admin\/?$/, '') : '');
export const APP_URL = import.meta.env.VITE_APP_URL;

const TOKEN_KEY = 'ihelp_admin_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Central place to react to auth failures — any 401 clears the stored
// token and bounces to /login, without every call site needing to handle it.
let onUnauthorized = () => {};
export const registerUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearToken();
      onUnauthorized();
    }
    return Promise.reject(err);
  }
);

export default api;
