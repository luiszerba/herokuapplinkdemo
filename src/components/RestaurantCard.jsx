import { useState, useEffect } from 'react';
import { FaRegHeart, FaHeart } from 'react-icons/fa';

export default function RestaurantCard({ place, onSelect, onRequireLogin, isFavorite: initialFavorite }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (typeof initialFavorite === 'boolean') {
      setIsFavorite(initialFavorite);
    } else {
      const favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
      setIsFavorite(favoritos.includes(place.id));
    }
  }, [place.id, initialFavorite]);

  const toggleFavorite = (e) => {
    e.stopPropagation();
    const loggedIn = localStorage.getItem('usuario');
    if (!loggedIn) {
      onRequireLogin();
      return;
    }
    let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    if (favoritos.includes(place.id)) {
      favoritos = favoritos.filter(id => id !== place.id);
      setIsFavorite(false);
    } else {
      favoritos.push(place.id);
      setIsFavorite(true);
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
  };

  const imageUrl =
    place.imagem_url ||
    place?.detalhes_json?.heroMedia?.media?.[0]?.data?.sizes?.at(-1)?.url ||
    '/placeholder-small.jpg';

  return (
    <div
      key={place.id}
      className="border rounded shadow p-4 cursor-pointer relative"
      onClick={onSelect}
    >
      <img
        src={imageUrl}
        alt={place.nome}
        className="w-full h-40 object-cover rounded mb-4 max-h-48 aspect-square transition-all duration-500 ease-in-out"
        onError={(e) => {
          e.target.src = '/placeholder-small.jpg';
        }}
      />
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-xl">{place.nome || place?.detalhes_json?.overview?.name || 'Sem nome'}</h2>
        <button onClick={toggleFavorite} className="ml-2">
          {isFavorite ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-gray-400 hover:text-red-400" />
          )}
        </button>
      </div>
      <p className="text-gray-600 mb-2">{place.categoria || place?.detalhes_json?.category?.name || 'Sem categoria'}</p>
      <p className="text-yellow-500 mb-2">{place.nota ? `⭐ ${place.nota}` : (place?.detalhes_json?.overview?.rating ? `⭐ ${place.detalhes_json.overview.rating}` : 'Sem nota')}</p>
      <p className="text-sm text-gray-500">{place.parent_geo_name}</p>
    </div>
  );
}