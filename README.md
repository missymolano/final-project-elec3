# Final Project ELEC3

## Project Type
Solo project

## Description
This project is a collection of four web applications built as part of a solo student project. Each app demonstrates different web development skills and API integrations:
- Calculator
- Stopwatch
- Nekosia API Demo
- Weather API App

---

## Project Overview
This repository contains four mini web applications:
- **Calculator:** A simple web-based calculator for basic arithmetic operations.
- **Stopwatch:** A digital stopwatch with start, stop, and reset functionality.
- **Nekosia API Demo:** Demonstrates fetching and displaying data from the Nekosia API.
- **Weather API App:** Fetches and displays current weather information using a public weather API.

---

## Main Features
- Responsive and clean UI for each app
- Calculator: Addition, subtraction, multiplication, division
- Stopwatch: Start, stop, reset, and time display
- Nekosia API: Fetches and displays data from Nekosia API
- Weather API: Fetches and displays weather data for a given city

---

## APIs Used
### Nekosia API
- **Base URL:** `https://nekos.life/api/v2`
- **Endpoints:**
  - `/img/neko` (Get random neko image)
- **Parameters:** None
- **Authentication:** None required

### Weather API (OpenWeatherMap)
- **Base URL:** `https://api.openweathermap.org/data/2.5/weather`
- **Endpoints:**
  - `/weather` (Get current weather by city)
- **Parameters:**
  - `q` (City name)
  - `appid` (API key)
  - `units` (Units, e.g., metric)
- **Authentication:** API key required (free signup)

---

## Technologies Used
- HTML
- CSS
- JavaScript

---

## Getting Started

### 1. Clone or Download the Repository

```
git clone https://github.com/your-username/final-project-elec3.git
```
Or download the ZIP and extract it.

### 2. Run the Project Locally

1. Open the folder in your code editor.
2. Open any `index.html` file from the app folders (e.g., `calculator/index.html`) in your web browser.
3. For API-based apps (Nekosia, Weather), ensure you have an internet connection.
4. For the Weather API, insert your OpenWeatherMap API key in the `script.js` file where indicated.

---

## Credits / API Attribution
- [Nekosia API](https://nekos.life/)
- [OpenWeatherMap API](https://openweathermap.org/api)

---

## License
This project is for educational purposes only.
