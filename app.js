// --- Authentication Removed ---


// --- Map Logic ---
// Initialize map centered on São Paulo
const map = L.map('map').setView([-23.5505, -46.6333], 13);

// Add light mode tile layer (Voyager)
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Custom icon for motorcycle parking
const motoIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [15, 25],
    iconAnchor: [7, 25],
    popupAnchor: [1, -20],
    shadowSize: [25, 25]
});

// Configure MarkerClusterGroup
const markers = L.markerClusterGroup({
    disableClusteringAtZoom: 17,
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    maxClusterRadius: 50
});

// Load parking data
fetch('data/parking_spots.json')
    .then(response => response.json())
    .then(data => {
        const geoJsonLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, { icon: motoIcon });
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties) {
                    const p = feature.properties;
                    const content = `
                        <div style="min-width: 200px;">
                            <h3 style="margin-bottom: 0.5rem; color: #3b82f6;">${p.Local || 'Local sem nome'}</h3>
                            <p style="margin-bottom: 0.25rem;"><strong>Vagas:</strong> ${p.Quantidade || 'N/A'}</p>
                            <p style="margin-bottom: 0.25rem;">${p.Complement || ''}</p>
                            <p style="font-size: 0.8rem; color: #94a3b8;">ID: ${p.NumeroVaga}</p>
                            <a href="https://www.google.com/maps/dir/?api=1&destination=${layer.getLatLng().lat},${layer.getLatLng().lng}" 
                               target="_blank" 
                               style="display: inline-block; margin-top: 0.5rem; color: #3b82f6; text-decoration: none; font-weight: 500;">
                               Como chegar &rarr;
                            </a>
                        </div>
                    `;
                    layer.bindPopup(content);
                }
            }
        });

        markers.addLayer(geoJsonLayer);
        map.addLayer(markers);
    })
    .catch(error => console.error('Error loading data:', error));

// Geolocation "Near Me"
document.getElementById('locate-btn').addEventListener('click', () => {
    map.locate({ setView: true, maxZoom: 16 });
});

map.on('locationfound', (e) => {
    const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    L.circle(e.latlng, {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.2,
        radius: e.accuracy / 2
    }).addTo(map);

    L.marker(e.latlng, { icon: redIcon }).addTo(map)
        .bindPopup("Você está aqui").openPopup();
});

map.on('locationerror', (e) => {
    alert("Não foi possível obter sua localização: " + e.message);
});

// Search functionality
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

function performSearch() {
    const query = searchInput.value;
    if (!query) return;

    // Append "São Paulo" to context
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", São Paulo, Brazil")}`;

    fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                map.setView([lat, lon], 16);

                L.marker([lat, lon], {
                    opacity: 0.7
                }).addTo(map)
                    .bindPopup(`Resultado: ${data[0].display_name}`).openPopup();
            } else {
                alert("Local não encontrado.");
            }
        })
        .catch(error => {
            console.error('Search error:', error);
            alert("Erro na busca.");
        });
}

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});
