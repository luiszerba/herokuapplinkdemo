import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ place, onClose }) {
  const detalhe = place?.detalhes_json;
  if (!detalhe) return null;

  const imageUrl = (() => {
    const sizes = detalhe?.heroMedia?.media?.[0]?.data?.sizes;
    if (Array.isArray(sizes) && sizes.length > 0) {
      return sizes[sizes.length - 1].url;
    }
    return '/placeholder-small.jpg';
  })();

  const name = place.nome || detalhe?.overview?.name || 'Restaurante';
  const rating = place.nota || detalhe?.overview?.rating || null;
  const address = detalhe?.location?.address?.address || place?.parent_geo_name || 'Endereço não informado';
  const neighborhood = detalhe?.location?.neighborhood?.text || '';
  const aboutItems = detalhe?.restaurantAbout?.content?.map(item => item?.collapsibleTextSubsection?.title || item?.collapsibleTextSubsectionText?.text)?.filter(Boolean) || [];
  const openHours = detalhe?.openHours?.hoursForDays || [];
  const facilities = detalhe?.about?.content?.flatMap(f => f?.list?.map(l => l.text) || []) || [];
  const reviews = detalhe?.reviews?.content || [];
  const questions = detalhe?.qA?.content || [];

  const tabs = [
    { id: 'sobre', label: '🧾 Sobre' },
    { id: 'horario', label: '🕒 Horário de Funcionamento' },
    { id: 'facilidades', label: '🎯 Facilidades' },
    { id: 'avaliacoes', label: '🌟 Avaliações' },
    { id: 'faq', label: '❓ Perguntas Frequentes' },
  ];

  const [activeTab, setActiveTab] = useState('sobre');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 overflow-auto p-4 sm:p-6 flex justify-center items-center"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="bg-white rounded-lg overflow-hidden shadow-lg w-full max-w-4xl relative mx-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-700 rounded-full p-2"
        >
          ✖
        </button>

        <img
          src={imageUrl}
          alt={name}
          onError={(e) => {
            e.target.src = '/placeholder-small.jpg';
            e.target.className = 'w-full h-60 object-cover';
          }}
          className="w-full h-60 object-cover"
        />

        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-1">
  <h2 className="text-2xl sm:text-3xl font-bold">{name}</h2>
  <button onClick={() => {
    const favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    let updated;
    let isFav = false;
    if (favoritos.includes(place.id)) {
      updated = favoritos.filter(id => id !== place.id);
    } else {
      updated = [...favoritos, place.id];
      isFav = true;
    }
    localStorage.setItem('favoritos', JSON.stringify(updated));
    document.getElementById(`modal-heart-${place.id}`).innerText = isFav ? '❤️' : '🤍';
  }} className="text-xl text-red-500 hover:scale-110 transition-transform">
    <span id={`modal-heart-${place.id}`}>{JSON.parse(localStorage.getItem('favoritos') || '[]').includes(place.id) ? '❤️' : '🤍'}</span>
  </button>
</div>
          {rating && <p className="text-yellow-500 mb-1">⭐ {rating}</p>}
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{address}{neighborhood && ` - ${neighborhood}`}</p>

          <div className="flex gap-2 border-b mb-4 overflow-x-auto text-sm sm:text-base">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 whitespace-nowrap ${activeTab === tab.id ? 'border-b-4 border-blue-500 font-semibold' : 'text-gray-500'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'sobre' && (
              <motion.div key="sobre" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {aboutItems.length > 0 ? (
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    {aboutItems.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                ) : <p className="text-gray-500">Nenhuma informação disponível.</p>}
              </motion.div>
            )}

            {activeTab === 'horario' && (
              <motion.div key="horario" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  {openHours.map((day, idx) => (
                    <li key={idx}>{day.dayName}: {day?.localizedIntervals?.[0]?.text || '—'}</li>
                  ))}
                </ul>
              </motion.div>
            )}

            {activeTab === 'facilidades' && (
              <motion.div key="facilidades" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  {facilities.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </motion.div>
            )}

            {activeTab === 'avaliacoes' && (
              <motion.div key="avaliacoes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="space-y-3">
                  {reviews.slice(0, 3).map((review, idx) => (
                    <div key={idx} className="border-l-4 border-yellow-400 pl-4 italic text-gray-700 bg-yellow-50 p-3 rounded shadow-sm">
                      <p dangerouslySetInnerHTML={{ __html: review.htmlText?.text || '' }} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'faq' && (
              <motion.div key="faq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ul className="list-disc pl-5 text-gray-700 space-y-2">
                  {questions.slice(0, 3).map((q, idx) => (
                    <li key={idx}>
                      <strong>Pergunta:</strong> {q?.question?.text || '—'}<br />
                      <strong>Resposta:</strong> {q?.topAnswer?.text || 'Sem resposta'}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
