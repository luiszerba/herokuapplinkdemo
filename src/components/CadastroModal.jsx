import { useState } from 'react';

export default function CadastroModal({ onClose, onSuccess }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const usuario = { nome, cpf, telefone, email };
    localStorage.setItem('usuario', JSON.stringify(usuario));

    window.dispatchEvent(new CustomEvent('usuarioCadastrado', { detail: usuario }));

    onSuccess(usuario);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
        <button
          onClick={() => {
            setNome('');
            setCpf('');
            setTelefone('');
            setEmail('');
            onClose();
          }}
          className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-700 rounded-full p-1"
        >
          ✖
        </button>
        <h2 className="text-2xl font-bold mb-4">Nos conte um pouco quem é você !</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} className="w-full border p-2 rounded" required />
          <input type="text" placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} className="w-full border p-2 rounded" required />
          <input type="tel" placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full border p-2 rounded" required />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded" required />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Cadastrar</button>
        </form>
      </div>
    </div>
  );
}