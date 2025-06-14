import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig'; // Importe auth e db
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Funções do Firestore

function Rendas() {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(''); // ESTADO PARA A DATA (ex: "YYYY-MM-DD")
  const [message, setMessage] = useState(''); // Para mensagens de sucesso/erro

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
    
    if (!description || !date) {
        setMessage('Por favor, preencha todos os campos.');
        return;
    }

    // Extrair ano e mês da string de data (YYYY-MM-DD)
    let year;
    let month;
    if (date) {
      const dateParts = date.split('-'); // Divide a string "YYYY-MM-DD"
      year = parseInt(dateParts[0]); // Pega o ano como número
      month = dateParts[1]; // Pega o mês como string (ex: "01", "12")
    } else {
      // Fallback para o ano e mês atuais se a data estiver vazia (embora 'required' deva evitar isso)
      const today = new Date();
      year = today.getFullYear();
      month = (today.getMonth() + 1).toString().padStart(2, '0');
    }

    try {
      // Referência à coleção de rendas do usuário logado
      const userIncomesCollectionRef = collection(db, `users/${auth.currentUser.uid}/incomes`);

      await addDoc(userIncomesCollectionRef, {
        description,
        value: incomeValue,
        date, // Mantém a data completa se desejar
        year: year,   // Adiciona o ano como um campo separado (número)
        month: month, // Adiciona o mês como um campo separado (string "MM")
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
      <div className="form-container">
        <form onSubmit={handleSubmit} className="income-focused">
          <div className="form-field">
            <label htmlFor="income-description">Descrição:</label>
            <input
              type="text"
              id="income-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="income-date">Data:</label>
            <input
              type="date"
              id="income-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
