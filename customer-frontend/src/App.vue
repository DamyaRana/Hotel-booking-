
<script setup>
import { onMounted, ref, computed } from 'vue';
import { getHotels, getHotelById } from './services/hotelService';
import {
  registerCustomer,
  loginCustomer,
  getCurrentCustomer,
} from './services/authService';
const hotels = ref([]);
const selectedHotel = ref(null);

const roomCount = ref(1);
const availabilityLoading = ref(false);

const availabilityResult = ref(null);
const availabilityError = ref('');
const searchCity = ref('');
const checkIn = ref('');
const checkOut = ref('');

const bookingLoading = ref(false);
const bookingResult = ref(null);
const bookingError = ref('');

const loading = ref(true);
const detailsLoading = ref(false);
const error = ref('');

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const today = localDateString(new Date());

const filteredHotels = computed(() => {
  const city = searchCity.value.trim().toLowerCase();

  if (!city) return hotels.value;

  return hotels.value.filter((hotel) =>
    hotel.city.toLowerCase().includes(city),
  );
});

const nights = computed(() => {
  if (!checkIn.value || !checkOut.value) return 0;

  const start = new Date(`${checkIn.value}T00:00:00`);
  const end = new Date(`${checkOut.value}T00:00:00`);

  return Math.round((end - start) / 86400000);
});

const totalPrice = computed(() =>
  availabilityResult.value?.estimatedTotal != null
    ? Number(availabilityResult.value.estimatedTotal)
    : 0
);

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(price));
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    const scriptUrl =
      'https://checkout.razorpay.com/v1/checkout.js';

    if (document.querySelector(`script[src="${scriptUrl}"]`)) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

async function startCheckout(hotelId) {
  if (!checkIn.value || !checkOut.value || roomCount.value < 1) {
    alert('Select valid check-in, check-out, and room count.');
    return;
  }

  const loaded = await loadRazorpayScript();

  if (!loaded) {
    alert('Unable to load Razorpay Checkout. Please try again.');
    return;
  }

  try {
    const holdResponse = await fetch(
      'http://localhost:3000/api/bookings/checkout/hold',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          hotelId,
          checkIn: checkIn.value,
          checkOut: checkOut.value,
          roomCount: Number(roomCount.value),
        }),
      },
    );

    const checkout = await holdResponse.json();

    if (!holdResponse.ok) {
      throw new Error(checkout.message || 'Unable to hold rooms.');
    }

    const options = {
      key: checkout.razorpayKeyId,
      amount: checkout.amount,
      currency: checkout.currency,
      name: 'Hotel Booking',
      description: `${checkout.roomCount} room(s)`,
      order_id: checkout.razorpayOrderId,

      handler: async (response) => {
        const verificationResponse = await fetch(
          'http://localhost:3000/api/bookings/checkout/verify',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify({
              checkoutId: checkout.checkoutId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          },
        );

        const result = await verificationResponse.json();

        if (!verificationResponse.ok) {
          alert(
            result.message ||
              'Payment verification failed. Contact support if money was deducted.',
          );
          return;
        }

        alert('Payment verified and booking confirmed!');
        // Refresh your bookings list here if your app has one.
      },

      modal: {
        ondismiss: () => {
          alert(
            'Checkout closed. Your room hold may remain active for up to 10 minutes.',
          );
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : 'Unable to start checkout.',
    );
  }
}

async function loadHotels() {
  loading.value = true;
  error.value = '';

  try {
    hotels.value = await getHotels();
  } catch (err) {
    console.error(err);
    error.value = 'Unable to load hotels. Check the backend connection.';
  } finally {
    loading.value = false;
  }
}

const API_BASE_URL = 'http://localhost:3000/api';

async function openHotel(hotel) {
  selectedHotel.value = null;
  availabilityResult.value = null;
  availabilityError.value = '';
  roomCount.value = 1;
  detailsLoading.value = true;
  error.value = '';

  try {
    selectedHotel.value = await getHotelById(hotel.id);
  } catch (err) {
    console.error(err);
    error.value = 'Unable to load hotel details. Please try again.';
  } finally {
    detailsLoading.value = false;
  }
}

function goBack() {
  selectedHotel.value = null;
  availabilityResult.value = null;
  availabilityError.value = '';
  error.value = '';
}



const authMode = ref('login');
const authName = ref('');
const authEmail = ref('');
const authPassword = ref('');

const currentCustomer = ref(null);
const authLoading = ref(false);
const authError = ref('');
const authMessage = ref('');

async function submitAuth() {
  authLoading.value = true;
  authError.value = '';
  authMessage.value = '';

  try {
    if (authMode.value === 'register') {
      const result = await registerCustomer({
        name: authName.value,
        email: authEmail.value,
        password: authPassword.value,
      });

      authMessage.value = result.message || 'Registration successful';

      // Switch to login after registering.
      authMode.value = 'login';
      authPassword.value = '';
      return;
    }

    const result = await loginCustomer({
      email: authEmail.value,
      password: authPassword.value,
    });

    // Store the short-lived access token for this development app.
    localStorage.setItem('accessToken', result.accessToken);

    currentCustomer.value = await getCurrentCustomer(
      result.accessToken,
    );

    authPassword.value = '';
    authMessage.value = 'Login successful';
  } catch (err) {
    authError.value = err.message || 'Authentication failed';
  } finally {
    authLoading.value = false;
  }
}

async function restoreSession() {
  const token = localStorage.getItem('accessToken');

  if (!token) return;

  try {
    currentCustomer.value = await getCurrentCustomer(token);
  } catch {
    localStorage.removeItem('accessToken');
    currentCustomer.value = null;
  }
}

function logoutCustomer() {
  localStorage.removeItem('accessToken');
  currentCustomer.value = null;
  authPassword.value = '';
  authMessage.value = 'You have logged out.';
}

const validDates = computed(() => {
  return (
    checkIn.value >= today &&
    checkOut.value > checkIn.value &&
    nights.value > 0
  );
});

async function checkAvailability() {
  availabilityError.value = '';
  availabilityResult.value = null;

  if (!selectedHotel.value) {
    availabilityError.value = 'Please select a hotel.';
    return;
  }

  if (!validDates.value) {
    availabilityError.value =
      'Choose a valid check-in and check-out date.';
    return;
  }

  if (!Number.isInteger(Number(roomCount.value)) ||
      Number(roomCount.value) < 1 ||
      Number(roomCount.value) > 20) {
    availabilityError.value =
      'Choose between 1 and 20 rooms.';
    return;
  }


  availabilityLoading.value = true;

  try {
    const response = await fetch(
      `${API_BASE_URL}/bookings/check-availability`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('accessToken')
            ? { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            : {}),
        },
        body: JSON.stringify({
          hotelId: Number(selectedHotel.value.id),
          checkIn: checkIn.value,
          checkOut: checkOut.value,
          roomCount: Number(roomCount.value),
        }),
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message || 'Could not check room availability.'
      );
    }

    availabilityResult.value = data;
  } catch (err) {
    availabilityError.value =
      err.message || 'Unable to check availability.';
  } finally {
    availabilityLoading.value = false;
  }
}

async function createBooking() {
  bookingError.value = '';
  bookingResult.value = null;

  const token = localStorage.getItem('accessToken');

  if (!currentCustomer.value || !token) {
    bookingError.value = 'Please log in before booking.';
    return;
  }

  if (!availabilityResult.value?.available) {
    bookingError.value = 'Please check room availability first.';
    return;
  }

  if (!validDates.value) {
    bookingError.value = 'Please select valid check-in and check-out dates.';
    return;
  }

  bookingLoading.value = true;

  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        hotelId: Number(selectedHotel.value.id),
        checkIn: checkIn.value,
        checkOut: checkOut.value,
        roomCount: Number(roomCount.value),
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message || 'Unable to create booking. Please check availability again.',
      );
    }

    bookingResult.value = data;
    availabilityResult.value = null;
  } catch (err) {
    bookingError.value = err.message || 'Unable to create booking.';
  } finally {
    bookingLoading.value = false;
  }
}

onMounted(() => {
  loadHotels();
  restoreSession();
});
</script>

<template>
  <main class="page">
    <header class="navbar">
      <button class="brand" @click="goBack">StayFinder</button>
      <span>Find your next stay</span>

    </header>

<section class="auth-panel">
  <template v-if="!currentCustomer">
    <h2>
      {{ authMode === 'login' ? 'Welcome back' : 'Create your account' }}
    </h2>

    <p class="muted">
      {{ authMode === 'login'
        ? 'Log in to continue planning your stay.'
        : 'Register as a customer to get started.' }}
    </p>

    <form @submit.prevent="submitAuth">
      <label v-if="authMode === 'register'">
        Full name
        <input
          v-model.trim="authName"
          type="text"
          required
          minlength="2"
          maxlength="100"
          autocomplete="name"
          placeholder="Your name"
        />
      </label>

      <label>
        Email address
        <input
          v-model.trim="authEmail"
          type="email"
          required
          maxlength="254"
          autocomplete="email"
          placeholder="you@example.com"
        />
      </label>

      <label>
        Password
        <input
          v-model="authPassword"
          type="password"
          required
          :minlength="authMode === 'register' ? 8 : 1"
          :maxlength="72"
          :autocomplete="authMode === 'login'
            ? 'current-password'
            : 'new-password'"
          placeholder="Enter your password"
        />
      </label>

      <p v-if="authError" class="error" role="alert">
        {{ authError }}
      </p>

      <p v-if="authMessage" role="status">
        {{ authMessage }}
      </p>

      <button type="submit" :disabled="authLoading">
        {{ authLoading
          ? 'Please wait...'
          : authMode === 'login'
            ? 'Log in'
            : 'Create account' }}
      </button>
    </form>

    <p>
      {{ authMode === 'login'
        ? "Don't have an account?"
        : 'Already have an account?' }}

      <button
        class="text-button"
        type="button"
        @click="
          authMode = authMode === 'login' ? 'register' : 'login';
          authError = '';
          authMessage = '';
        "
      >
        {{ authMode === 'login' ? 'Register' : 'Log in' }}
      </button>
    </p>
  </template>

  <template v-else>
    <h2>Welcome, {{ currentCustomer.name }}!</h2>
    <p>{{ currentCustomer.email }}</p>
    <p class="muted">You are logged in as a customer.</p>
    <button type="button" @click="logoutCustomer">
      Log out
    </button>
  </template>
</section>


    <section class="hero">
      <p class="eyebrow">YOUR NEXT GETAWAY</p>
      <h1>Find a place to stay.</h1>
      <p>Explore hotels and choose a room for your next trip.</p>

      <div class="search-bar">
        <label>
          Destination
          <input
            v-model="searchCity"
            type="text"
            placeholder="Search city, e.g. Delhi"
          />
        </label>

        <label>
          Check-in
          <input
            v-model="checkIn"
            type="date"
            :min="today"
          />
        </label>

        <label>
          Check-out
          <input
            v-model="checkOut"
            type="date"
            :min="checkIn || today"
          />
        </label>

      </div>
    </section>

    <section class="results">
      <button
        v-if="selectedHotel"
        class="back-button"
        @click="goBack"
      >
        ← Back to hotels
      </button>

      <p v-if="loading">Loading hotels...</p>
      <p v-else-if="detailsLoading">Loading hotel details...</p>

      <p v-if="error" class="error">{{ error }}</p>

      <template v-if="!selectedHotel && !loading && !error">
        <h2>Explore hotels</h2>
        <p class="muted">
          {{ filteredHotels.length }} hotel(s) found
        </p>

        <div v-if="filteredHotels.length" class="hotel-grid">
          <article
            v-for="hotel in filteredHotels"
            :key="hotel.id"
            class="hotel-card"
          >
            <div class="hotel-image">
              {{ hotel.name.charAt(0).toUpperCase() }}
            </div>

            <div class="hotel-info">
              <p class="city">{{ hotel.city }}</p>
              <h3>{{ hotel.name }}</h3>
              <p>{{ hotel.description }}</p>
              <p class="address">{{ hotel.address }}</p>

              <button @click="openHotel(hotel)">
                View rooms
              </button>
            </div>
          </article>
        </div>

        <p v-else>No hotels found. Try another city.</p>
      </template>

      <template v-if="selectedHotel && !detailsLoading">
        <p class="city">{{ selectedHotel.city }}</p>
        <h2>{{ selectedHotel.name }}</h2>
        <p>{{ selectedHotel.description }}</p>
        <p class="address">{{ selectedHotel.address }}</p>

        <div class="room-layout">

<section class="room-pricing">
  <h3>Room pricing</h3>

  <template v-if="selectedHotel.rooms?.length">
    <h2>
      {{ formatPrice(selectedHotel.rooms[0].pricePerNight) }}
    </h2>
    <p class="muted">Per room / night</p>
  </template>

  <p v-else>
    No room pricing has been configured for this hotel yet.
  </p>
</section>


  <aside class="booking-card">
    <h3>Check availability</h3>

    <label>
      Check-in
      <input
        v-model="checkIn"
        type="date"
        :min="today"
        required
        @change="availabilityResult = null"
      />
    </label>

    <label>
      Check-out
      <input
        v-model="checkOut"
        type="date"
        :min="checkIn || today"
        required
        @change="availabilityResult = null"
      />
    </label>

    <label>
      Number of rooms
      <input
        v-model.number="roomCount"
        type="number"
        min="1"
        max="20"
        step="1"
        required
        @change="availabilityResult = null"
      />
    </label>


    <p>
      Stay duration:
      {{ validDates ? `${nights} night(s)` : 'Select valid dates' }}
    </p>

    <button
      type="button"
      :disabled="availabilityLoading"
      @click="checkAvailability"
    >
      {{
        availabilityLoading
          ? 'Checking...'
          : 'Check Availability'
      }}
    </button>

    <p
      v-if="availabilityError"
      class="error"
      role="alert"
    >
      {{ availabilityError }}
    </p>

    <section
      v-if="availabilityResult"
      class="availability-result"
      aria-live="polite"
    >
      <template v-if="availabilityResult.available">
        <h4>Rooms available!</h4>

        <p>
          Available rooms:
          {{ availabilityResult.availableRoomCount }}
        </p>

        <p>
          Rooms requested: {{ roomCount }}
        </p>


        <p v-if="availabilityResult.estimatedTotal != null">
          Estimated total:
          <strong>{{ formatPrice(totalPrice) }}</strong>
        </p>


<p class="muted">
  Availability is not a reservation. Your booking will be rechecked before it is created.
</p>


<button
  type="button"
  :disabled="bookingLoading || !currentCustomer"
  @click="startCheckout(selectedHotel.id)"
>
  {{
    bookingLoading
      ? 'Opening checkout...'
      : !currentCustomer
        ? 'Log in to book'
        : 'Book Now'
  }}
</button>


<p v-if="bookingError" class="error" role="alert">
  {{ bookingError }}
</p>

<section v-if="bookingResult" class="availability-result" aria-live="polite">
  <h4>Booking created successfully!</h4>
  <p>Booking ID: {{ bookingResult.id }}</p>
  <p>Status: {{ bookingResult.status }}</p>
  <p>
    Total amount:
    <strong>{{ formatPrice(bookingResult.totalAmount) }}</strong>
  </p>
  <p class="muted">
    Payment has not been completed yet.
  </p>
</section>

      </template>

      <template v-else>
        <h4>Rooms unavailable</h4>
        <p>
          {{
            availabilityResult.message ||
            'Not enough suitable rooms are available for these dates.'
          }}
        </p>
      </template>
    </section>
  </aside>
</div>

      </template>
    </section>
  </main>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  color: #202a36;
  background: #f7f8fa;
}

button, input {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.page {
  min-height: 100vh;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 7%;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.brand {
  border: 0;
  background: transparent;
  color: #245b4a;
  font-size: 24px;
  font-weight: bold;
}

.navbar span, .muted {
  color: #667085;
}

.hero {
  padding: 42px 7%;
  background: #eaf3ee;
}

.eyebrow {
  color: #245b4a;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 2px;
}

.hero h1 {
  margin: 12px 0;
  font-size: clamp(30px, 5vw, 46px);
}

.search-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px;
  margin-top: 26px;
  padding: 18px;
  background: white;
  border-radius: 12px;
}

.search-bar label {
  display: grid;
  gap: 8px;
  font-size: 13px;
  font-weight: bold;
}

input {
  width: 100%;
  min-width: 0;
  padding: 11px;
  border: 1px solid #d0d5dd;
  border-radius: 7px;
}

.results {
  padding: 32px 7%;
}

.hotel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.hotel-card, .room-card, .booking-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
}

.hotel-image {
  display: grid;
  min-height: 130px;
  place-items: center;
  background: #dce9e2;
  color: #245b4a;
  font-size: 42px;
  font-weight: bold;
}

.hotel-info {
  padding: 18px;
}

.hotel-info h3 {
  margin: 8px 0;
}

.hotel-info p, .booking-card p {
  line-height: 1.5;
}

.city {
  color: #245b4a;
  font-size: 13px;
  font-weight: bold;
}

.address {
  color: #667085;
  font-size: 13px;
}

.hotel-info button, .room-card button,
.booking-card button, .back-button {
  padding: 11px 14px;
  border: 0;
  border-radius: 7px;
  background: #245b4a;
  color: white;
}

.hotel-info button {
  width: 100%;
  margin-top: 10px;
}

.back-button {
  margin-bottom: 20px;
}

.room-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(250px, 1fr);
  align-items: start;
  gap: 24px;
  margin-top: 24px;
}

.room-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 14px;
  padding: 18px;
}

.room-card.selected {
  border: 2px solid #245b4a;
}

.room-card h4 {
  margin: 0 0 10px;
}

.booking-card {
  padding: 20px;
}

.booking-card button {
  width: 100%;
  margin-top: 10px;
}

.error {
  color: #b42318;
}

@media (max-width: 700px) {
  .room-layout {
    grid-template-columns: 1fr;
  }

  .room-card {
    align-items: flex-start;
    flex-direction: column;
  }
}

.auth-panel {
  max-width: 480px;
  margin: 28px auto;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
}

.auth-panel h2 {
  margin-top: 0;
}

.auth-panel form {
  display: grid;
  gap: 16px;
}

.auth-panel label {
  display: grid;
  gap: 8px;
  font-size: 14px;
  font-weight: bold;
}

.auth-panel input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d0d5dd;
  border-radius: 7px;
}

.auth-panel form > button,
.auth-panel > button {
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: 7px;
  background: #245b4a;
  color: white;
  cursor: pointer;
}

.auth-panel button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.auth-panel .text-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #245b4a;
  font-weight: bold;
  cursor: pointer;
}

.auth-panel .error {
  color: #b42318;
}


</style>
