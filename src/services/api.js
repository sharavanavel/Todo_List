// ============================================================
// api.js — talks to the backend (which talks to MongoDB).
// In development, Vite proxies "/api" to http://localhost:5000
// (see vite.config.js), so BASE can stay empty.
// If your API is hosted on a DIFFERENT domain than the frontend,
// set VITE_API_URL at build time, e.g. https://my-api.onrender.com
// ============================================================
const BASE = `${import.meta.env.VITE_API_URL || ""}/api/tasks`;

async function request(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.status === 204 ? null : res.json();
}

export const fetchTasks = () => request(BASE);
export const createTask = (task) => request(BASE, { method: "POST", body: JSON.stringify(task) });
export const patchTask = (id, changes) => request(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(changes) });
export const removeTask = (id) => request(`${BASE}/${id}`, { method: "DELETE" });
