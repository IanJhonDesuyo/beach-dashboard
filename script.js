document.addEventListener("DOMContentLoaded", () => {
  const sidebarLinks = document.querySelectorAll(".sidebar .nav-link, .topbar .nav-link");
  const content = document.getElementById("main-content");

  sidebarLinks.forEach(link => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const page = link.getAttribute("data-page");

      let html = "";

      if (page === "home") {
        html = `
          <h1>Welcome to Your Beach Dashboard!</h1>
          <p>Relax and manage your resort data. Click <strong>Navigation</strong> to start routing.</p>
        `;
      }else if (page === "navigation") {
  html = `
    <div style="display:flex; align-items:center; justify-content:space-between;">
      <h1>🧭 Navigation</h1>
      <div id="weather-box" style="
        background:white;
        padding:8px 12px;
        border-radius:8px;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
        display:flex;
        align-items:center;
        gap:6px;
        font-size:14px;">
        <img id="weather-icon" src="" alt="icon" style="width:30px;height:30px;">
        <span id="weather-temp">--°C</span>
        <span id="weather-desc">Loading...</span>
      </div>
    </div>
    <p>Map with routing and weather info below.</p>
    <div id="map" style="height:500px; border-radius:10px;"></div>
  `;
  setTimeout(() => initMap(), 100);
}
 else if (page === "profile") {
        html = `<h1>👤 Profile</h1><p>Update your profile here.</p>`;
      } else if (page === "logout") {
        html = `<h1>🚪 Logout</h1><p>You have been logged out.</p>`;
      }

      content.innerHTML = html;

      // Set active link
      sidebarLinks.forEach(a => a.classList.remove("active"));
      link.classList.add("active");
    });
  });
});

// Resort coordinates
const targetLat = 13.9517;
const targetLng = 120.6198;

// Fetch weather from OpenWeatherMap
async function fetchWeather(lat, lng) {
  const apiKey = "040a6d3f051754815c33ebaec0671eb8"; // <-- Replace with your OpenWeatherMap API key
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Weather API error");
    const data = await resp.json();

    document.getElementById("weather-temp").textContent = `${data.main.temp.toFixed(1)}°C`;
    document.getElementById("weather-desc").textContent = data.weather[0].description;
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
  } catch (err) {
    console.error("Weather fetch error:", err);
    const box = document.getElementById("weather-box");
    if (box) box.textContent = "Weather unavailable";
  }
}

// Initialize map + geolocation + route
function initMap() {
  const map = L.map('map').setView([targetLat, targetLng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Resort marker
  L.marker([targetLat, targetLng]).addTo(map).bindPopup("Resort Location – Matabungkay").openPopup();

  // Ensure the weather box exists before fetching
  const checkWeatherBox = setInterval(() => {
    const box = document.getElementById("weather-box");
    if (box) {
      clearInterval(checkWeatherBox);
      fetchWeather(targetLat, targetLng);
    }
  }, 50);

  // Geolocation + routing
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;

      L.marker([userLat, userLng]).addTo(map).bindPopup("You are here").openPopup();

      L.Routing.control({
        waypoints: [
          L.latLng(userLat, userLng),
          L.latLng(targetLat, targetLng)
        ],
        routeWhileDragging: false
      }).addTo(map);
    }, () => {
      console.warn("Geolocation permission denied.");
    });
  } else {
    console.warn("Geolocation not supported.");
  }
}
