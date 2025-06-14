import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig'; // Importe auth e db
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Funções do Firestore

function Rendas() {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(''); // ESTADO PARA A DATA
  const [message, setMessage] = useState(''); // Para mensagens de sucesso/erro

  // Removemos handleFocus e handleBlur
  // const [isActive, setIsActive] = useState(false);
  // const handleFocus = () => setIsActive(true);
  // const handleBlur = () => setIsActive(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Limpa mensagens anteriores

    if (!auth.currentUser) {
      setMessage('Você precisa estar logado para adicionar rendas.');
      return;
    }

    const incomeValue = parseFloat(value);
    if (isNaN(incomeValue) || incomeValue <= 0) {
      setMessage('Por favor, insira um valor válido e positivo.');
      return;
    }
    // Adicionamos a verificação para o campo 'date' também
    if (!description || !date) {
        setMessage('Por favor, preencha todos os campos.');
        return;
    }

    try {
      // Referência à coleção de rendas do usuário logado
      const userIncomesCollectionRef = collection(db, `users/${auth.currentUser.uid}/incomes`);

      await addDoc(userIncomesCollectionRef, {
        description,
        value: incomeValue,
        date, // <--- **CERTIFIQUE-SE DE QUE ESTA LINHA ESTÁ AQUI**
        createdAt: serverTimestamp() // Adiciona um timestamp para ordenação
      });

      setMessage('Renda adicionada com sucesso!');
      // Limpa o formulário
      setDescription('');
      setValue('');
      setDate(''); // Limpa o campo de data também
    } catch (error) {
      console.error("Erro ao adicionar renda:", error);
      setMessage('Erro ao adicionar renda. Tente novamente.');
    }
  };

  return (
    <div>
      {/* A classe 'income-focused' é aplicada ao <form> para estilizar o input em foco. */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="income-focused">
          <div className="form-field">
            <label htmlFor="income-description">Descrição:</label>
            <input
              type="text"
              id="income-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              // onFocus e onBlur removidos
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="income-value">Valor:</label>
            <input
              type="number"
              id="income-value"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              // onFocus e onBlur removidos
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="income-date">Data:</label>
            <input
              type="date"
              id="income-date"
              value={date} // <--- **CERTIFIQUE-SE DE QUE ESTÁ LIGADO AO ESTADO 'date'**
              onChange={(e) => setDate(e.target.value)} // <--- **E ESTÁ ATUALIZANDO 'date'**
              // onFocus e onBlur removidos
              required
            />
          </div>

          <button type="submit">Adicionar Renda</button>
          {message && <p className="form-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default Rendas;