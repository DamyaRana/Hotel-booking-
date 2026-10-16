
const API_BASE_URL = 'http://localhost:3000/api';

export async function getHotels() {
  const response = await fetch(`${API_BASE_URL}/hotels`);

  if (!response.ok) {
    throw new Error(`Failed to fetch hotels (${response.status})`);
  }

  return response.json();
}

export async function getHotelById(id) {
  const response = await fetch(`${API_BASE_URL}/hotels/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch hotel (${response.status})`);
  }

  return response.json();
}

export async function getHotelRooms(id) {
  const response = await fetch(`${API_BASE_URL}/hotels/${id}/rooms`);

  if (!response.ok) {
    throw new Error(`Failed to fetch rooms (${response.status})`);
  }

  return response.json();
}
