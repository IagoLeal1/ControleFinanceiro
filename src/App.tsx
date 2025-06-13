import React from 'react';
import './App.scss';
import DespesasForm from '../components/Despesas'; // Renomeado para claridade
import RendasForm from '../components/Rendas';     // Renomeado para claridade
import Filtro from '../components/Filtro';

// Novas importações para os componentes de lista
import DespesasList from '../components/DespesasList';
import RendasList from '../components/RendasList';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Controle Financeiro Pessoal</h1>
      </header>

      <main className="app-main">
        {/* Seção 1: Totais Financeiros (no topo) */}
        <section className="financial-summary-section">
          <div className="summary-card">
            <h2>Despesas Totais</h2>
            <p>Mensal: R$ 0,00</p>
            <p>Total Geral: R$ 0,00</p>
          </div>
          <div className="summary-card">
            <h2>Rendas Totais</h2>
            <p>Mensal: R$ 0,00</p>
            <p>Total Geral: R$ 0,00</p>
          </div>
          <div className="summary-card current-balance">
            <h2>Saldo Atual</h2>
            <p className="balance-value">R$ 0,00</p>
          </div>
        </section>

        {/* Seção 2: Filtros */}
        <section className="filter-section">
          <Filtro />
        </section>

        {/* Seção 3: Formulários de Transação (apenas os forms aqui) */}
        <section className="transaction-forms-section">
          <DespesasForm /> {/* Apenas o formulário de despesas */}
          <RendasForm />   {/* Apenas o formulário de rendas */}
        </section>

        {/* NOVA Seção 4: Listas de Transações (abaixo dos forms) */}
        <section className="transaction-lists-section">
          <DespesasList /> {/* Lista de despesas aqui */}
          <RendasList />   {/* Lista de rendas aqui */}
        </section>
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 Seu Nome</p>
      </footer>
    </div>
  );
}

export default App;