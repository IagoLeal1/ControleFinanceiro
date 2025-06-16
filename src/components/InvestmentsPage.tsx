import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Investment {
  id: string;
  name: string;
  initialAmount: number;
  startDate: string; // Formato YYYY-MM-DD
  returnRate: number; // Ex: 0.13 para 13% a.a.
  investmentType: string; // Ex: 'CDB', 'LCI', 'Tesouro Direto'
  termMonths: number; // Prazo em meses, para cálculo de rendimento
  createdAt: any; // Firebase Timestamp
}

interface InvestmentsPageProps {
  user: any; // Recebe o objeto user do App.tsx
}

function InvestmentsPage({ user }: InvestmentsPageProps) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para o formulário de novo investimento
  const [investmentName, setInvestmentName] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [returnRate, setReturnRate] = useState('');
  const [investmentType, setInvestmentType] = useState('CDB');
  const [termMonths, setTermMonths] = useState('');
  const [formMessage, setFormMessage] = useState('');

  // Estado para controlar qual investimento na lista está expandido (detalhes)
  const [expandedInvestmentId, setExpandedInvestmentId] = useState<string | null>(null);
  // Estado para controlar a visibilidade do formulário de adicionar investimento (dropdown)
  const [showAddInvestmentForm, setShowAddInvestmentForm] = useState(false);
  // Estado para controlar a visibilidade da lista de investimentos (dropdown)
  const [showInvestmentList, setShowInvestmentList] = useState(true); // Começa aberto por padrão

  // Estados para o formulário de EDIÇÃO de investimento
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [editName, setEditName] = useState('');
  const [editInitialAmount, setEditInitialAmount] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editReturnRate, setEditReturnRate] = useState('');
  const [editInvestmentType, setEditInvestmentType] = useState('');
  const [editTermMonths, setEditTermMonths] = useState('');
  const [addMoneyAmount, setAddMoneyAmount] = useState(''); // Campo para adicionar dinheiro a um investimento existente
  const [editFormMessage, setEditFormMessage] = useState('');

  // Função para calcular o rendimento do CDB de forma simplificada
  const calculateCDBReturn = (principal: number, annualRate: number, months: number): number => {
    // Para simplificar, vamos usar juros compostos mensais.
    const monthlyRate = Math.pow((1 + annualRate), (1/12)) - 1;
    const finalAmount = principal * Math.pow((1 + monthlyRate), months);
    return finalAmount - principal;
  };

  // Efeito para buscar os investimentos do usuário no Firestore
  useEffect(() => {
    if (!user) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const userInvestmentsCollectionRef = collection(db, `users/${user.uid}/investments`);
    const q = query(userInvestmentsCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribeInvestments = onSnapshot(q, (snapshot) => {
      const fetchedInvestments: Investment[] = [];
      snapshot.forEach(doc => {
        fetchedInvestments.push({
          id: doc.id,
          name: doc.data().name,
          initialAmount: doc.data().initialAmount,
          startDate: doc.data().startDate,
          returnRate: doc.data().returnRate,
          investmentType: doc.data().investmentType,
          termMonths: doc.data().termMonths,
          createdAt: doc.data().createdAt,
        });
      });
      setInvestments(fetchedInvestments);
      setLoading(false);
    }, (err) => {
      console.error("Erro ao carregar investimentos:", err);
      setError("Erro ao carregar investimentos.");
      setLoading(false);
    });

    return () => {
      unsubscribeInvestments();
    };
  }, [user]);

  // Função para adicionar um novo investimento
  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage('');

    if (!user) {
      setFormMessage('Você precisa estar logado para adicionar investimentos.');
      return;
    }

    const amount = parseFloat(initialAmount);
    const rate = parseFloat(returnRate);
    const term = parseInt(termMonths);

    if (isNaN(amount) || amount <= 0 || isNaN(rate) || rate <= 0 || isNaN(term) || term <= 0 || !investmentName || !startDate || !investmentType) {
      setFormMessage('Por favor, preencha todos os campos com valores válidos.');
      return;
    }

    try {
      await addDoc(collection(db, `users/${user.uid}/investments`), {
        name: investmentName,
        initialAmount: amount,
        startDate: startDate,
        returnRate: rate,
        investmentType: investmentType,
        termMonths: term,
        createdAt: serverTimestamp(),
      });
      setFormMessage('Investimento adicionado com sucesso!');
      setInvestmentName('');
      setInitialAmount('');
      setStartDate('');
      setReturnRate('');
      setTermMonths('');
      setShowAddInvestmentForm(false);
    } catch (err) {
      console.error("Erro ao adicionar investimento:", err);
      setFormMessage('Erro ao adicionar investimento. Tente novamente.');
    }
  };

  // Função para iniciar a edição de um investimento
  const startEditing = (investment: Investment) => {
    setEditingInvestment(investment);
    setEditName(investment.name);
    setEditInitialAmount(investment.initialAmount.toString());
    setEditStartDate(investment.startDate);
    setEditReturnRate(investment.returnRate.toString());
    setEditInvestmentType(investment.investmentType);
    setEditTermMonths(investment.termMonths.toString());
    setAddMoneyAmount('');
    setEditFormMessage('');
  };

  // Função para salvar as edições de um investimento
  const handleUpdateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFormMessage('');

    if (!user || !editingInvestment) {
      setEditFormMessage('Erro: Nenhum investimento selecionado para edição ou usuário não logado.');
      return;
    }

    const updatedAmount = parseFloat(editInitialAmount);
    const addedMoney = parseFloat(addMoneyAmount || '0');
    const finalAmount = updatedAmount + addedMoney;

    const updatedRate = parseFloat(editReturnRate);
    const updatedTerm = parseInt(editTermMonths);

    if (isNaN(updatedAmount) || updatedAmount <= 0 || isNaN(updatedRate) || updatedRate <= 0 || isNaN(updatedTerm) || updatedTerm <= 0 || !editName || !editStartDate || !editInvestmentType) {
      setEditFormMessage('Por favor, preencha todos os campos obrigatórios com valores válidos.');
      return;
    }

    try {
      const investmentRef = doc(db, `users/${user.uid}/investments`, editingInvestment.id);
      await updateDoc(investmentRef, {
        name: editName,
        initialAmount: finalAmount,
        startDate: editStartDate,
        returnRate: updatedRate,
        investmentType: editInvestmentType,
        termMonths: updatedTerm,
      });
      setEditFormMessage('Investimento atualizado com sucesso!');
      setEditingInvestment(null);
      setAddMoneyAmount('');
    } catch (err) {
      console.error("Erro ao atualizar investimento:", err);
      setEditFormMessage('Erro ao atualizar investimento. Tente novamente.');
    }
  };

  // Função para deletar um investimento
  const handleDeleteInvestment = async (investmentId: string) => {
    if (!user) {
      console.error("Usuário não autenticado para deletar investimento.");
      return;
    }
    try {
      const itemRef = doc(db, `users/${user.uid}/investments`, investmentId);
      await deleteDoc(itemRef);
      console.log(`Investimento deletado com sucesso: ${investmentId}`);
      setEditingInvestment(null);
    } catch (error) {
      console.error(`Erro ao deletar investimento:`, error);
    }
  };

  if (loading) {
    return <p>Carregando investimentos...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="investments-page-container">
      {/* Título com a nova classe de animação */}
      <h1 className="animated-title">Meus Investimentos 📈</h1>

      {/* Seção de Adicionar Novo Investimento - Dropdown */}
      <section className="investment-form-dropdown">
        <div className="dropdown-header" onClick={() => setShowAddInvestmentForm(!showAddInvestmentForm)}>
          <h2>Adicionar Novo Investimento</h2>
          <i className={`fi fi-rr-angle-small-down ${showAddInvestmentForm ? 'rotated' : ''}`}></i>
        </div>
        {showAddInvestmentForm && (
          <div className="dropdown-content dropdown-content-animated">
            <form onSubmit={handleAddInvestment} className="investment-form">
              <div className="form-field">
                <label htmlFor="investment-name">Nome do Investimento:</label>
                <input
                  type="text"
                  id="investment-name"
                  value={investmentName}
                  onChange={(e) => setInvestmentName(e.target.value)}
                  placeholder="Ex: CDB Banco X"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="initial-amount">Valor Inicial:</label>
                <input
                  type="number"
                  id="initial-amount"
                  step="0.01"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  placeholder="R$ 1000.00"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="start-date">Data de Início:</label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="return-rate">Taxa de Retorno Anual (Ex: 0.13 para 13%):</label>
                <input
                  type="number"
                  id="return-rate"
                  step="0.001"
                  value={returnRate}
                  onChange={(e) => setReturnRate(e.target.value)}
                  placeholder="0.13"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="investment-type">Tipo de Investimento:</label>
                <select
                  id="investment-type"
                  value={investmentType}
                  onChange={(e) => setInvestmentType(e.target.value)}
                  required
                >
                  <option value="CDB">CDB</option>
                  <option value="LCI">LCI</option>
                  <option value="LCA">LCA</option>
                  <option value="Tesouro Direto">Tesouro Direto</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="term-months">Prazo (Meses):</label>
                <input
                  type="number"
                  id="term-months"
                  value={termMonths}
                  onChange={(e) => setTermMonths(e.target.value)}
                  placeholder="12"
                  required
                />
              </div>
              <button type="submit">Adicionar Investimento</button>
              {formMessage && <p className="form-message">{formMessage}</p>}
            </form>
          </div>
        )}
      </section>

      {/* Seção de Lista de Investimentos - AGORA É UM DROPDOWN */}
      <section className="investment-list-dropdown">
        <div className="dropdown-header" onClick={() => setShowInvestmentList(!showInvestmentList)}>
          <h2>Meus Investimentos Cadastrados</h2>
          <i className={`fi fi-rr-angle-small-down ${showInvestmentList ? 'rotated' : ''}`}></i>
        </div>
        {showInvestmentList && (
          <div className="dropdown-content dropdown-content-animated">
            {investments.length === 0 ? (
              <p>Nenhum investimento cadastrado ainda.</p>
            ) : (
              <ul className="investment-list">
                {investments.map((inv) => (
                  <li key={inv.id} className="investment-item">
                    <div className="investment-summary" onClick={() => setExpandedInvestmentId(expandedInvestmentId === inv.id ? null : inv.id)}>
                      <h3>{inv.name}</h3>
                      <p>Valor Inicial: R$ {inv.initialAmount.toFixed(2)}</p>
                      <p>Taxa Anual: {(inv.returnRate * 100).toFixed(2)}%</p>
                      <i className={`fi fi-rr-angle-small-down ${expandedInvestmentId === inv.id ? 'rotated' : ''}`}></i>
                    </div>
                    {expandedInvestmentId === inv.id && (
                      <div className="investment-details">
                        <p>Tipo: {inv.investmentType}</p>
                        <p>Data de Início: {inv.startDate}</p>
                        <p>Prazo: {inv.termMonths} meses</p>
                        <p>
                          Rendimento Estimado ({inv.termMonths} meses): R$ {calculateCDBReturn(inv.initialAmount, inv.returnRate, inv.termMonths).toFixed(2)}
                        </p>
                        <p>
                          Valor Total (Estimado): R$ {(inv.initialAmount + calculateCDBReturn(inv.initialAmount, inv.returnRate, inv.termMonths)).toFixed(2)}
                        </p>
                        <div className="action-buttons">
                          <button className="edit-button" onClick={() => startEditing(inv)}>Editar</button>
                          <button className="delete-button" onClick={() => handleDeleteInvestment(inv.id)}>Excluir</button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Formulário de Edição de Investimento (Modal/Overlay) */}
      {editingInvestment && (
        <div className="edit-investment-modal-overlay">
          <div className="edit-investment-modal">
            <h2>Editar Investimento</h2>
            <form onSubmit={handleUpdateInvestment} className="investment-form">
              <div className="form-field">
                <label htmlFor="edit-name">Nome do Investimento:</label>
                <input
                  type="text"
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-initial-amount">Valor Inicial (atual):</label>
                <input
                  type="number"
                  id="edit-initial-amount"
                  step="0.01"
                  value={editInitialAmount}
                  onChange={(e) => setEditInitialAmount(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="add-money-amount">Adicionar mais dinheiro:</label>
                <input
                  type="number"
                  id="add-money-amount"
                  step="0.01"
                  value={addMoneyAmount}
                  onChange={(e) => setAddMoneyAmount(e.target.value)}
                  placeholder="R$ 0.00"
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-start-date">Data de Início:</label>
                <input
                  type="date"
                  id="edit-start-date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-return-rate">Taxa de Retorno Anual (Ex: 0.13):</label>
                <input
                  type="number"
                  id="edit-return-rate"
                  step="0.001"
                  value={editReturnRate}
                  onChange={(e) => setEditReturnRate(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-investment-type">Tipo de Investimento:</label>
                <select
                  id="edit-investment-type"
                  value={editInvestmentType}
                  onChange={(e) => setEditInvestmentType(e.target.value)}
                  required
                >
                  <option value="CDB">CDB</option>
                  <option value="LCI">LCI</option>
                  <option value="LCA">LCA</option>
                  <option value="Tesouro Direto">Tesouro Direto</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="edit-term-months">Prazo (Meses):</label>
                <input
                  type="number"
                  id="edit-term-months"
                  value={editTermMonths}
                  onChange={(e) => setEditTermMonths(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-button">Salvar Alterações</button>
                <button type="button" className="cancel-button" onClick={() => setEditingInvestment(null)}>Cancelar</button>
              </div>
              {editFormMessage && <p className="form-message">{editFormMessage}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestmentsPage;
