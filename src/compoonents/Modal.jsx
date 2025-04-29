import { motion } from 'framer-motion';

export default function Modal({ place, onClose }) {
  const avaliacao = place.avaliacao_json ? JSON.parse(place.avaliacao_json) : {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <motion.div 
        initial={{ scale: 0.7, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.7, opacity: 0 }}
        className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg overflow-y-auto max-h-[90vh] relative"
      >
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">
          ✕
        </button>

        <img 
          src={place.imagem_url || '/placeholder.png'} 
          alt={place.nome} 
          className="w-full h-48 object-cover rounded mb-4"
          onError={(e) => { e.target.src = '/placeholder.png'; }}
        />

        <h2 className="text-2xl font-bold mb-2">{place.nome}</h2>
        <p className="text-gray-600 mb-2">{place.categoria || 'Categoria não definida'}</p>
        <p className="text-yellow-500 mb-4">{place.nota ? `⭐ ${place.nota}` : 'Sem nota'}</p>

        {avaliacao.priceTag && (
          <p className="text-green-700 font-semibold mb-2">Preço: {avaliacao.priceTag}</p>
        )}

        {avaliacao.parentGeoName && (
          <p className="text-gray-500 mb-2">Região: {avaliacao.parentGeoName}</p>
        )}

        {avaliacao.establishmentTypeAndCuisineTags && avaliacao.establishmentTypeAndCuisineTags.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-1">Culinárias:</h3>
            <ul className="list-disc list-inside">
              {avaliacao.establishmentTypeAndCuisineTags.map((tag, index) => (
                <li key={index}>{tag}</li>
              ))}
            </ul>
          </div>
        )}

        {avaliacao.description && (
          <p className="text-gray-700 mb-4">{avaliacao.description}</p>
        )}

        {avaliacao.webUrl && (
          <a 
            href={avaliacao.webUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block text-center bg-blue-600 hover:bg-blue-800 text-white py-2 rounded mt-4"
          >
            Ver no TripAdvisor
          </a>
        )}
      </motion.div>
    </div>
  );
}
