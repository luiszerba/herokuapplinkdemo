import { useState, useEffect } from 'react';
import Map, { NavigationControl, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const regions = [
  { name: "Ásia", id: "asia", locationId: "304554" }, // Tóquio
  { name: "Europa", id: "europa", locationId: "293928" }, // Paris
  { name: "América do Sul", id: "sul", locationId: "303631" }, // São Paulo
  { name: "África", id: "africa", locationId: "294207" }, // Nairobi
  { name: "Oceania", id: "oceania", locationId: "255060" }, // Sydney
];

function App() {
  const [region, setRegion] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    async function fetchPlaces(regionInfo) {
      console.log('Região selecionada:', regionInfo);
      if (!regionInfo) return;

      const url = `https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/searchRestaurants?locationId=${regionInfo.locationId}`;
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
        }
      };

      try {
        // Dados mockados caso a API falhe ou atinja o limite de requisições
        const enriched = [
          {
            id: 'mock1',
            name: 'Restaurante Estrela Paulista',
            category: 'Brasileira Contemporânea',
            latitude: -23.561684,
            longitude: -46.625378,
            rating: 5,
            imageUrl: 'https://source.unsplash.com/400x200/?brazilian-restaurant',
            reviews: [{
              author: 'TripAdvisor',
              date: '',
              rating: 5,
              text: 'Excelente atendimento e comida maravilhosa no coração de São Paulo!'
            }]
          },
          {
            id: 'mock2',
            name: 'Cantina do Marco',
            category: 'Italiana',
            latitude: -23.562947,
            longitude: -46.654321,
            rating: 4,
            imageUrl: 'https://source.unsplash.com/400x200/?italian-food',
            reviews: [{
              author: 'TripAdvisor',
              date: '',
              rating: 4,
              text: 'Massas frescas e ambiente acolhedor. Voltaremos com certeza.'
            }]
          },
          {
            id: 'mock3',
            name: 'Sabor do Oriente',
            category: 'Asiática Fusion',
            latitude: -23.555432,
            longitude: -46.640987,
            rating: 5,
            imageUrl: 'https://source.unsplash.com/400x200/?asian-restaurant',
            reviews: [{
              author: 'TripAdvisor',
              date: '',
              rating: 5,
              text: 'Uma explosão de sabores com pratos muito bem apresentados.'
            }]
          }
        ];

        console.log('Destinos mockados carregados:', enriched);
        setDestinations(enriched);
      } catch (error) {
        console.error('Erro ao buscar dados da API RapidAPI TripAdvisor v16:', error);
        setDestinations([]);
      }
    }

    fetchPlaces(region);
  }, [region]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 px-6 py-12 text-gray-800 font-sans">
      <div className="text-center max-w-4xl mx-auto mb-12">
        <h1 className="text-5xl font-extrabold mb-4 text-indigo-700">🌍 Missão Viagem</h1>
        <p className="text-lg text-indigo-900">Clique em uma região e descubra sua próxima aventura!</p>
      </div>

      <div className="flex flex-col-reverse lg:flex-row max-w-7xl mx-auto gap-10">
        {/* Conteúdo principal */}
        <div className="flex-1">
          <div className="flex justify-center gap-3 flex-wrap mb-8">
            {regions.map((r) => (
              <button
                key={r.id}
                onClick={() => setRegion(r)}
                className="bg-white text-indigo-700 border border-indigo-300 px-5 py-2.5 rounded-full shadow hover:scale-105 hover:bg-indigo-100 transition font-medium"
              >
                {r.name}
              </button>
            ))}
          </div>

          {region && (
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-center text-indigo-800">Sugestões para {region.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {destinations.map((place) => (
                  <div key={place.id} className="bg-white rounded-2xl shadow-md p-4 hover:scale-[1.02] transition-transform">
                    <img src={place.imageUrl} alt={place.name} className="w-full h-44 object-cover rounded-xl mb-3" />
                    <h3 className="text-lg font-bold text-indigo-700 mb-1">{place.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{place.category} — Nota: {place.rating} ⭐</p>
                    <p className="text-sm text-gray-700 italic">“{place.reviews[0]?.text}”</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Painel com botão e mapa */}
        <div className="w-full lg:w-[340px]">
          <button
            onClick={() => setShowMap(!showMap)}
            className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow hover:bg-indigo-700 transition w-full"
          >
            {showMap ? 'Ocultar Mapa 🗺️' : 'Mostrar Mapa 🗺️'}
          </button>
          {showMap && (
            <div className="rounded-xl overflow-hidden shadow-lg w-full" style={{ height: 400 }}>
              <Map
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                initialViewState={{
                  latitude: 0,
                  longitude: 0,
                  zoom: 1.5,
                }}
                mapStyle="mapbox://styles/mapbox/light-v11"
                style={{ width: '100%', height: '100%' }}
              >
                <NavigationControl position="top-left" />
                {destinations.map((place) => (
                  <Marker
                    key={place.id}
                    longitude={place.longitude}
                    latitude={place.latitude}
                    anchor="bottom"
                  >
                    <div className="text-xl">📍</div>
                  </Marker>
                ))}
              </Map>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
