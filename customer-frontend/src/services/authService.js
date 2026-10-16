
const API_BASE_URL = 'http://localhost:3000/api';

async function request(endpoint, body, token) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`,
    );
  }

  return data;
}

export function registerCustomer(details) {
  return request('/auth/register', details);
}

export function loginCustomer(credentials) {
  return request('/auth/login', credentials);
}

export function getCurrentCustomer(token) {
  return request('/auth/me', null, token);
}
