import { useEffect, useState } from 'react';
import './App.scss';
import DespesasForm from './components/Despesas';
import RendasForm from './components/Rendas';
import Filtro from './components/Filtro';
import DespesasList from './components/DespesasList';
import RendasList from './components/RendasList';
import Auth from './components/Auth';
import { auth, db } from './firebaseConfig'; // Assuming firebaseConfig exports auth and db
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, onSnapshot, where, doc, deleteDoc } from 'firebase/firestore'; // Adicionado doc e deleteDoc

function App() {
  // State for user authentication
  const [user, setUser] = useState(null);

  // States for overall financial summary (all time)
  const [overallExpenses, setOverallExpenses] = useState(0);
  const [overallIncomes, setOverallIncomes] = useState(0);
  const [overallBalance, setOverallBalance] = useState(0);

  // Get current year and month for initial filter state
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

  // States for filter selection
  const [selectedYear, setSelectedYear] = useState(currentYear);
  // O filtro de mês pode ser 'all' ou um número string formatado "MM"
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // States for monthly financial summary (filtered by selected month/year)
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [monthlyIncomes, setMonthlyIncomes] = useState(0);
  const [monthlyBalance, setMonthlyBalance] = useState(0);

  // States to control form visibility
  const [showDespesasForm, setShowDespesasForm] = useState(false);
  const [showRendasForm, setShowRendasForm] = useState(false);

  // Effect to listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Reset filter to current month/year when user logs in/out
      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [currentYear, currentMonth]); // Re-run if currentYear/Month changes (unlikely for practical purposes)

  // Effect to fetch and calculate overall (all-time) expenses and incomes
  useEffect(() => {
    // If no user is logged in, reset totals and exit
    if (!user) {
      setOverallExpenses(0);
      setOverallIncomes(0);
      setOverallBalance(0);
      return;
    }

    const userId = user.uid;
    const expensesCollectionRef = collection(db, `users/${userId}/expenses`);
    const incomesCollectionRef = collection(db, `users/${userId}/incomes`);

    // Subscribe to overall expenses (no filter)
    const unsubscribeOverallExpenses = onSnapshot(query(expensesCollectionRef), (snapshot) => {
      let currentTotal = 0;
      snapshot.forEach(doc => {
        currentTotal += (doc.data().value || 0);
      });
      setOverallExpenses(currentTotal);
    }, (error) => {
      console.error("Erro ao carregar totais gerais de despesas:", error);
    });

    // Subscribe to overall incomes (no filter)
    const unsubscribeOverallIncomes = onSnapshot(query(incomesCollectionRef), (snapshot) => {
      let currentTotal = 0;
      snapshot.forEach(doc => {
        currentTotal += (doc.data().value || 0);
      });
      setOverallIncomes(currentTotal);
    }, (error) => {
      console.error("Erro ao carregar totais gerais de rendas:", error);
    });

    // Cleanup overall subscriptions on unmount or user change
    return () => {
      unsubscribeOverallExpenses();
      unsubscribeOverallIncomes();
    };
  }, [user]); // Re-run when user changes

  // Effect to calculate monthly expenses and incomes based on selected year/month
  useEffect(() => {
    // If no user is logged in, reset monthly totals and exit
    if (!user) {
      setMonthlyExpenses(0);
      setMonthlyIncomes(0);
      setMonthlyBalance(0);
      return;
    }

    const userId = user.uid;
    const expensesCollectionRef = collection(db, `users/${userId}/expenses`);
    const incomesCollectionRef = collection(db, `users/${userId}/incomes`);

    // Only fetch monthly data if a specific month is selected
    if (selectedMonth !== 'all') {
      // Create queries for selected month and year
      const monthlyExpensesQuery = query(
        expensesCollectionRef,
        where("year", "==", selectedYear),
        where("month", "==", selectedMonth)
      );

      const monthlyIncomesQuery = query(
        incomesCollectionRef,
        where("year", "==", selectedYear),
        where("month", "==", selectedMonth)
      );

      // Subscribe to monthly expenses
      const unsubscribeMonthlyExpenses = onSnapshot(monthlyExpensesQuery, (snapshot) => {
        let currentMonthlyTotal = 0;
        snapshot.forEach(doc => {
          currentMonthlyTotal += (doc.data().value || 0);
        });
        setMonthlyExpenses(currentMonthlyTotal);
      }, (error) => {
        console.error("Erro ao carregar totais mensais de despesas:", error);
      });

      // Subscribe to monthly incomes
      const unsubscribeMonthlyIncomes = onSnapshot(monthlyIncomesQuery, (snapshot) => {
        let currentMonthlyTotal = 0;
        snapshot.forEach(doc => {
          currentMonthlyTotal += (doc.data().value || 0);
        });
        setMonthlyIncomes(currentMonthlyTotal);
      }, (error) => {
        console.error("Erro ao carregar totais mensais de rendas:", error);
      });

      // Cleanup monthly subscriptions on unmount or filter/user change
      return () => {
        unsubscribeMonthlyExpenses();
        unsubscribeMonthlyIncomes();
      };
    } else {
      // If 'all' months are selected, set monthly totals to 0
      setMonthlyExpenses(0);
      setMonthlyIncomes(0);
      setMonthlyBalance(0);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedYear, selectedMonth]); // Re-run when user, year, or month changes

  // Effect to update overall balance when overall expenses/incomes change
  useEffect(() => {
    setOverallBalance(overallIncomes - overallExpenses);
  }, [overallIncomes, overallExpenses]);

  // Effect to update monthly balance when monthly expenses/incomes change
  useEffect(() => {
    setMonthlyBalance(monthlyIncomes - monthlyExpenses);
  }, [monthlyIncomes, monthlyExpenses]);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Logout bem-sucedido!');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      console.log('Erro ao fazer logout.');
    }
  };

  // Function to delete an item from Firestore
  const handleDeleteItem = async (collectionName, itemId) => {
    if (!user) {
      console.error("Usuário não autenticado para deletar item.");
      return;
    }
    try {
      const itemRef = doc(db, `users/${user.uid}/${collectionName}`, itemId);
      await deleteDoc(itemRef);
      console.log(`Item deletado com sucesso da coleção ${collectionName}: ${itemId}`);
    } catch (error) {
      console.error(`Erro ao deletar item da coleção ${collectionName}:`, error);
    }
  };

  // Handle year filter change
  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Handle month filter change
  const handleMonthChange = (month) => {
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
                {/* Overall Totals */}
                <div className="summary-card">
                  <h2>Despesas Totais (Geral)</h2>
                  <p className="total-value">R$ {overallExpenses.toFixed(2)}</p>
                </div>
                <div className="summary-card">
                  <h2>Rendas Totais (Geral)</h2>
                  <p className="total-value">R$ {overallIncomes.toFixed(2)}</p>
                </div>
                <div className="summary-card current-balance">
                  <h2>Saldo Geral</h2>
                  <p className={`balance-value ${overallBalance < 0 ? 'negative-balance' : 'positive-balance'}`}>
                    R$ {overallBalance.toFixed(2)}
                  </p>
                </div>

                {/* Monthly Totals - Rendered conditionally with animation class */}
                {selectedMonth !== 'all' && (
                  <div className="monthly-summary-animated"> {/* Este div já tem a animação */}
                    <div className="summary-card monthly-summary-card">
                      <h2>Despesas Mensais</h2>
                      <p className="total-value">R$ {monthlyExpenses.toFixed(2)}</p>
                    </div>
                    <div className="summary-card monthly-summary-card">
                      <h2>Rendas Mensais</h2>
                      <p className="total-value">R$ {monthlyIncomes.toFixed(2)}</p>
                    </div>
                    <div className="summary-card current-balance monthly-summary-card">
                      <h2>Saldo Mensal</h2>
                      <p className={`balance-value ${monthlyBalance < 0 ? 'negative-balance' : 'positive-balance'}`}>
                        R$ {monthlyBalance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
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

            {/* Transaction Forms Section with Dropdown */}
            <section className="transaction-forms-section">
              {/* New Expense Dropdown */}
              <div className="form-dropdown">
                <div className="dropdown-header" onClick={() => setShowDespesasForm(!showDespesasForm)}>
                  <h2>Nova Despesa</h2>
                  <i className={`fi fi-rr-angle-small-down ${showDespesasForm ? 'rotated' : ''}`}></i>
                </div>
                {showDespesasForm && (
                  <div className="dropdown-content dropdown-content-animated"> {/* Adicionada classe de animação */}
                    <DespesasForm />
                  </div>
                )}
              </div>

              {/* New Income Dropdown */}
              <div className="form-dropdown">
                <div className="dropdown-header" onClick={() => setShowRendasForm(!showRendasForm)}>
                  <h2>Nova Renda</h2>
                  <i className={`fi fi-rr-angle-small-down ${showRendasForm ? 'rotated' : ''}`}></i>
                </div>
                {showRendasForm && (
                  <div className="dropdown-content dropdown-content-animated"> {/* Adicionada classe de animação */}
                    <RendasForm />
                  </div>
                )}
              </div>
            </section>

            <section className="transaction-lists-section">
              <DespesasList
                user={user}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onDeleteItem={handleDeleteItem} // Pass the delete function
              />
              <RendasList
                user={user}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onDeleteItem={handleDeleteItem} // Pass the delete function
              />
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
