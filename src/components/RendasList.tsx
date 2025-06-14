import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
// getMonthDateRangeStrings não é mais necessário, pois usaremos os campos 'year' e 'month'
// import { getMonthDateRangeStrings } from '../utils/dateHelpers';

interface Income {
  id: string;
  description: string;
  value: number;
  date: string; // Formato YYYY-MM-DD
  createdAt: any; // Firebase Timestamp
  year?: number; // Adicionado para a nova lógica de filtro
  month?: string; // Adicionado para a nova lógica de filtro
}

interface RendasListProps {
  user: any; // Add user prop
  selectedYear: number;
  selectedMonth: string; // 'all' ou 'MM' (ex: '06')
  onDeleteItem: (collectionName: string, itemId: string) => void; // Adicione a prop onDeleteItem
}

function RendasList({ user, selectedYear, selectedMonth, onDeleteItem }: RendasListProps) { // Receive onDeleteItem prop
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIncomes([]);
      setLoading(false);
      setError("Faça login para ver suas rendas.");
      return; // Exit if no user
    }

    setLoading(true); // Reinicia o loading ao mudar o usuário ou filtros
    setError(null);

    const incomesCollectionRef = collection(db, `users/${user.uid}/incomes`); // Use user.uid from prop
    let q;

    // Lógica de filtragem por ano e mês (agora usando os campos 'year' e 'month')
    if (selectedMonth === 'all') {
      // Para o filtro 'all' (todos os meses do ano selecionado)
      // Presume que 'year' está presente e é um número
      q = query(
        incomesCollectionRef,
        where('year', '==', selectedYear),
        orderBy('date', 'desc'), // Ordena pela data completa
        orderBy('createdAt', 'desc') // Sub-ordena pelo timestamp de criação
      );
    } else {
      // Filtra por ano e mês específicos
      // Presume que 'year' é um número e 'month' é uma string "MM"
      q = query(
        incomesCollectionRef,
        where('year', '==', selectedYear),
        where('month', '==', selectedMonth),
        orderBy('date', 'desc'), // Ordena pela data completa
        orderBy('createdAt', 'desc') // Sub-ordena pelo timestamp de criação
      );
    }

    const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      const incomesData: Income[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Income, 'id'>
      }));
      setIncomes(incomesData);
      setLoading(false);
    }, (err) => {
      console.error("Erro ao buscar rendas:", err);
      setError("Erro ao carregar rendas.");
      setLoading(false);
    });

    return () => unsubscribeFirestore(); // Cleanup Firestore listener
  }, [user, selectedYear, selectedMonth]); // Re-executa quando o usuário, ano ou mês mudam

  if (loading) {
    return <p>Carregando rendas...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="rendas-list-container"> {/* Adicione um container para melhor estilização */}
      <h2>Minhas Rendas ({selectedMonth === 'all' ? selectedYear : `${selectedMonth}/${selectedYear}`})</h2>
      <div className="transaction-list">
        {incomes.length > 0 ? (
          <ul>
            {incomes.map(income => (
              <li key={income.id} className="income-item">
                <div className="item-details">
                  <span className="description">{income.description}</span>
                  <span className="value">R$ {income.value.toFixed(2)}</span>
                  <span className="date">{income.date}</span>
                </div>
                {/* Botão de Excluir */}
                <button
                  className="delete-button"
                  onClick={() => onDeleteItem('incomes', income.id)} // Chama onDeleteItem passando 'incomes' e o ID
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma renda para o período selecionado.</p>
        )}
      </div>
    </div>
  );
}

export default RendasList;
