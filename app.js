// --- Authentication Logic ---
const ALLOWED_EMAILS = [
    "leandro.lok@gmail.com" // TODO: Replace with your actual email
];

const loginOverlay = document.getElementById('login-overlay');
const appContainer = document.getElementById('app-container');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const authStatus = document.getElementById('auth-status');

// Login
loginBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .catch(error => {
            console.error("Login failed:", error);
            authStatus.textContent = "Erro no login: " + error.message;
        });
});

// Logout
logoutBtn.addEventListener('click', () => {
    firebase.auth().signOut();
});

// Auth State Listener
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log("User logged in:", user.email);
        if (ALLOWED_EMAILS.includes(user.email)) {
            // Allowed
            loginOverlay.classList.add('hidden');
            appContainer.classList.remove('hidden');
            authStatus.textContent = "";

            // Trigger map resize to ensure it renders correctly after being unhidden
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        } else {
            // Not allowed
            loginOverlay.classList.remove('hidden');
            appContainer.classList.add('hidden');
            authStatus.textContent = `Acesso negado para ${user.email}.`;
            // Optional: Auto sign out if not allowed
            // firebase.auth().signOut();
        }
    } else {
        // Not logged in
        loginOverlay.classList.remove('hidden');
        appContainer.classList.add('hidden');
        authStatus.textContent = "";
    }
});

// --- Map Logic ---
// Initialize map centered on São Paulo
const map = L.map('map').setView([-23.5505, -46.6333], 13);

// Add dark mode tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
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

// Load parking data
fetch('data/parking_spots.json')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
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
        }).addTo(map);
    })
    .catch(error => console.error('Error loading data:', error));

// Geolocation "Near Me"
document.getElementById('locate-btn').addEventListener('click', () => {
    map.locate({ setView: true, maxZoom: 16 });
});

map.on('locationfound', (e) => {
    L.circle(e.latlng, {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        radius: e.accuracy / 2
    }).addTo(map);

    L.marker(e.latlng).addTo(map)
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
