import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';

interface Expense {
  id: string;
  description: string;
  value: number;
  category: string;
  date: string; // Formato YYYY-MM-DD
  createdAt: any; // Firebase Timestamp
  year?: number;
  month?: string;
}

interface DespesasListProps {
  user: any;
  selectedYear: number;
  selectedMonth: string; // 'all' ou 'MM' (ex: '06')
  selectedCategory: string; // Nova prop para a categoria selecionada
  onDeleteItem: (collectionName: string, itemId: string) => void;
}

function DespesasList({ user, selectedYear, selectedMonth, selectedCategory, onDeleteItem }: DespesasListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      setError("Faça login para ver suas despesas.");
      return;
    }

    setLoading(true);
    setError(null);

    const expensesCollectionRef = collection(db, `users/${user.uid}/expenses`);
    let q;

    // Constrói a query base para ano e mês
    let baseQuery = [
      where('year', '==', selectedYear)
    ];

    if (selectedMonth !== 'all') {
      baseQuery.push(where('month', '==', selectedMonth));
    }

    // Adiciona o filtro por categoria SE uma categoria específica for selecionada
    if (selectedCategory !== 'all') {
      baseQuery.push(where('category', '==', selectedCategory));
    }

    // Cria a query completa com todas as condições e ordenação
    q = query(
      expensesCollectionRef,
      ...baseQuery, // Aplica todas as condições 'where' dinamicamente
      orderBy('date', 'desc'),
      orderBy('createdAt', 'desc')
    );

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

    return () => unsubscribeFirestore();
  }, [user, selectedYear, selectedMonth, selectedCategory]); // Adiciona selectedCategory às dependências

  if (loading) {
    return <p>Carregando despesas...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="despesas-list-container">
      <h2>Minhas Despesas ({selectedMonth === 'all' ? selectedYear : `${selectedMonth}/${selectedYear}`}
        {selectedCategory !== 'all' ? ` - ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}` : ''})
      </h2>
      <div className="transaction-list">
        {expenses.length > 0 ? (
          <ul>
            {expenses.map(expense => (
              <li key={expense.id} className="expense-item">
                <div className="item-details">
                  <span className="description">{expense.description}</span>
                  <span className="value">R$ {expense.value.toFixed(2)}</span>
                  <span className="date">{expense.date}</span>
                  {expense.category && <span className="category">({expense.category.charAt(0).toUpperCase() + expense.category.slice(1)})</span>}
                </div>
                <button
                  className="delete-button"
                  onClick={() => onDeleteItem('expenses', expense.id)}
                >
                  Excluir
                </button>
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
