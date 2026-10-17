// 1. Inicializar el mapa de Leaflet con OpenStreetMap oficial
const map = L.map('map').setView([19.2826, -99.6557], 10); // Empieza en Toluca por defecto

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let marker = L.marker([19.2826, -99.6557]).addTo(map);

// Referencias a los elementos del HTML
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const statusMessage = document.getElementById('statusMessage');

// Evento al hacer clic en buscar
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city !== '') {
        buscarUbicacion(city);
    }
});

// Función para traducir los códigos de Open-Meteo a Español
function traducirClima(codigo) {
    const climas = {
        0: 'Despejado',
        1: 'Mayormente despejado',
        2: 'Parcialmente nublado',
        3: 'Nublado',
        45: 'Niebla',
        48: 'Niebla con escarcha',
        51: 'Llovizna ligera',
        53: 'Llovizna moderada',
        55: 'Llovizna densa',
        61: 'Lluvia leve',
        63: 'Lluvia moderada',
        65: 'Lluvia fuerte',
        80: 'Chubascos leves',
        81: 'Chubascos moderados',
        82: 'Chubascos violentos',
        95: 'Tormenta eléctrica'
    };
    return climas[codigo] || 'Desconocido';
}

// 2. Buscar coordenadas con Nominatim (OpenStreetMap)
function buscarUbicacion(ciudad) {
    statusMessage.textContent = 'Buscando...';
    statusMessage.className = 'status success';

    // Se mantiene tu correo como identificador para evitar bloqueos
    const urlNominatim = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(ciudad)}&format=json&limit=1`;
    
    fetch(urlNominatim, {
        headers: {
            'User-Agent': 'LocalizadorClimaApp/1.0 (al222410839@gmail.com)'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            const nombreCompleto = data[0].display_name;

            // Actualizar la tarjeta con el nombre
            document.getElementById('cityName').textContent = ciudad.charAt(0).toUpperCase() + ciudad.slice(1);
            document.getElementById('cityLocation').textContent = nombreCompleto;
            document.getElementById('coordValue').textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

            // Mover el mapa
            map.setView([lat, lon], 12);
            marker.setLatLng([lat, lon]).bindPopup(ciudad).openPopup();

            // Llamar a Open-Meteo usando las coordenadas recién descubiertas
            buscarClima(lat, lon);
        } else {
            statusMessage.textContent = '❌ Ciudad no encontrada.';
            statusMessage.className = 'status error';
        }
    })
    .catch(error => {
        console.error('Error Nominatim:', error);
        statusMessage.textContent = '❌ Error al conectar con el servidor de mapas.';
        statusMessage.className = 'status error';
    });
}

// 3. Buscar el clima con Open-Meteo usando las coordenadas
function buscarClima(lat, lon) {
    const urlMeteo = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`;

    fetch(urlMeteo)
    .then(response => response.json())
    .then(data => {
        const temp = data.current.temperature_2m;
        const hum = data.current.relative_humidity_2m;
        const codigoClima = data.current.weather_code;

        // Actualizar la tarjeta de clima
        document.getElementById('tempValue').textContent = `${temp} °C`;
        document.getElementById('humValue').textContent = `${hum} %`;
        document.getElementById('condValue').textContent = traducirClima(codigoClima);

        statusMessage.textContent = '✓ Conexión exitosa a OpenStreetMap y Open-Meteo';
        statusMessage.className = 'status success';
    })
    .catch(error => {
        console.error('Error Open-Meteo:', error);
        statusMessage.textContent = '❌ Error al conectar con Open-Meteo.';
        statusMessage.className = 'status error';
    });
}