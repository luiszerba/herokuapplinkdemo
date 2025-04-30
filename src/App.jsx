import { useEffect, useState, useRef } from 'react';
import Modal from './components/Modal';
import CadastroModal from './components/CadastroModal';
import RestaurantCard from './components/RestaurantCard';


export default function App() {
  const [paises, setPaises] = useState([]);
  const [regioes, setRegioes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedPais, setSelectedPais] = useState('');
  const [selectedRegiao, setSelectedRegiao] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [notaMinima, setNotaMinima] = useState(0);
  const [places, setPlaces] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [qtdFavoritos, setQtdFavoritos] = useState(0);
  const [favoritosVisiveis, setFavoritosVisiveis] = useState([]);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    fetch('/api/paises').then(res => res.json()).then(setPaises);
  }, []);

  useEffect(() => {
    if (selectedPais) {
      fetch(`/api/regioes?pais=${encodeURIComponent(selectedPais)}`)
        .then(res => res.json())
        .then(setRegioes);
    } else {
      setRegioes([]);
    }
  }, [selectedPais]);

  useEffect(() => {
    if (selectedPais || selectedRegiao) {
      const url = new URL('/api/categorias', window.location.origin);
      if (selectedPais) url.searchParams.append('pais', selectedPais);
      if (selectedRegiao) url.searchParams.append('regiao', selectedRegiao);

      fetch(url).then(res => res.json()).then(data => setCategorias(Array.isArray(data) ? data : []));
    } else {
      setCategorias([]);
    }
  }, [selectedPais, selectedRegiao]);

  const fetchPlaces = async (reset = false) => {
    setLoading(true);
    if (reset) setPagina(1);
    const url = new URL('/api/restaurantes', window.location.origin);
    if (selectedPais) url.searchParams.append('pais', selectedPais);
    if (selectedRegiao) url.searchParams.append('regiao', selectedRegiao);
    if (selectedCategoria) url.searchParams.append('categoria', selectedCategoria);
    if (notaMinima) url.searchParams.append('notaMinima', notaMinima);
    url.searchParams.append('pagina', reset ? 1 : pagina);

    const res = await fetch(url);
    const data = await res.json();

    if (reset) {
      setPlaces(data);
    } else {
      setPlaces(prev => [...prev, ...data]);
    }

    setTemMais(data.length > 0);
    setLoading(false);

    if (reset && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFilter = () => {
    fetchPlaces(true);
  };

  const handleClearFilters = () => {
    setSelectedPais('');
    setSelectedRegiao('');
    setSelectedCategoria('');
    setNotaMinima(0);
    setPlaces([]);
    setPagina(1);
    setTemMais(true);
    localStorage.removeItem('usuario');
    localStorage.removeItem('favoritos');
    setQtdFavoritos(0);
    setMostrarFavoritos(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100 && temMais && !loading) {
        setPagina(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [temMais, loading]);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favoritos') || '[]');
    setQtdFavoritos(favs.length);
  }, [mostrarFavoritos, places]);

  useEffect(() => {
    if (pagina > 1) {
      fetchPlaces();
    }
  }, [pagina]);

  const handleRequireLogin = () => {
    setShowCadastroModal(true);
  };

  const handleCadastroSucesso = (usuario) => {
    console.log('Usuário cadastrado:', usuario);
    handleToggleFavorite();
  };

  const carregarFavoritos = async () => {
    const favs = JSON.parse(localStorage.getItem('favoritos') || '[]');
    const results = await Promise.allSettled(
      favs.map(id => fetch(`/api/restaurantes/${id}`).then(res => res.ok ? res.json() : null))
    );
    const favoritos = results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);
    console.log('✅ Restaurantes carregados via allSettled:', favoritos);
    setFavoritosVisiveis(favoritos);
  };

  const handleToggleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem('favoritos') || '[]');
    console.log('🧠 Favoritos salvos no localStorage:', favs);
    setQtdFavoritos(favs.length);
    setPlaces(prev => [...prev]);

    if (mostrarFavoritos) carregarFavoritos();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Restaurantes</h1>
      <h3> Escolha as opções desejadas e faça o agendamento pelo nosso agente</h3><br/>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select value={selectedPais} onChange={e => setSelectedPais(e.target.value)} className="p-2 border rounded">
          <option value="">Selecione o país</option>
          {paises.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={selectedRegiao} onChange={e => setSelectedRegiao(e.target.value)} className="p-2 border rounded">
          <option value="">Todas as regiões</option>
          {regioes.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select value={selectedCategoria} onChange={e => setSelectedCategoria(e.target.value)} className="p-2 border rounded">
          <option value="">Todas as categorias</option>
          {categorias.length > 0 && categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={notaMinima} onChange={e => setNotaMinima(Number(e.target.value))} className="p-2 border rounded">
          <option value={0}>Todas as notas</option>
          <option value={5}>⭐⭐⭐⭐⭐</option>
          <option value={4}>⭐⭐⭐⭐</option>
          <option value={3}>⭐⭐⭐</option>
          <option value={2}>⭐⭐</option>
          <option value={1}>⭐</option>
        </select>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <button onClick={handleFilter} className="bg-blue-600 hover:bg-blue-800 text-white px-6 py-2 rounded">
          Buscar
        </button>
        <button onClick={handleClearFilters} className="bg-gray-600 hover:bg-gray-800 text-white px-6 py-2 rounded">
          Limpar
        </button>
        <button
          onClick={() => {
            const favs = JSON.parse(localStorage.getItem('favoritos') || '[]');
            setMostrarFavoritos(prev => {
              const next = !prev;
              if (next) {
                Promise.allSettled(
                  favs.map(id => fetch(`/api/restaurantes/${id}`).then(res => res.ok ? res.json() : null))
                ).then(results => {
                  const favoritos = results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);
                  setFavoritosVisiveis(favoritos);
                });
              }
              return next;
            });
          }}
          className={`px-6 py-2 rounded text-white font-semibold transition-all ${mostrarFavoritos ? 'bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
        >
          {`⭐ Meus Favoritos (${qtdFavoritos})`}
        </button>
      </div>

      {loading && <p className="text-center mb-6">Carregando...</p>}

      <div ref={resultsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(mostrarFavoritos ? favoritosVisiveis : places).map(place => (
          <RestaurantCard
            key={place.id || place.location_id}
            isFavorite={JSON.parse(localStorage.getItem('favoritos') || '[]').includes(place.id || place.location_id)}
            place={{ ...place, id: place.id || place.location_id }}
            onSelect={async () => {
              try {
                const res = await fetch(`/api/restaurantes/${place.location_id || place.id}`);
                const data = await res.json();
                setSelectedPlace({ ...place, ...data, id: place.id || place.location_id });
              } catch (error) {
                console.error('Erro ao buscar detalhes do restaurante:', error);
              }
            }}
            onRequireLogin={handleRequireLogin}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>

      {!loading && (mostrarFavoritos ? favoritosVisiveis.length === 0 : places.length === 0) && (
        <p className="text-center text-gray-600 mt-6">{mostrarFavoritos ? 'Você ainda não tem restaurantes favoritos.' : 'Nenhum restaurante encontrado para esses filtros.'}</p>
      )}

      {selectedPlace && selectedPlace.detalhes_json && (
        <Modal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
      )}

      {showCadastroModal && (
        <CadastroModal onClose={() => setShowCadastroModal(false)} onSuccess={handleCadastroSucesso} />
      )}
    </div>
  );
}
