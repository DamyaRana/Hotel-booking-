<script setup>
import { ref, onMounted } from 'vue';
import {
  getAdminHotels,
  createHotel,
  updateHotel,
  deleteHotel,
} from './services/hotelService';

const API_BASE_URL = 'http://localhost:3000/api';

const email = ref('');
const password = ref('');
const admin = ref(null);
const token = ref(localStorage.getItem('adminAccessToken') || '');

const hotels = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');
const editingId = ref(null);

const emptyForm = () => ({
  name: '',
  city: '',
  address: '',
  description: '',
  totalRooms: 1,
});

const form = ref(emptyForm());

async function login() {
  error.value = '';
  success.value = '';

  try {
    const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || 'Admin login failed');
    }

    const accessToken = data.accessToken;

    if (!accessToken) {
      throw new Error('The login response did not contain an access token');
    }

    // Verify the token before saving it.
    const profileResponse = await fetch(`${API_BASE_URL}/admin/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await profileResponse.json().catch(() => null);

    if (!profileResponse.ok) {
      throw new Error(profile?.message || 'Could not verify admin account');
    }

    localStorage.setItem('adminAccessToken', accessToken);
    token.value = accessToken;
    admin.value = profile;
    password.value = '';

    await loadHotels();
  } catch (err) {
    error.value = err.message || 'Unable to log in';
  }
}

async function restoreSession() {
  if (!token.value) return;

  try {
    const response = await fetch(`${API_BASE_URL}/admin/auth/me`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    const profile = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error('Session expired');
    }

    admin.value = profile;
    await loadHotels();
  } catch {
    logout(false);
  }
}

function logout(showMessage = true) {
  localStorage.removeItem('adminAccessToken');
  token.value = '';
  admin.value = null;
  hotels.value = [];
  form.value = emptyForm();
  editingId.value = null;
  error.value = '';
  success.value = showMessage ? 'You have been logged out.' : '';
}

async function loadHotels() {
  loading.value = true;
  error.value = '';

  try {
    hotels.value = await getAdminHotels();
  } catch (err) {
    error.value = err.message || 'Could not load hotels';
  } finally {
    loading.value = false;
  }
}

function startEdit(hotel) {
  editingId.value = hotel.id;

  form.value = {
    name: hotel.name,
    city: hotel.city,
    address: hotel.address,
    description: hotel.description,
    totalRooms: 1,
  };

  error.value = '';
  success.value = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
  editingId.value = null;
  form.value = emptyForm();
  error.value = '';
  success.value = '';
}

async function saveHotel() {
  error.value = '';
  success.value = '';

  const payload = {
    name: form.value.name.trim(),
    city: form.value.city.trim(),
    address: form.value.address.trim(),
    description: form.value.description.trim(),
  };

  if (
    !payload.name ||
    !payload.city ||
    !payload.address ||
    !payload.description
  ) {
    error.value = 'Please fill in all four hotel fields.';
    return;
  }

  // Only new hotels need the totalRooms field.
  if (editingId.value === null) {
    const totalRooms = Number(form.value.totalRooms);

    if (
      !Number.isInteger(totalRooms) ||
      totalRooms < 1 ||
      totalRooms > 500
    ) {
      error.value = 'Total rooms must be between 1 and 500.';
      return;
    }

    payload.totalRooms = totalRooms;
  }

  saving.value = true;

  try {
    if (editingId.value !== null) {
      await updateHotel(editingId.value, payload);
      success.value = 'Hotel updated successfully.';
    } else {
      await createHotel(payload);
      success.value = 'Hotel and rooms created successfully.';
    }

    form.value = emptyForm();
    editingId.value = null;
    await loadHotels();
  } catch (err) {
    error.value = err.message || 'Could not save hotel';
  } finally {
    saving.value = false;
  }
}
async function removeHotel(hotel) {
  const confirmed = window.confirm(
    `Delete "${hotel.name}"? This cannot be undone if the database permits deletion.`,
  );

  if (!confirmed) return;

  error.value = '';
  success.value = '';

  try {
    await deleteHotel(hotel.id);

    if (editingId.value === hotel.id) {
      cancelEdit();
    }

    success.value = 'Hotel deleted successfully.';
    await loadHotels();
  } catch (err) {
    error.value = err.message || 'Could not delete hotel';
  }
}

onMounted(restoreSession);
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div>
        <h1>StayFinder Admin</h1>
        <p>Hotel management dashboard</p>
      </div>

      <button
        v-if="admin"
        class="button button-outline"
        @click="logout()"
      >
        Logout
      </button>
    </header>

    <main class="container">
      <section v-if="!admin" class="login-card">
        <h2>Admin Login</h2>
        <p class="muted">Sign in to manage hotel listings.</p>

        <form @submit.prevent="login">
          <label for="email">Email</label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            autocomplete="username"
            required
          />

          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />

          <button class="button" type="submit">Login</button>
        </form>
      </section>

      <section v-else>
        <div class="welcome">
          <div>
            <h2>Manage Hotels</h2>
            <p class="muted">
              Signed in as {{ admin.name || admin.email || 'Administrator' }}
            </p>
          </div>

          <button
            class="button button-outline"
            :disabled="loading"
            @click="loadHotels"
          >
            Refresh
          </button>
        </div>

        <section class="card">
          <h3>{{ editingId !== null ? 'Edit Hotel' : 'Add New Hotel' }}</h3>

          <form @submit.prevent="saveHotel">
            <div class="form-grid">
              <div>
                <label for="hotel-name">Hotel name</label>
                <input
                  id="hotel-name"
                  v-model="form.name"
                  maxlength="150"
                  required
                />
              </div>

              <div>
                <label for="hotel-city">City</label>
                <input
                  id="hotel-city"
                  v-model="form.city"
                  maxlength="100"
                  required
                />
              </div>
            </div>

<div v-if="editingId === null">
  <label for="hotel-total-rooms">Total rooms</label>
  <input
    id="hotel-total-rooms"
    v-model.number="form.totalRooms"
    type="number"
    min="1"
    max="500"
    step="1"
    required
  />
  <small class="muted">
    Each room will initially have a capacity of 2 guests
    and cost ₹2,000 per night.
  </small>
</div>
            <label for="hotel-address">Address</label>
            <input
              id="hotel-address"
              v-model="form.address"
              maxlength="1000"
              required
            />

            <label for="hotel-description">Description</label>
            <textarea
              id="hotel-description"
              v-model="form.description"
              maxlength="5000"
              rows="4"
              required
            />

            <div class="actions">
              <button class="button" type="submit" :disabled="saving">
                {{
                  saving
                    ? 'Saving...'
                    : editingId !== null
                      ? 'Save Changes'
                      : 'Add Hotel'
                }}
              </button>

              <button
                v-if="editingId !== null"
                class="button button-outline"
                type="button"
                @click="cancelEdit"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>

        <section class="hotel-section">
          <h3>Hotel Listings ({{ hotels.length }})</h3>

          <p v-if="loading" class="muted">Loading hotels...</p>

          <p v-else-if="hotels.length === 0" class="muted">
            No hotels found. Add your first hotel above.
          </p>

          <div v-else class="hotel-list">
            <article
              v-for="hotel in hotels"
              :key="hotel.id"
              class="hotel-card"
            >
              <div class="hotel-details">
                <h4>{{ hotel.name }}</h4>
                <p class="muted">{{ hotel.city }}</p>
                <p>{{ hotel.address }}</p>
                <p>{{ hotel.description }}</p>
                <small class="muted">
                  Hotel ID: {{ hotel.id }} · Rooms:
                  {{ hotel._count?.rooms ?? '—' }}
                </small>
              </div>

              <div class="actions hotel-actions">
                <button
                  class="button button-outline"
                  @click="startEdit(hotel)"
                >
                  Edit
                </button>

                <button
                  class="button button-danger"
                  @click="removeHotel(hotel)"
                >
                  Delete
                </button>
              </div>
            </article>
          </div>
        </section>
      </section>

      <p v-if="error" class="message error" role="alert">
        {{ error }}
      </p>

      <p v-if="success" class="message success" role="status">
        {{ success }}
      </p>
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f4f6fa;
  color: #202938;
}

button,
input,
textarea {
  font: inherit;
}

.app {
  min-height: 100vh;
}

.topbar {
  background: #172554;
  color: white;
  padding: 20px 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.topbar h1 {
  margin: 0 0 5px;
  font-size: 24px;
}

.topbar p {
  margin: 0;
  color: #dbeafe;
}

.container {
  max-width: 1100px;
  width: 92%;
  margin: 32px auto;
}

.login-card,
.card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 3px 14px #17255412;
}

.login-card {
  max-width: 430px;
  margin: 50px auto;
}

h2,
h3,
h4 {
  margin-top: 0;
}

.muted {
  color: #64748b;
}

form label {
  display: block;
  margin: 16px 0 7px;
  font-weight: 600;
  font-size: 14px;
}


input,
textarea {
  display: block;
  width: 100%;
  padding: 11px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  background: #ffffff;
  color: #202938;
  caret-color: #202938;
}

input::placeholder,
textarea::placeholder {
  color: #64748b;
  opacity: 1;
}


select,
option {
  color: #202938;
  background-color: #ffffff;
}


textarea {
  resize: vertical;
}

.button {
  border: 1px solid #1d4ed8;
  border-radius: 7px;
  padding: 10px 15px;
  background: #1d4ed8;
  color: white;
  cursor: pointer;
}

form > .button {
  margin-top: 20px;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-outline {
  background: white;
  color: #1d4ed8;
}

.button-danger {
  background: #b91c1c;
  border-color: #b91c1c;
}

.welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.welcome h2 {
  margin-bottom: 6px;
}

.welcome p {
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.hotel-section {
  margin-top: 32px;
}

.hotel-list {
  display: grid;
  gap: 16px;
}

.hotel-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.hotel-details {
  min-width: 0;
}

.hotel-details h4 {
  margin-bottom: 8px;
}

.hotel-details p {
  overflow-wrap: anywhere;
}

.hotel-actions {
  margin-top: 0;
  flex-shrink: 0;
}

.message {
  padding: 12px 15px;
  margin-top: 20px;
  border-radius: 8px;
  overflow-wrap: anywhere;
}

.error {
  color: #991b1b;
  background: #fee2e2;
}

.success {
  color: #166534;
  background: #dcfce7;
}

@media (max-width: 650px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .hotel-card {
    flex-direction: column;
  }

  .welcome {
    align-items: flex-start;
  }
}
</style>
