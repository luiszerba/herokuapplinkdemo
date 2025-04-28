import React, { useEffect, useState } from 'react';

function App() {
  const [restaurantes, setRestaurantes] = useState([]);
  const [paisesDisponiveis, setPaisesDisponiveis] = useState([]);
  const [paisSelecionado, setPaisSelecionado] = useState('');
  const [notaMinima, setNotaMinima] = useState(0);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([
    'Cafe', 'Indian', 'French', 'Japanese', 'Chinese', 'Seafood', 'Pizza', 'Steakhouse', 'Italian', 'Mexican'
  ]);

  useEffect(() => {
    fetchPaises();
  }, []);

  useEffect(() => {
    if (paisSelecionado) {
      fetchRestaurantes();
    }
  }, [paisSelecionado, notaMinima, categoriaSelecionada, paginaAtual]);

  const fetchPaises = async () => {
    try {
      const response = await fetch('/api/paises');
      const data = await response.json();
      setPaisesDisponiveis(data);
      setPaisSelecionado(data[0] || '');
    } catch (error) {
      console.error('Erro ao buscar países:', error);
    }
  };

  const fetchRestaurantes = async () => {
    try {
      setCarregando(true);
      setErro(false);
      const response = await fetch(`/api/restaurantes?pais=${paisSelecionado}&notaMinima=${notaMinima}&categoria=${categoriaSelecionada}&pagina=${paginaAtual}`);
      const data = await response.json();
      setRestaurantes(data);
      const novasCategorias = new Set(categoriasDisponiveis);
      data.forEach(item => {
        if (item.categoria) novasCategorias.add(item.categoria);
      });
      setCategoriasDisponiveis(Array.from(novasCategorias));
    } catch (error) {
      console.error('Erro ao buscar restaurantes:', error);
      setErro(true);
    } finally {
      setCarregando(false);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/fallback.jpg';
    e.target.alt = 'Imagem não disponível';
    e.target.style.objectFit = 'contain';
    e.target.style.backgroundColor = '#f0f0f0';
  };

  const corNota = (nota) => {
    if (nota >= 4.5) return 'text-yellow-500';
    if (nota >= 4) return 'text-green-400';
    if (nota >= 3) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <h1 className="text-3xl font-extrabold text-center text-blue-800 mb-8">🌍 Explore Restaurantes pelo Mundo</h1>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <select
          className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={paisSelecionado}
          onChange={(e) => {
            setPaisSelecionado(e.target.value);
            setPaginaAtual(1);
          }}
        >
          {paisesDisponiveis.map((pais) => (
            <option key={pais} value={pais}>{pais}</option>
          ))}
        </select>

        <select
          className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={notaMinima}
          onChange={(e) => {
            setNotaMinima(e.target.value);
            setPaginaAtual(1);
          }}
        >
          <option value={0}>Todas as notas</option>
          <option value={4}>Nota 4+</option>
          <option value={4.5}>Nota 4.5+</option>
          <option value={5}>Nota 5</option>
        </select>

        <select
          className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={categoriaSelecionada}
          onChange={(e) => {
            setCategoriaSelecionada(e.target.value);
            setPaginaAtual(1);
          }}
        >
          <option value="">Todas as categorias</option>
          {categoriasDisponiveis.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {carregando ? (
        <p className="text-center text-blue-600 animate-pulse">Carregando restaurantes...</p>
      ) : erro ? (
        <p className="text-center text-red-500">Erro ao carregar dados. Tente novamente.</p>
      ) : restaurantes.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum restaurante encontrado para esses filtros.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {restaurantes.map((restaurante) => (
            <div key={restaurante.location_id} className="border rounded-xl overflow-hidden shadow-lg bg-white hover:shadow-2xl transition">
              <img 
                src={restaurante.imagem_url || '/fallback.jpg'} 
                alt={restaurante.nome || 'Imagem do restaurante'} 
                className="w-full h-48 object-cover" 
                onError={handleImageError}
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold truncate mb-1" title={restaurante.nome}>{restaurante.nome}</h2>
                <p className="text-gray-500 text-xs mb-1 capitalize">{restaurante.avaliacao_json?.parentGeoName}</p>
                <p className="text-gray-600 text-sm mb-1 capitalize">{restaurante.categoria}</p>
                <p className={`${corNota(restaurante.nota)} font-bold`}>{restaurante.nota} ⭐</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!carregando && restaurantes.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            className="px-4 py-2 bg-blue-200 hover:bg-blue-300 text-blue-800 font-semibold rounded-lg"
            onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
            disabled={paginaAtual === 1}
          >
            Página anterior
          </button>

          <span className="font-semibold">Página {paginaAtual}</span>

          <button
            className="px-4 py-2 bg-blue-200 hover:bg-blue-300 text-blue-800 font-semibold rounded-lg"
            onClick={() => setPaginaAtual((p) => p + 1)}
          >
            Próxima página
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
