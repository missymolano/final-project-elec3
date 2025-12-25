"use strict";

// DOM Elements
const $time = document.getElementById("time");
const $startPause = document.getElementById("startPause");
const $reset = document.getElementById("reset");

// State
let isRunning = false;
let startTime = 0;
let elapsedTime = 0;
let animationId = 0;

// Format milliseconds to HH:MM:SS.CS
const formatTime = (ms) => {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;

  const totalS = Math.floor(totalCs / 100);
  const s = totalS % 60;

  const totalM = Math.floor(totalS / 60);
  const m = totalM % 60;

  const h = Math.floor(totalM / 60);

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
};

// Update display
const updateDisplay = (ms) => {
  $time.textContent = formatTime(ms);
};

// Animation loop
const tick = () => {
  if (!isRunning) return;
  const now = performance.now();
  const currentTime = elapsedTime + (now - startTime);
  updateDisplay(currentTime);
  animationId = requestAnimationFrame(tick);
};

// Update button states
const updateButtons = () => {
  const btnText = $startPause.querySelector('.btn-text');
  const btnIcon = $startPause.querySelector('.btn-icon');
  
  if (isRunning) {
    btnText.textContent = "Pause";
    btnIcon.textContent = "⏸️";
    $startPause.classList.add("paused");
    $time.classList.add("running");
  } else {
    btnText.textContent = elapsedTime > 0 ? "Resume" : "Start";
    btnIcon.textContent = "▶️";
    $startPause.classList.remove("paused");
    $time.classList.remove("running");
  }

  $reset.disabled = isRunning || elapsedTime === 0;
};

// Start timer
const startTimer = () => {
  if (isRunning) return;
  isRunning = true;
  startTime = performance.now();

  if (!animationId) {
    animationId = requestAnimationFrame(tick);
  }

  updateButtons();
};

// Pause timer
const pauseTimer = () => {
  if (!isRunning) return;
  isRunning = false;

  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = 0;
  }

  elapsedTime += performance.now() - startTime;
  updateDisplay(elapsedTime);
  updateButtons();
};

// Reset timer
const resetTimer = () => {
  if (isRunning) return;
  
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = 0;
  }

  startTime = 0;
  elapsedTime = 0;
  updateDisplay(0);
  updateButtons();
};

// Event Listeners
$startPause.addEventListener("click", () => {
  isRunning ? pauseTimer() : startTimer();
});

$reset.addEventListener("click", resetTimer);

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  const key = e.key;
  const code = e.code;

  // Space = start/pause
  const isSpace = key === " " || code === "Space";
  if (isSpace) {
    e.preventDefault();
    isRunning ? pauseTimer() : startTimer();
    return;
  }

  // R = reset when available
  if (key.toLowerCase() === "r" && !$reset.disabled) {
    e.preventDefault();
    resetTimer();
  }
});

// Initialize
updateDisplay(0);
updateButtons();
