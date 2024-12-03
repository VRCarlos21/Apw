const countriesList = document.getElementById("countries-list");
const countryDetails = document.getElementById("country-details");
const weatherDetails = document.getElementById("weather-details");
const searchInput = document.getElementById("search-input");
let countriesData = [];

// Claves de la API
const rapidApiKey = "0213125042mshbdb27d974ae7105p109cccjsn0d8700c600d7";
const rapidApiHost = "tripadvisor16.p.rapidapi.com"; 

// Función para obtener y mostrar la lista de países
async function fetchCountries() {
  const cachedCountries = localStorage.getItem("countriesData");
  if (cachedCountries) {
    countriesData = JSON.parse(cachedCountries);
    displayCountries(countriesData);
    return;
  }

  try {
    const response = await fetch("https://restcountries.com/v3.1/all");
    if (!response.ok) throw new Error("Error al obtener datos");

    countriesData = await response.json();
    localStorage.setItem("countriesData", JSON.stringify(countriesData));
    displayCountries(countriesData);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Función para mostrar la lista de países
function displayCountries(countries) {
  countriesList.innerHTML = ""; 
  countries.forEach(country => {
    const countryItem = document.createElement("div");
    countryItem.classList.add("country-item");
    countryItem.textContent = country.name.common;

    countryItem.addEventListener("click", () => {
      displayCountryDetails(country);
      fetchWeather(country);
      fetchCities(country.cca2); 
    });
    countriesList.appendChild(countryItem);
  });
}

// Función para mostrar detalles del país seleccionado
function displayCountryDetails(country) {
  countryDetails.innerHTML = `
    <h2>${country.name.common}</h2>
    <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : "N/A"}</p>
    <p><strong>Región:</strong> ${country.region}</p>
    <p><strong>Población:</strong> ${country.population.toLocaleString()}</p>
    <img src="${country.flags.png}" alt="Bandera de ${country.name.common}" width="150">
  `;
}

// Función para obtener el clima usando Open Meteo API
async function fetchWeather(country) {
  const cachedWeather = localStorage.getItem(`weather_${country.name.common}`);
  if (cachedWeather) {
    displayWeatherDetails(JSON.parse(cachedWeather));
    return;
  }

  if (!country.capitalInfo || !country.capitalInfo.latlng) {
    weatherDetails.innerHTML = "<p>No se pudo obtener la información del clima.</p>";
    return;
  }
  const [latitude, longitude] = country.capitalInfo.latlng;

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
    if (!response.ok) throw new Error("Error al obtener datos del clima");

    const weatherData = await response.json();
    localStorage.setItem(`weather_${country.name.common}`, JSON.stringify(weatherData));
    displayWeatherDetails(weatherData);
  } catch (error) {
    console.error("Error:", error);
    weatherDetails.innerHTML = "<p>Error al obtener la información del clima.</p>";
  }
}
// Función para mostrar los detalles del clima
function displayWeatherDetails(weatherData) {
  const { temperature, windspeed } = weatherData.current_weather;

  weatherDetails.innerHTML = `
    <h3>Clima Actual</h3>
    <img src="clima.png" alt="Imagen del clima" width="300" />
    <p><strong>Temperatura:</strong> ${temperature}°C</p>
    <p><strong>Viento:</strong> ${windspeed} km/h</p>
  `;
}

// Función para obtener las ciudades principales
async function fetchCities(countryCode) {
  const cachedCities = localStorage.getItem(`cities_${countryCode}`);
  if (cachedCities) {
    displayCities(JSON.parse(cachedCities));
    return;
  }

  try {
    const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/countries/${countryCode}/regions`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
      }
    });
    if (!response.ok) throw new Error("Error al obtener las ciudades");

    const citiesData = await response.json();
    localStorage.setItem(`cities_${countryCode}`, JSON.stringify(citiesData));
    displayCities(citiesData);
  } catch (error) {
    console.error("Error:", error);
    weatherDetails.innerHTML = "<p>Error al obtener las ciudades.</p>";
  }
}

// Función para mostrar las ciudades principales
function displayCities(citiesData) {
  if (citiesData.data && citiesData.data.length > 0) {
    const cityList = citiesData.data.map(city => `<li>${city.name}</li>`).join("");
    weatherDetails.innerHTML += ` 
      <h3>Ciudades Principales</h3>
      <ul>${cityList}</ul>
    `;
  } else {
    weatherDetails.innerHTML += "<p>No se encontraron ciudades.</p>";
  }
}

// Filtrar los países según el texto del buscador
function filterCountries() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredCountries = countriesData.filter(country => 
    country.name.common.toLowerCase().includes(searchTerm)
  );

  // Mostrar la lista de países solo cuando hay resultados
  if (filteredCountries.length > 0) {
    countriesList.style.display = "block";  // Mostrar la lista de países
    displayCountries(filteredCountries);
  } else {
    countriesList.style.display = "none";  // Ocultar la lista si no hay resultados
  }
}

// Cargar datos al cargar la página
fetchCountries();

// Agregar el evento de búsqueda
searchInput.addEventListener("input", filterCountries);
// Registra el Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration);
      })
      .catch(error => {
        console.log('Error al registrar el Service Worker:', error);
      });
  });
}
