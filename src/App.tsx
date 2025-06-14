import { useEffect, useState } from 'react';
import './App.scss';
import DespesasForm from './components/Despesas';
import RendasForm from './components/Rendas';
import Filtro from './components/Filtro';
import DespesasList from './components/DespesasList';
import RendasList from './components/RendasList';
import Auth from './components/Auth';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, onSnapshot } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState<any | null>(null);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [totalIncomes, setTotalIncomes] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);

  // Estados para o filtro
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  // Novos estados para controlar a visibilidade dos formulários
  const [showDespesasForm, setShowDespesasForm] = useState<boolean>(false);
  const [showRendasForm, setShowRendasForm] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);
    });
    return () => unsubscribe();
  }, [currentYear, currentMonth]);

  useEffect(() => {
    if (!user) {
      setTotalExpenses(0);
      setTotalIncomes(0);
      setBalance(0);
      return;
    }

    let unsubscribeOverallExpenses: () => void;
    let unsubscribeOverallIncomes: () => void;

    const userId = user.uid;

    const expensesCollectionRef = collection(db, `users/${userId}/expenses`);
    const incomesCollectionRef = collection(db, `users/${userId}/incomes`);

    unsubscribeOverallExpenses = onSnapshot(query(expensesCollectionRef), (snapshot) => {
      let currentTotal = 0;
      snapshot.forEach(doc => {
        currentTotal += (doc.data().value || 0);
      });
      setTotalExpenses(currentTotal);
    }, (error) => {
      console.error("Erro ao carregar totais gerais de despesas:", error);
    });

    unsubscribeOverallIncomes = onSnapshot(query(incomesCollectionRef), (snapshot) => {
      let currentTotal = 0;
      snapshot.forEach(doc => {
        currentTotal += (doc.data().value || 0);
      });
      setTotalIncomes(currentTotal);
    }, (error) => {
      console.error("Erro ao carregar totais gerais de rendas:", error);
    });

    return () => {
      unsubscribeOverallExpenses();
      unsubscribeOverallIncomes();
    };
  }, [user]);

  useEffect(() => {
    setBalance(totalIncomes - totalExpenses);
  }, [totalIncomes, totalExpenses]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logout bem-sucedido!');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      alert('Erro ao fazer logout.');
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Controle Financeiro Pessoal 💵</h1>
        {user && (
          <div className="user-info">
            <p>Olá, {user.email}</p>
            <button onClick={handleLogout} className="logout-button">Sair</button>
          </div>
        )}
      </header>

      <main className="app-main">
        {!user ? (
          <Auth />
        ) : (
          <>
            <div className="summary-and-filter-wrapper">
              <section className="financial-summary-section">
                <div className="summary-card">
                  <h2>Despesas Totais</h2>
                  <p className="total-value">R$ {totalExpenses.toFixed(2)}</p>
                </div>
                <div className="summary-card">
                  <h2>Rendas Totais</h2>
                  <p className="total-value">R$ {totalIncomes.toFixed(2)}</p>
                </div>
                <div className="summary-card current-balance">
                  <h2>Saldo Atual</h2>
                  <p className={`balance-value ${balance < 0 ? 'negative-balance' : 'positive-balance'}`}>
                      R$ {balance.toFixed(2)}
                  </p>
                </div>
              </section>

              <section className="filter-section">
                <Filtro
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  onYearChange={handleYearChange}
                  onMonthChange={handleMonthChange}
                />
              </section>
            </div>

            {/* Seção de Formulários com Dropdown */}
            <section className="transaction-forms-section">
              {/* Dropdown Nova Despesa */}
              <div className="form-dropdown">
                <div className="dropdown-header" onClick={() => setShowDespesasForm(!showDespesasForm)}>
                  <h2>Nova Despesa</h2>
                  <i className={`fi fi-rr-angle-small-down ${showDespesasForm ? 'rotated' : ''}`}></i>
                </div>
                {showDespesasForm && (
                  <div className="dropdown-content">
                    <DespesasForm />
                  </div>
                )}
              </div>

              {/* Dropdown Nova Renda */}
              <div className="form-dropdown">
                <div className="dropdown-header" onClick={() => setShowRendasForm(!showRendasForm)}>
                  <h2>Nova Renda</h2>
                  <i className={`fi fi-rr-angle-small-down ${showRendasForm ? 'rotated' : ''}`}></i>
                </div>
                {showRendasForm && (
                  <div className="dropdown-content">
                    <RendasForm />
                  </div>
                )}
              </div>
            </section>

            <section className="transaction-lists-section">
              <DespesasList user={user} selectedYear={selectedYear} selectedMonth={selectedMonth} />
              <RendasList user={user} selectedYear={selectedYear} selectedMonth={selectedMonth} />
            </section>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 @IagoLeal</p>
      </footer>
    </div>
  );
}

export default App;
