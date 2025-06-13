import React from 'react';

function DespesasList() {
  // Simulação de dados para a lista de despesas
  const mockExpenses = [
    { id: 1, description: 'Aluguel', value: 1500.00, category: 'Moradia', date: '2025-06-01' },
    { id: 2, description: 'Supermercado', value: 350.50, category: 'Alimentação', date: '2025-06-05' },
    { id: 3, description: 'Transporte', value: 120.00, category: 'Transporte', date: '2025-06-07' },
  ];

  // Função de exclusão (por enquanto apenas um placeholder)
  const handleDelete = (id: number) => {
    console.log(`Excluir despesa com ID: ${id}`);
    // No futuro, aqui você faria a chamada para o Firebase para remover o item
  };

  return (
    <div>
      <h2>Minhas Despesas</h2>
      <div className="transaction-list">
        {mockExpenses.length > 0 ? (
          <ul>
            {mockExpenses.map(expense => (
              <li key={expense.id} className="expense-item">
                <div className="item-details">
                  <span className="description">{expense.description}</span>
                  <span className="value">R$ {expense.value.toFixed(2)}</span>
                  <span className="date">{expense.date}</span>
                </div>
                <button onClick={() => handleDelete(expense.id)} className="delete-button">X</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma despesa adicionada ainda.</p>
        )}
      </div>
    </div>
  );
}

export default DespesasList;