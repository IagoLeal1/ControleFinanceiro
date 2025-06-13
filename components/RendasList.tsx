import React from 'react';

function RendasList() {
  // Simulação de dados para a lista de rendas
  const mockIncomes = [
    { id: 1, description: 'Salário', value: 3000.00, date: '2025-06-05' },
    { id: 2, description: 'Freelance Design', value: 500.00, date: '2025-06-10' },
    { id: 3, description: 'Venda de Item', value: 150.00, date: '2025-06-12' },
  ];

  // Função de exclusão (por enquanto apenas um placeholder)
  const handleDelete = (id: number) => {
    console.log(`Excluir renda com ID: ${id}`);
    // No futuro, aqui você faria a chamada para o Firebase para remover o item
  };

  return (
    <div>
      <h2>Minhas Rendas</h2>
      <div className="transaction-list">
        {mockIncomes.length > 0 ? (
          <ul>
            {mockIncomes.map(income => (
              <li key={income.id} className="income-item">
                <div className="item-details">
                  <span className="description">{income.description}</span>
                  <span className="value">R$ {income.value.toFixed(2)}</span>
                  <span className="date">{income.date}</span>
                </div>
                <button onClick={() => handleDelete(income.id)} className="delete-button">X</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma renda adicionada ainda.</p>
        )}
      </div>
    </div>
  );
}

export default RendasList;