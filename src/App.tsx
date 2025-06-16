import { useEffect, useState } from 'react';
import './App.scss';
import DespesasForm from './components/Despesas';
import RendasForm from './components/Rendas';
import Filtro from './components/Filtro';
import DespesasList from './components/DespesasList';
import RendasList from './components/RendasList';
import Auth from './components/Auth';
import { auth, db } from './firebaseConfig'; // Assumindo que firebaseConfig exporta auth e db
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth'; // CORREÇÃO: Importado User como um tipo explícito
import { collection, query, onSnapshot, where, doc, deleteDoc } from 'firebase/firestore';

function App() {
  // Correção: Especifique o tipo para o estado 'user' como User | null, usando User diretamente.
  const [user, setUser] = useState<User | null>(null);

  // Estados para o resumo financeiro geral (todos os tempos)
  const [overallExpenses, setOverallExpenses] = useState(0);
  const [overallIncomes, setOverallIncomes] = useState(0);
  const [overallBalance, setOverallBalance] = useState(0);

  // Obter o ano e mês atuais para o estado inicial do filtro
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

  // Estados para a seleção de filtro
  const [selectedYear, setSelectedYear] = useState<number>(currentYear); // Tipo explícito number
  // O filtro de mês pode ser 'all' ou um número string formatado "MM"
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth); // Tipo explícito string

  // Estados para o resumo financeiro mensal (filtrado por mês/ano selecionado)
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [monthlyIncomes, setMonthlyIncomes] = useState(0);
  const [monthlyBalance, setMonthlyBalance] = useState(0);

  // Estados para controlar a visibilidade do formulário
  const [showDespesasForm, setShowDespesasForm] = useState(false);
  const [showRendasForm, setShowRendasForm] = useState(false);

  // Efeito para escutar as mudanças de estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // currentUser já é do tipo User | null
      setUser(currentUser);
      // Redefinir o filtro para o mês/ano atual quando o usuário faz login/logout
      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);
    });
    return () => unsubscribe(); // Limpar a assinatura ao desmontar
  }, [currentYear, currentMonth]); // Reexecutar se currentYear/Month mudar (improvável para fins práticos)

  // Efeito para buscar e calcular despesas e receitas gerais (todos os tempos)
  useEffect(() => {
    // Se nenhum usuário estiver logado, redefinir os totais e sair
    if (!user) {
      setOverallExpenses(0);
      setOverallIncomes(0);
      setOverallBalance(0);
      return;
    }

    // 'uid' agora é acessado após a verificação de nulidade de 'user'
    const userId = user.uid;
    const expensesCollectionRef = collection(db, `users/${userId}/expenses`);
    const incomesCollectionRef = collection(db, `users/${userId}/incomes`);

    // Inscrever-se nas despesas gerais (sem filtro)
    const unsubscribeOverallExpenses = onSnapshot(query(expensesCollectionRef), (snapshot) => {
      let currentTotal = 0;
      snapshot.forEach(doc => {
        currentTotal += (doc.data().value || 0);
      });
      setOverallExpenses(currentTotal);
    }, (error) => {
      console.error("Erro ao carregar totais gerais de despesas:", error);
    });

    // Inscrever-se nas receitas gerais (sem filtro)
    const unsubscribeOverallIncomes = onSnapshot(query(incomesCollectionRef), (snapshot) => {
      let currentTotal = 0;
      snapshot.forEach(doc => {
        currentTotal += (doc.data().value || 0);
      });
      setOverallIncomes(currentTotal);
    }, (error) => {
      console.error("Erro ao carregar totais gerais de rendas:", error);
    });

    // Limpar as assinaturas gerais ao desmontar ou mudar o usuário
    return () => {
      unsubscribeOverallExpenses();
      unsubscribeOverallIncomes();
    };
  }, [user]); // Reexecutar quando o usuário muda

  // Efeito para calcular despesas e receitas mensais com base no ano/mês selecionado
  useEffect(() => {
    // Se nenhum usuário estiver logado, redefinir os totais mensais e sair
    if (!user) {
      setMonthlyExpenses(0);
      setMonthlyIncomes(0);
      setMonthlyBalance(0);
      return;
    }

    // 'uid' agora é acessado após a verificação de nulidade de 'user'
    const userId = user.uid;
    const expensesCollectionRef = collection(db, `users/${userId}/expenses`);
    const incomesCollectionRef = collection(db, `users/${userId}/incomes`);

    // Buscar dados mensais apenas se um mês específico for selecionado
    if (selectedMonth !== 'all') {
      // Criar consultas para o mês e ano selecionados
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

      // Inscrever-se nas despesas mensais
      const unsubscribeMonthlyExpenses = onSnapshot(monthlyExpensesQuery, (snapshot) => {
        let currentMonthlyTotal = 0;
        snapshot.forEach(doc => {
          currentMonthlyTotal += (doc.data().value || 0);
        });
        setMonthlyExpenses(currentMonthlyTotal);
      }, (error) => {
        console.error("Erro ao carregar totais mensais de despesas:", error);
      });

      // Inscrever-se nas receitas mensais
      const unsubscribeMonthlyIncomes = onSnapshot(monthlyIncomesQuery, (snapshot) => {
        let currentMonthlyTotal = 0;
        snapshot.forEach(doc => {
          currentMonthlyTotal += (doc.data().value || 0);
        });
        setMonthlyIncomes(currentMonthlyTotal);
      }, (error) => {
        console.error("Erro ao carregar totais mensais de rendas:", error);
      });

      // Limpar as assinaturas mensais ao desmontar ou mudar o filtro/usuário
      return () => {
        unsubscribeMonthlyExpenses();
        unsubscribeMonthlyIncomes();
      };
    } else {
      // Se 'todos' os meses forem selecionados, definir os totais mensais para 0
      setMonthlyExpenses(0);
      setMonthlyIncomes(0);
      setMonthlyBalance(0);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedYear, selectedMonth]); // Reexecutar quando o usuário, ano ou mês muda

  // Efeito para atualizar o saldo geral quando as despesas/receitas gerais mudam
  useEffect(() => {
    setOverallBalance(overallIncomes - overallExpenses);
  }, [overallIncomes, overallExpenses]);

  // Efeito para atualizar o saldo mensal quando as despesas/receitas mensais mudam
  useEffect(() => {
    setMonthlyBalance(monthlyIncomes - monthlyExpenses);
  }, [monthlyIncomes, monthlyExpenses]);

  // Lidar com o logout do usuário
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Logout bem-sucedido!');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      console.log('Erro ao fazer logout.');
    }
  };

  // Tipagem explícita para collectionName e itemId
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

  // Tipagem explícita para year
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  // Tipagem explícita para month
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Controle Financeiro Pessoal 💵</h1>
        {user && ( // 'user' é verificado antes de acessar 'email'
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
