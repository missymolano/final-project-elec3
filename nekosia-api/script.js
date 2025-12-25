"use strict";

const API_URL = "https://api.nekosia.cat/api/v1/images/catgirl";

// DOM Elements
const btnFetch = document.getElementById("btnFetch");
const btnDownload = document.getElementById("btnDownload");
const btnFavorite = document.getElementById("btnFavorite");
const btnClear = document.getElementById("btnClear");
const btnTheme = document.getElementById("btnTheme");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");
const statusEl = document.getElementById("status");
const imgEl = document.getElementById("img");
const placeholder = document.getElementById("placeholder");
const sourceEl = document.getElementById("source");
const artistEl = document.getElementById("artist");
const sourceLinkEl = document.getElementById("sourceLink");
const totalLoadedEl = document.getElementById("totalLoaded");
const favoritesCountEl = document.getElementById("favorites");
const favoritesListEl = document.getElementById("favoritesList");
const historyListEl = document.getElementById("historyList");

// State
let currentImageData = null;
let totalLoaded = 0;
let favorites = [];
let history = [];
let theme = "dark";

// Initialize from localStorage
const loadState = () => {
  const savedTotal = localStorage.getItem("totalLoaded");
  const savedFavorites = localStorage.getItem("favorites");
  const savedHistory = localStorage.getItem("history");
  const savedTheme = localStorage.getItem("nekosiaTheme");
  
  if (savedTotal) totalLoaded = parseInt(savedTotal, 10);
  if (savedFavorites) favorites = JSON.parse(savedFavorites);
  if (savedHistory) history = JSON.parse(savedHistory);
  if (savedTheme === "light" || savedTheme === "dark") theme = savedTheme;
  
  updateStats();
  renderFavorites();
  renderHistory();
  applyTheme(theme);
};

// Save state to localStorage
const saveState = () => {
  localStorage.setItem("totalLoaded", totalLoaded);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  localStorage.setItem("history", JSON.stringify(history));
  localStorage.setItem("nekosiaTheme", theme);
};

// Theme
const applyTheme = (mode) => {
  const isLight = mode === "light";
  document.body.setAttribute("data-theme", isLight ? "light" : "dark");
  themeIcon.textContent = isLight ? "🌞" : "🌙";
  themeLabel.textContent = isLight ? "Light" : "Dark";
};

const toggleTheme = () => {
  theme = theme === "light" ? "dark" : "light";
  applyTheme(theme);
  localStorage.setItem("nekosiaTheme", theme);
};

// Update statistics
const updateStats = () => {
  totalLoadedEl.textContent = totalLoaded;
  favoritesCountEl.textContent = favorites.length;
};

// Set status message
const setStatus = (msg, type = "normal") => {
  statusEl.textContent = msg;
  statusEl.classList.remove("error", "success");
  if (type === "error") statusEl.classList.add("error");
  if (type === "success") statusEl.classList.add("success");
};

// Fetch catgirl image
const fetchCatgirl = async () => {
  btnFetch.disabled = true;
  btnDownload.disabled = true;
  btnFavorite.disabled = true;
  imgEl.classList.remove("loaded");
  placeholder.classList.remove("hidden");
  setStatus("Fetching...");

  try {
    const res = await fetch(API_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

    const data = await res.json();
    const imageUrl = data?.image?.original?.url;

    if (!imageUrl) {
      console.log("Raw response:", data);
      throw new Error("No image URL found");
    }

    // Load image
    const img = new Image();
    img.onload = () => {
      imgEl.src = imageUrl;
      imgEl.classList.add("loaded");
      placeholder.classList.add("hidden");
      btnDownload.disabled = false;
      btnFavorite.disabled = false;
      
      // Update current image data
      currentImageData = {
        url: imageUrl,
        artist: data?.image?.artist || "Unknown",
        source: data?.image?.source_url || imageUrl,
        timestamp: Date.now()
      };
      
      // Update metadata
      sourceEl.textContent = "View Full Size";
      sourceEl.href = imageUrl;
      artistEl.textContent = currentImageData.artist;
      sourceLinkEl.textContent = "View Source";
      sourceLinkEl.href = currentImageData.source;
      
      // Update counters
      totalLoaded++;
      updateStats();
      saveState();
      
      // Add to history
      addToHistory(currentImageData);
      
      setStatus("Image loaded!", "success");
    };
    
    img.onerror = () => {
      throw new Error("Failed to load image");
    };
    
    img.src = imageUrl;

  } catch (err) {
    setStatus(err.message || String(err), "error");
    placeholder.classList.remove("hidden");
  } finally {
    btnFetch.disabled = false;
  }
};

// Download current image
const downloadImage = async () => {
  if (!currentImageData) return;
  
  try {
    btnDownload.disabled = true;
    setStatus("Downloading...");
    
    const response = await fetch(currentImageData.url);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `nekosia-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setStatus("Downloaded!", "success");
    setTimeout(() => setStatus("Ready"), 2000);
  } catch (err) {
    setStatus("Download failed", "error");
  } finally {
    btnDownload.disabled = false;
  }
};

// Add to favorites
const addToFavorite = () => {
  if (!currentImageData) return;
  
  const exists = favorites.find(f => f.url === currentImageData.url);
  if (exists) {
    setStatus("Already in favorites!", "error");
    return;
  }
  
  favorites.unshift({ ...currentImageData });
  if (favorites.length > 20) favorites.pop(); // Keep max 20
  
  updateStats();
  renderFavorites();
  saveState();
  setStatus("Added to favorites!", "success");
  setTimeout(() => setStatus("Ready"), 2000);
};

// Add to history
const addToHistory = (data) => {
  history.unshift({ ...data });
  if (history.length > 10) history.pop(); // Keep max 10
  renderHistory();
  saveState();
};

// Render favorites
const renderFavorites = () => {
  if (favorites.length === 0) {
    favoritesListEl.innerHTML = '<p class="empty-state">No favorites yet. Click the heart to save!</p>';
    return;
  }
  
  favoritesListEl.innerHTML = favorites.map((item, index) => `
    <div class="thumbnail-item" onclick="loadFromFavorite(${index})">
      <img src="${item.url}" alt="Favorite ${index + 1}" loading="lazy" />
      <button class="thumbnail-remove" onclick="event.stopPropagation(); removeFromFavorites(${index})" title="Remove">×</button>
    </div>
  `).join("");
};

// Render history
const renderHistory = () => {
  if (history.length === 0) {
    historyListEl.innerHTML = '<p class="empty-state">No history yet.</p>';
    return;
  }
  
  historyListEl.innerHTML = history.map((item, index) => `
    <div class="thumbnail-item" onclick="loadFromHistory(${index})">
      <img src="${item.url}" alt="History ${index + 1}" loading="lazy" />
    </div>
  `).join("");
};

// Load from favorites
window.loadFromFavorite = (index) => {
  const item = favorites[index];
  if (!item) return;
  
  currentImageData = { ...item };
  imgEl.src = item.url;
  imgEl.classList.add("loaded");
  placeholder.classList.add("hidden");
  
  sourceEl.textContent = "View Full Size";
  sourceEl.href = item.url;
  artistEl.textContent = item.artist;
  sourceLinkEl.textContent = "View Source";
  sourceLinkEl.href = item.source;
  
  btnDownload.disabled = false;
  btnFavorite.disabled = false;
  setStatus("Loaded from favorites", "success");
};

// Load from history
window.loadFromHistory = (index) => {
  const item = history[index];
  if (!item) return;
  
  currentImageData = { ...item };
  imgEl.src = item.url;
  imgEl.classList.add("loaded");
  placeholder.classList.add("hidden");
  
  sourceEl.textContent = "View Full Size";
  sourceEl.href = item.url;
  artistEl.textContent = item.artist;
  sourceLinkEl.textContent = "View Source";
  sourceLinkEl.href = item.source;
  
  btnDownload.disabled = false;
  btnFavorite.disabled = false;
  setStatus("Loaded from history", "success");
};

// Remove from favorites
window.removeFromFavorites = (index) => {
  favorites.splice(index, 1);
  updateStats();
  renderFavorites();
  saveState();
  setStatus("Removed from favorites");
};

// Clear all data
const clearAll = () => {
  if (!confirm("Are you sure you want to clear all data? This includes favorites and history.")) {
    return;
  }
  
  favorites = [];
  history = [];
  totalLoaded = 0;
  currentImageData = null;
  
  imgEl.classList.remove("loaded");
  placeholder.classList.remove("hidden");
  btnDownload.disabled = true;
  btnFavorite.disabled = true;
  
  updateStats();
  renderFavorites();
  renderHistory();
  saveState();
  
  setStatus("All data cleared", "success");
};

// Event Listeners
btnFetch.addEventListener("click", fetchCatgirl);
btnDownload.addEventListener("click", downloadImage);
btnFavorite.addEventListener("click", addToFavorite);
btnClear.addEventListener("click", clearAll);
btnTheme.addEventListener("click", toggleTheme);

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !btnFetch.disabled) {
    e.preventDefault();
    fetchCatgirl();
  }
});

// Initialize
loadState();
