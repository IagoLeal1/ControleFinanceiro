import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig'; // Importe auth e db
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Funções do Firestore

function Despesas() {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(''); // ESTADO PARA A DATA
  const [message, setMessage] = useState(''); // Para mensagens de sucesso/erro

  // Removemos handleFocus e handleBlur, pois o foco no input agora é tratado via CSS puro
  // const [isActive, setIsActive] = useState(false);
  // const handleFocus = () => setIsActive(true);
  // const handleBlur = () => setIsActive(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Limpa mensagens anteriores

    if (!auth.currentUser) {
      setMessage('Você precisa estar logado para adicionar despesas.');
      return;
    }

    const expenseValue = parseFloat(value);
    if (isNaN(expenseValue) || expenseValue <= 0) {
      setMessage('Por favor, insira um valor válido e positivo.');
      return;
    }
    // Adicionamos a verificação para o campo 'date' também
    if (!description || !category || !date) {
        setMessage('Por favor, preencha todos os campos.');
        return;
    }

    try {
      // Referência à coleção de despesas do usuário logado
      const userExpensesCollectionRef = collection(db, `users/${auth.currentUser.uid}/expenses`);

      await addDoc(userExpensesCollectionRef, {
        description,
        value: expenseValue,
        category,
        date, // <--- **CERTIFIQUE-SE DE QUE ESTA LINHA ESTÁ AQUI**
        createdAt: serverTimestamp() // Adiciona um timestamp para ordenação
      });

      setMessage('Despesa adicionada com sucesso!');
      // Limpa o formulário
      setDescription('');
      setValue('');
      setCategory('');
      setDate(''); // Limpa o campo de data também
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error);
      setMessage('Erro ao adicionar despesa. Tente novamente.');
    }
  };

  return (
    <div>
      {/* O 'form-container' agora é mais para o estilo de card geral. */}
      {/* A classe 'expense-focused' é aplicada ao <form> para estilizar o input em foco. */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="expense-focused">
          <div className="form-field">
            <label htmlFor="expense-description">Descrição:</label>
            <input
              type="text"
              id="expense-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              // onFocus e onBlur removidos, pois o CSS puro cuida do foco
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="expense-value">Valor:</label>
            <input
              type="number"
              id="expense-value"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              // onFocus e onBlur removidos
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="expense-category">Categoria:</label>
            <input
              type="text"
              id="expense-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              // onFocus e onBlur removidos
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="expense-date">Data:</label>
            <input
              type="date"
              id="expense-date"
              value={date} // <--- **CERTIFIQUE-SE DE QUE ESTÁ LIGADO AO ESTADO 'date'**
              onChange={(e) => setDate(e.target.value)} // <--- **E ESTÁ ATUALIZANDO 'date'**
              // onFocus e onBlur removidos
              required
            />
          </div>

          <button type="submit">Adicionar Despesa</button>
          {message && <p className="form-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default Despesas;