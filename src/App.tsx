import { useEffect, useState } from 'react';
import './App.scss';
import DespesasForm from './components/Despesas';
import RendasForm from './components/Rendas';
import Filtro from './components/Filtro';
import DespesasList from './components/DespesasList';
import RendasList from './components/RendasList';
import Auth from './components/Auth';
import InvestmentsPage from './components/InvestmentsPage'; // Novo componente para a página de investimentos
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { collection, query, onSnapshot, where, doc, deleteDoc } from 'firebase/firestore';

function App() {
  // Estado para autenticação do usuário
  const [user, setUser] = useState<User | null>(null);

  // Estado para gerenciar a página atual: 'dashboard' ou 'investments'
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' como página inicial

  // Estados para o resumo financeiro geral (todo o período)
  const [overallExpenses, setOverallExpenses] = useState(0);
  const [overallIncomes, setOverallIncomes] = useState(0);
  const [overallBalance, setOverallBalance] = useState(0);

  // Obtém o ano e mês atuais para o estado inicial do filtro
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

  // Estados para seleção de filtro (ano, mês, categoria)
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Estados para o resumo financeiro mensal (filtrado por mês/ano selecionado)
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [monthlyIncomes, setMonthlyIncomes] = useState(0);
  const [monthlyBalance, setMonthlyBalance] = useState(0);

  // Estados para controlar a visibilidade dos formulários (dropdowns)
  const [showDespesasForm, setShowDespesasForm] = useState(false);
  const [showRendasForm, setShowRendasForm] = useState(false);

  // Efeito para escutar mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Reseta o filtro para o mês/ano atual e categoria 'all' ao logar/deslogar
      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);
      setSelectedCategory('all');
      // Volta para a dashboard ao logar/deslogar
      setCurrentPage('dashboard'); 
    });
    return () => unsubscribe();
  }, [currentYear, currentMonth]);

  // Efeito para buscar e calcular despesas e rendas gerais (todo o período)
  useEffect(() => {
    if (!user) {
      setOverallExpenses(0);
      setOverallIncomes(0);
      setOverallBalance(0);
      return;
    }

    const userId = user.uid;
    const expensesCollectionRef = collection(db, `users/${userId}/expenses`);
    const incomesCollectionRef = collection(db, `users/${userId}/incomes`);

    const unsubscribeOverallExpenses = onSnapshot(query(expensesCollectionRef), (snapshot) => {
      let currentTotal = 0;
      snapshot.forEach(doc => {
        currentTotal += (doc.data().value || 0);
      });
      setOverallExpenses(currentTotal);
    }, (error) => {
      console.error("Erro ao carregar totais gerais de despesas:", error);
    });

    const unsubscribeOverallIncomes = onSnapshot(query(incomesCollectionRef), (snapshot) => {
      let currentTotal = 0;
      snapshot.forEach(doc => {
        currentTotal += (doc.data().value || 0);
      });
      setOverallIncomes(currentTotal);
    }, (error) => {
      console.error("Erro ao carregar totais gerais de rendas:", error);
    });

    return () => {
      unsubscribeOverallExpenses();
      unsubscribeOverallIncomes();
    };
  }, [user]);

  // Efeito para calcular despesas e rendas mensais com base no ano/mês selecionado
  useEffect(() => {
    if (!user) {
      setMonthlyExpenses(0);
      setMonthlyIncomes(0);
      setMonthlyBalance(0);
      return;
    }

    const userId = user.uid;
    const expensesCollectionRef = collection(db, `users/${userId}/expenses`);
    const incomesCollectionRef = collection(db, `users/${userId}/incomes`);

    if (selectedMonth !== 'all') {
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

      const unsubscribeMonthlyExpenses = onSnapshot(monthlyExpensesQuery, (snapshot) => {
        let currentMonthlyTotal = 0;
        snapshot.forEach(doc => {
          currentMonthlyTotal += (doc.data().value || 0);
        });
        setMonthlyExpenses(currentMonthlyTotal);
      }, (error) => {
        console.error("Erro ao carregar totais mensais de despesas:", error);
      });

      const unsubscribeMonthlyIncomes = onSnapshot(monthlyIncomesQuery, (snapshot) => {
        let currentMonthlyTotal = 0;
        snapshot.forEach(doc => {
          currentMonthlyTotal += (doc.data().value || 0);
        });
        setMonthlyIncomes(currentMonthlyTotal);
      }, (error) => {
        console.error("Erro ao carregar totais mensais de rendas:", error);
      });

      return () => {
        unsubscribeMonthlyExpenses();
        unsubscribeMonthlyIncomes();
      };
    } else {
      setMonthlyExpenses(0);
      setMonthlyIncomes(0);
      setMonthlyBalance(0);
    }
  }, [user, selectedYear, selectedMonth]);

  // Efeito para atualizar o saldo geral
  useEffect(() => {
    setOverallBalance(overallIncomes - overallExpenses);
  }, [overallIncomes, overallExpenses]);

  // Efeito para atualizar o saldo mensal
  useEffect(() => {
    setMonthlyBalance(monthlyIncomes - monthlyExpenses);
  }, [monthlyIncomes, monthlyExpenses]);

  // Função para lidar com o logout do usuário
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Logout bem-sucedido!');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      console.log('Erro ao fazer logout.');
    }
  };

  // Função para deletar um item do Firestore
  const handleDeleteItem = async (collectionName: string, itemId: string) => {
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

  // Funções para lidar com mudanças nos filtros
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setSelectedCategory('all');
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
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
            {/* Botões de navegação entre as páginas */}
            <nav className="main-nav">
              <button
                className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentPage('dashboard')}
              >
                Dashboard Financeira
              </button>
              <button
                className={`nav-button ${currentPage === 'investments' ? 'active' : ''}`}
                onClick={() => setCurrentPage('investments')}
              >
                Meus Investimentos
              </button>
            </nav>

            {/* Renderização condicional da página atual */}
            {currentPage === 'dashboard' && (
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
                      <div className="monthly-summary-animated">
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
                      user={user}
                      selectedYear={selectedYear}
                      selectedMonth={selectedMonth}
                      selectedCategory={selectedCategory}
                      onYearChange={handleYearChange}
                      onMonthChange={handleMonthChange}
                      onCategoryChange={handleCategoryChange}
                    />
                  </section>
                </div>

                <section className="transaction-forms-section">
                  <div className="form-dropdown">
                    <div className="dropdown-header" onClick={() => setShowDespesasForm(!showDespesasForm)}>
                      <h2>Nova Despesa</h2>
                      <i className={`fi fi-rr-angle-small-down ${showDespesasForm ? 'rotated' : ''}`}></i>
                    </div>
                    {showDespesasForm && (
                      <div className="dropdown-content dropdown-content-animated">
                        <DespesasForm />
                      </div>
                    )}
                  </div>

                  <div className="form-dropdown">
                    <div className="dropdown-header" onClick={() => setShowRendasForm(!showRendasForm)}>
                      <h2>Nova Renda</h2>
                      <i className={`fi fi-rr-angle-small-down ${showRendasForm ? 'rotated' : ''}`}></i>
                    </div>
                    {showRendasForm && (
                      <div className="dropdown-content dropdown-content-animated">
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
                    selectedCategory={selectedCategory}
                    onDeleteItem={handleDeleteItem}
                  />
                  <RendasList
                    user={user}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    onDeleteItem={handleDeleteItem}
                  />
                </section>
              </>
            )}

            {/* Renderiza a página de investimentos se currentPage for 'investments' */}
            {currentPage === 'investments' && (
              <InvestmentsPage user={user} />
            )}
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
