
const API_BASE_URL = 'http://localhost:3000/api';

export async function loginAdmin(credentials) {
  const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Admin login failed');
  }

  return data;
}

export async function getAdminProfile(token) {
  const response = await fetch(`${API_BASE_URL}/admin/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Unable to load admin profile');
  }

  return data;
}
