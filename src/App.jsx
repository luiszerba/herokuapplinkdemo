import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [paises, setPaises] = useState([]);
  const [regioes, setRegioes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [restaurantes, setRestaurantes] = useState([]);
  const [paisSelecionado, setPaisSelecionado] = useState('');
  const [regiaoSelecionada, setRegiaoSelecionada] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [notaMinima, setNotaMinima] = useState(0);
  const [pagina, setPagina] = useState(1);
  const resultsRef = useRef(null);

  useEffect(() => {
    fetch('/api/paises')
      .then(res => res.json())
      .then(setPaises)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (paisSelecionado) {
      fetch(`/api/regioes?pais=${encodeURIComponent(paisSelecionado)}`)
        .then(res => res.json())
        .then(setRegioes)
        .catch(console.error);

      fetch(`/api/categorias?pais=${encodeURIComponent(paisSelecionado)}`)
        .then(res => res.json())
        .then(setCategorias)
        .catch(console.error);
    }
  }, [paisSelecionado]);

  const buscarRestaurantes = () => {
    const params = new URLSearchParams({
      pais: paisSelecionado,
      regiao: regiaoSelecionada,
      categoria: categoriaSelecionada,
      notaMinima,
      pagina,
    });

    fetch(`/api/restaurantes?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setRestaurantes(data);
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(console.error);
  };

  return (
    <div className="App">
      <h1>🌍 Explore Restaurantes pelo Mundo</h1>

      <div className="filtros">
        <select value={paisSelecionado} onChange={e => setPaisSelecionado(e.target.value)}>
          <option value=''>Selecione um País</option>
          {paises.map((pais, idx) => (
            <option key={idx} value={pais}>{pais}</option>
          ))}
        </select>

        {regioes.length > 0 && (
          <select value={regiaoSelecionada} onChange={e => setRegiaoSelecionada(e.target.value)}>
            <option value=''>Todas as Regiões</option>
            {regioes.map((r, idx) => (
              <option key={idx} value={r}>{r}</option>
            ))}
          </select>
        )}

        {categorias.length > 0 && (
          <select value={categoriaSelecionada} onChange={e => setCategoriaSelecionada(e.target.value)}>
            <option value=''>Todas as Categorias</option>
            {categorias.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </select>
        )}

        <select value={notaMinima} onChange={e => setNotaMinima(e.target.value)}>
          <option value={0}>Nota mínima</option>
          <option value={3}>3 estrelas</option>
          <option value={4}>4 estrelas</option>
          <option value={4.5}>4.5 estrelas</option>
          <option value={5}>5 estrelas</option>
        </select>

        <button onClick={buscarRestaurantes}>Buscar</button>
      </div>

      <div ref={resultsRef} className="resultados">
        {restaurantes.length === 0 && <p>Nenhum restaurante encontrado. 🍽️</p>}
        {restaurantes.map((r, idx) => (
          <div key={idx} className="card">
            <img src={r.imagem_url || '/default_restaurant.jpg'} alt={r.nome} onError={(e) => e.target.src='/default_restaurant.jpg'} />
            <h2>{r.nome}</h2>
            <p><strong>Categoria:</strong> {r.categoria}</p>
            <p><strong>Nota:</strong> {r.nota || 'Sem avaliação'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
