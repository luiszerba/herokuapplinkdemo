import { motion } from 'framer-motion';

export default function Modal({ place, onClose }) {
  const detalhe = place?.detalhes_json;
  if (!detalhe) return null;

  const imageUrl = detalhe?.heroMedia?.media?.[0]?.url || '/placeholder.png';
  const name = detalhe?.overview?.name || place.nome || 'Restaurante';
  const rating = detalhe?.overview?.rating || place.nota || null;
  const address = detalhe?.location?.address?.address || 'Endereço não informado';
  const neighborhood = detalhe?.location?.neighborhood?.text || '';
  const aboutItems = detalhe?.restaurantAbout?.content?.map(item => item?.collapsibleTextSubsection?.title || item?.collapsibleTextSubsectionText?.text)?.filter(Boolean) || [];
  const openHours = detalhe?.openHours?.hoursForDays || [];
  const facilities = detalhe?.about?.content?.flatMap(f => f?.list?.map(l => l.text) || []) || [];
  const reviews = detalhe?.reviews?.content || [];
  const questions = detalhe?.qA?.content || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-auto p-6">
      <motion.div
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="bg-white rounded-lg overflow-hidden shadow-lg w-full max-w-4xl relative"
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
            e.target.src = '/placeholder.png';
            e.target.className = 'w-full h-60 object-cover';
          }}
          className="w-full h-60 object-cover"
        />

        <div className="p-6 space-y-4">
          <h2 className="text-3xl font-bold">{name}</h2>
          {rating && <p className="text-yellow-500">⭐ {rating}</p>}
          <p className="text-gray-600">{address}{neighborhood && ` - ${neighborhood}`}</p>

          {aboutItems.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mt-4">Sobre</h3>
              <ul className="list-disc pl-5">
                {aboutItems.map((item, idx) => (
                  <li key={idx} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </section>
          )}

          {openHours.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mt-4">Horário de Funcionamento</h3>
              <ul className="list-disc pl-5">
                {openHours.map((day, idx) => {
                  const interval = day?.localizedIntervals?.[0]?.text;
                  return (
                    <li key={idx} className="text-gray-700">
                      {day.dayName}: {interval || '—'}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {facilities.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mt-4">Facilidades</h3>
              <ul className="list-disc pl-5">
                {facilities.map((item, idx) => (
                  <li key={idx} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </section>
          )}

          {reviews.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mt-4">Avaliações</h3>
              <ul className="list-disc pl-5">
                {reviews.slice(0, 3).map((review, idx) => (
                  <li
                    key={idx}
                    className="text-gray-700 italic"
                    dangerouslySetInnerHTML={{ __html: review.htmlText?.text || '' }}
                  />
                ))}
              </ul>
            </section>
          )}

          {questions.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mt-4">Perguntas Frequentes</h3>
              <ul className="list-disc pl-5">
                {questions.slice(0, 3).map((q, idx) => (
                  <li key={idx} className="text-gray-700">
                    <strong>Pergunta:</strong> {q?.question?.text || '—'}<br />
                    <strong>Resposta:</strong> {q?.topAnswer?.text || 'Sem resposta'}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </motion.div>
    </div>
  );
}
