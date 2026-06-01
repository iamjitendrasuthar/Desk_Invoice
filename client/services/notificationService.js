// services/notificationService.js

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const getToken = () => {
  // localStorage is not available during SSR
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const authHeaders = () => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Call this before rendering notification UI
export const isAuthenticated = () => !!getToken();

const handleResponse = async (res) => {
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json;
};

export const fetchNotifications = async () => {
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: authHeaders(),
  });
  const json = await handleResponse(res);
  return { notifications: json.data, unreadCount: json.unreadCount };
};

export const markOneRead = async (id) => {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  await handleResponse(res);
};

export const markAllRead = async () => {
  const res = await fetch(`${API_BASE}/notifications/read-all`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  await handleResponse(res);
};

export const deleteNotification = async (id) => {
  const res = await fetch(`${API_BASE}/notifications/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await handleResponse(res);
};

export const clearReadNotifications = async () => {
  const res = await fetch(`${API_BASE}/notifications/clear-read`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await handleResponse(res);
};
