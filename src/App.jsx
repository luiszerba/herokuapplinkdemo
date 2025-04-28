import { useEffect, useState, useRef } from 'react';

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
    if (pagina > 1) {
      fetchPlaces();
    }
  }, [pagina]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">🌎 Explore Restaurantes pelo Mundo</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <select value={selectedPais} onChange={e => setSelectedPais(e.target.value)} className="p-3 border rounded">
          <option value="">Selecione o país</option>
          {paises.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={selectedRegiao} onChange={e => setSelectedRegiao(e.target.value)} className="p-3 border rounded">
          <option value="">Todas as regiões</option>
          {regioes.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select value={selectedCategoria} onChange={e => setSelectedCategoria(e.target.value)} className="p-3 border rounded">
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={notaMinima} onChange={e => setNotaMinima(Number(e.target.value))} className="p-3 border rounded">
          <option value={0}>Todas as notas</option>
          <option value={5}>⭐⭐⭐⭐⭐</option>
          <option value={4}>⭐⭐⭐⭐</option>
          <option value={3}>⭐⭐⭐</option>
          <option value={2}>⭐⭐</option>
          <option value={1}>⭐</option>
        </select>

        <div className="flex gap-2">
          <button onClick={handleFilter} className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded transition">Buscar</button>
          <button onClick={handleClearFilters} className="bg-gray-600 hover:bg-gray-800 text-white px-4 py-2 rounded transition">Limpar</button>
        </div>
      </div>

      {loading && <p className="text-center mb-6">🔄 Carregando...</p>}

      <div ref={resultsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {places.map(place => (
          <div key={place.id} className="border rounded-lg shadow hover:shadow-lg p-4 transform hover:scale-105 transition">
            <img
              src={place.imagem_url || '/placeholder.png'}
              alt={place.nome}
              className="w-full h-48 object-cover rounded mb-4 aspect-square transition-all duration-500 ease-in-out"
              onError={(e) => { e.target.src = '/placeholder.png'; }}
            />
            <h2 className="font-bold text-lg mb-1">{place.nome}</h2>
            <p className="text-gray-600 mb-1">{place.categoria || 'Sem categoria'}</p>
            <p className="text-yellow-500 mb-1">{place.nota ? `⭐ ${place.nota}` : 'Sem nota'}</p>
            <p className="text-sm text-gray-500">{place.parent_geo_name}</p>
          </div>
        ))}
      </div>

      {!loading && places.length === 0 && (
        <p className="text-center text-gray-500 mt-10">🚫 Nenhum restaurante encontrado. Tente outros filtros!</p>
      )}
    </div>
  );
}
