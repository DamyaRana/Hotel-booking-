const API_BASE_URL = 'http://localhost:3000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('adminAccessToken');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message || 'Request failed';

    throw new Error(message);
  }

  return data;
}

export function getAdminHotels() {
  return request('/admin/hotels');
}

export function createHotel(hotel) {
  return request('/admin/hotels', {
    method: 'POST',
    body: JSON.stringify(hotel),
  });
}

export function updateHotel(id, hotel) {
  return request(`/admin/hotels/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(hotel),
  });
}

export function deleteHotel(id) {
  return request(`/admin/hotels/${id}`, {
    method: 'DELETE',
  });
}