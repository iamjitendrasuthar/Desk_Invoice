// services/notificationService.js  (Frontend — Next.js)

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

export const fetchNotifications = async () => {
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return { notifications: json.data, unreadCount: json.unreadCount };
};

export const markOneRead = async (id) => {
  await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(),
  });
};

export const markAllRead = async () => {
  await fetch(`${API_BASE}/notifications/read-all`, {
    method: "PATCH",
    headers: authHeaders(),
  });
};

export const deleteNotification = async (id) => {
  await fetch(`${API_BASE}/notifications/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
};

export const clearReadNotifications = async () => {
  await fetch(`${API_BASE}/notifications/clear-read`, {
    method: "DELETE",
    headers: authHeaders(),
  });
};
