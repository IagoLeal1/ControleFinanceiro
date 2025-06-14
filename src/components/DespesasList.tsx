import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { getMonthDateRangeStrings } from '../utils/dateHelpers';

interface Expense {
  id: string;
  description: string;
  value: number;
  category: string;
  date: string; // Formato YYYY-MM-DD
  createdAt: any; // Firebase Timestamp
}

interface DespesasListProps {
  user: any; // Add user prop
  selectedYear: number;
  selectedMonth: string; // 'all' ou 'MM' (ex: '06')
}

function DespesasList({ user, selectedYear, selectedMonth }: DespesasListProps) { // Receive user prop
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect now depends on the 'user' prop from App.tsx
    if (!user) {
      setExpenses([]);
      setLoading(false);
      setError("Faça login para ver suas despesas.");
      return; // Exit if no user
    }

    setLoading(true); // Reinicia o loading ao mudar o usuário ou filtros
    setError(null);

    const expensesCollectionRef = collection(db, `users/${user.uid}/expenses`); // Use user.uid from prop
    let q;

    // Lógica de filtragem por ano e mês
    if (selectedMonth === 'all') {
      q = query(
        expensesCollectionRef,
        where('date', '>=', `${selectedYear}-01-01`),
        where('date', '<', `${selectedYear + 1}-01-01`),
        orderBy('date', 'desc'),
        orderBy('createdAt', 'desc')
      );
    } else {
      const monthNum = parseInt(selectedMonth);
      const { startOfMonthString, startOfNextMonthString } = getMonthDateRangeStrings(selectedYear, monthNum);

      q = query(
        expensesCollectionRef,
        where('date', '>=', startOfMonthString),
        where('date', '<', startOfNextMonthString),
        orderBy('date', 'desc'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      const expensesData: Expense[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Expense, 'id'>
      }));
      setExpenses(expensesData);
      setLoading(false);
    }, (err) => {
      console.error("Erro ao buscar despesas:", err);
      setError("Erro ao carregar despesas.");
      setLoading(false);
    });

    return () => unsubscribeFirestore(); // Cleanup Firestore listener
  }, [user, selectedYear, selectedMonth]); // Dependencies include user prop

  if (loading) {
    return <p>Carregando despesas...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div>
      <h2>Minhas Despesas</h2>
      <div className="transaction-list">
        {expenses.length > 0 ? (
          <ul>
            {expenses.map(expense => (
              <li key={expense.id} className="expense-item">
                <div className="item-details">
                  <span className="description">{expense.description}</span>
                  <span className="value">R$ {expense.value.toFixed(2)}</span>
                  <span className="date">{expense.date}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma despesa para o período selecionado.</p>
        )}
      </div>
    </div>
  );
}

export default DespesasList;
