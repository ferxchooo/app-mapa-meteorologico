// Tu API Key activa de OpenWeatherMap


// Inicialización global del mapa de Leaflet
let map = L.map('map').setView([19.4326, -99.1332], 5); // Vista inicial por defecto (México)
let marker;

// Cargar la capa visual del mapa desde OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

document.getElementById('search-btn').addEventListener('click', async () => {
    const city = document.getElementById('city-input').value.trim();
    const weatherCard = document.getElementById('weather-card');

    if (!city) {
        weatherCard.innerHTML = "<p style='color: #ef4444;'>Por favor, escribe una ciudad válida.</p>";
        return;
    }

    weatherCard.innerHTML = "<p>Consultando satélites y bases de datos...</p>";

    try {
        // 1. Obtener coordenadas con Nominatim (OpenStreetMap)
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`);
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            weatherCard.innerHTML = "<p style='color: #ef4444;'>✖ No se encontró la ubicación geográfica.</p>";
            return;
        }

        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        const displayName = geoData[0].display_name;

        // 2. Obtener clima real con OpenWeatherMap usando las coordenadas
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`);
        const weatherData = await weatherResponse.json();

        const temp = weatherData.main.temp.toFixed(1);
        const humidity = weatherData.main.humidity;
        const condition = weatherData.weather[0].description;
        // Capitalizar la primera letra de la condición climática
        const conditionCapitalized = condition.charAt(0).toUpperCase() + condition.slice(1);

        // 3. Actualizar la interfaz (DOM)
        weatherCard.innerHTML = `
            <h3 style="margin-top:0; color:#fff;">${geoData[0].name || city}</h3>
            <p class="description">${displayName}</p>
            <div class="weather-data">
                <p><strong>Temperatura:</strong> <span>${temp}°C</span></p>
                <p><strong>Humedad:</strong> <span>${humidity}%</span></p>
                <p><strong>Condición:</strong> <span>${conditionCapitalized}</span></p>
                <p><strong>Coordenadas:</strong> <span>${parseFloat(lat).toFixed(4)}, ${parseFloat(lon).toFixed(4)}</span></p>
            </div>
            <div class="success-footer">✓ Conexión exitosa a OpenWeatherMap y OpenStreetMap</div>
        `;

        // 4. Actualizar el Mapa
        const newLatLng = new L.LatLng(lat, lon);
        map.setView(newLatLng, 12); // Acercar el mapa a la nueva ubicación
        
        // Colocar o mover el marcador
        if (marker) {
            marker.setLatLng(newLatLng);
        } else {
            marker = L.marker(newLatLng).addTo(map);
        }
        marker.bindPopup(`<b>${geoData[0].name || city}</b><br>${conditionCapitalized}`).openPopup();

    } catch (error) {
        console.error(error);
        weatherCard.innerHTML = "<p style='color: #ef4444;'>✖ Error al conectar con los servidores meteorológicos.</p>";
    }
});