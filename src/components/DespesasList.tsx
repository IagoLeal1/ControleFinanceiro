import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
// Certifique-se de que getMonthDateRangeStrings está disponível ou implemente-o se necessário
// import { getMonthDateRangeStrings } from '../utils/dateHelpers';

interface Expense {
  id: string;
  description: string;
  value: number;
  category: string;
  date: string; // Formato YYYY-MM-DD
  createdAt: any; // Firebase Timestamp
  // Adicione year e month se eles forem parte da sua estrutura de dados agora
  year?: number;
  month?: string;
}

interface DespesasListProps {
  user: any; // Add user prop
  selectedYear: number;
  selectedMonth: string; // 'all' ou 'MM' (ex: '06')
  onDeleteItem: (collectionName: string, itemId: string) => void; // Adicione a prop onDeleteItem
}

function DespesasList({ user, selectedYear, selectedMonth, onDeleteItem }: DespesasListProps) { // Receive onDeleteItem prop
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
    // Ajustado para usar os campos 'year' e 'month' que agora devem estar no Firestore
    // se você seguiu as instruções anteriores para Despesas.tsx
    if (selectedMonth === 'all') {
      // Para o filtro 'all' (todos os meses do ano selecionado)
      q = query(
        expensesCollectionRef,
        where('year', '==', selectedYear),
        orderBy('date', 'desc'), // Ordena pela data completa
        orderBy('createdAt', 'desc') // Sub-ordena pelo timestamp de criação
      );
    } else {
      // Para um mês específico
      q = query(
        expensesCollectionRef,
        where('year', '==', selectedYear),
        where('month', '==', selectedMonth),
        orderBy('date', 'desc'), // Ordena pela data completa
        orderBy('createdAt', 'desc') // Sub-ordena pelo timestamp de criação
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
  }, [user, selectedYear, selectedMonth]); // Dependencies include user prop and filter states

  if (loading) {
    return <p>Carregando despesas...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="despesas-list-container"> {/* Adicione um container para melhor estilização */}
      <h2>Minhas Despesas ({selectedMonth === 'all' ? selectedYear : `${selectedMonth}/${selectedYear}`})</h2>
      <div className="transaction-list">
        {expenses.length > 0 ? (
          <ul>
            {expenses.map(expense => (
              <li key={expense.id} className="expense-item">
                <div className="item-details">
                  <span className="description">{expense.description}</span>
                  <span className="value">R$ {expense.value.toFixed(2)}</span>
                  <span className="date">{expense.date}</span>
                  <span className="category">({expense.category})</span> {/* Exibindo a categoria */}
                </div>
                {/* Botão de Excluir */}
                <button
                  className="delete-button"
                  onClick={() => onDeleteItem('expenses', expense.id)} // Chama onDeleteItem passando 'expenses' e o ID
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
