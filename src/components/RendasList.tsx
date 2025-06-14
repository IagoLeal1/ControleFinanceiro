import { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'; // Adicionado 'where'
import { getMonthDateRangeStrings } from '../utils/dateHelpers'; // Importa para o filtro de mês

interface Income {
  id: string;
  description: string;
  value: number;
  date: string; // Formato YYYY-MM-DD
  createdAt: any; // Firebase Timestamp
}

interface RendasListProps {
  user: any; // Add user prop
  selectedYear: number;
  selectedMonth: string; // 'all' ou 'MM' (ex: '06')
}

function RendasList({ user, selectedYear, selectedMonth }: RendasListProps) { // Receive user prop
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect now depends on the 'user' prop from App.tsx
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

    // Lógica de filtragem por ano e mês
    if (selectedMonth === 'all') {
      // Filtra apenas por ano: datas entre 'YYYY-01-01' e 'YYYY+1-01-01' (exclusivo)
      q = query(
        incomesCollectionRef,
        where('date', '>=', `${selectedYear}-01-01`),
        where('date', '<', `${selectedYear + 1}-01-01`),
        orderBy('date', 'desc'), // Ordena pela data para a consulta de range
        orderBy('createdAt', 'desc') // Sub-ordem para desempate
      );
    } else {
      // Filtra por ano e mês específicos
      const monthNum = parseInt(selectedMonth);
      const { startOfMonthString, startOfNextMonthString } = getMonthDateRangeStrings(selectedYear, monthNum);

      q = query(
        incomesCollectionRef,
        where('date', '>=', startOfMonthString),
        where('date', '<', startOfNextMonthString),
        orderBy('date', 'desc'), // Ordena pela data para a consulta de range
        orderBy('createdAt', 'desc') // Sub-ordem para desempate
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
    <div>
      <h2>Minhas Rendas</h2>
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
