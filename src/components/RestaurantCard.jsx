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

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const loggedIn = usuario?.email;
    if (!loggedIn) {
      onRequireLogin();
      return;
    }

    let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    let isAdding = true;

    if (favoritos.includes(place.id)) {
      favoritos = favoritos.filter(id => id !== place.id);
      setIsFavorite(false);
      isAdding = false;
    } else {
      favoritos.push(place.id);
      setIsFavorite(true);
    }

    localStorage.setItem('favoritos', JSON.stringify(favoritos));

    try {
      const payload = {
        CreatedDate: Date.now(),
        CreatedById: '005Hs00000Grqj2IAB',
        locationid__c: { string: place.id },
        restaurant_name__c: { string: place.nome || place?.detalhes_json?.overview?.name || 'Desconhecido' },
        useremail__c: { string: usuario.email },
        favoritado__c: { string: isAdding.toString() },
        Name__c: { string: usuario.nome || 'Anônimo' }
      };

      /*SalesforceInteractions.sendEvent({
        interaction: {
          name: "RestaurantInteraction",
          //eventType: "restaurantInteraction",
          //category: "restaurants",
          customername: { string: usuario.nome || 'Anônimo' },
          customeremail: { string: usuario.email },
          cpf: { string: usuario.cpf },
          favoritado: { string: isAdding.toString() },
          locationId: { string: place.id },
          restaurantName: { string: place.nome || place?.detalhes_json?.overview?.name || 'Desconhecido' }
        }
      });*/

      SalesforceInteractions.sendEvent({
        interaction: {
          name: "RestaurantInteraction",
          //eventType: "restaurantInteraction",
          //category: "restaurants",
          restaurantInteraction_restaurantName__c: { string: usuario.nome || 'Anônimo' },
          restaurantInteraction_customeremail__c: { string: usuario.email },
          restaurantInteraction_cpf__c: { string: usuario.cpf },
          restaurantInteraction_favoritado__c: { string: isAdding.toString() },
          restaurantInteraction_locationId__c: { string: place.id },
          restaurantInteraction_restaurantName__c: { string: place.nome || place?.detalhes_json?.overview?.name || 'Desconhecido' }
        }
      });


      const url = new URL('/api/RestFavorites', window.location.origin);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.text();
      console.log('[payload enviado]:', JSON.stringify(payload, null, 2));
      console.log('📤 Evento enviado. Resposta:', result);
    } catch (err) {
      console.error('Erro ao enviar evento:', err);
    }
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
