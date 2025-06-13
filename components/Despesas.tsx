import React, { useState } from 'react';

function Despesas() {
  const [isActive, setIsActive] = useState(false);

  const handleFocus = () => setIsActive(true);
  const handleBlur = () => setIsActive(false);

  return (
    <div>
      <h2>Nova Despesa</h2>
      <div className={`form-container ${isActive ? 'expense-active' : ''}`}>
        <form>
          {/* Cada par label/input dentro de um form-field */}
          <div className="form-field">
            <label htmlFor="expense-description">Descrição:</label>
            <input type="text" id="expense-description" onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          <div className="form-field">
            <label htmlFor="expense-value">Valor:</label>
            <input type="number" id="expense-value" step="0.01" onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          <div className="form-field">
            <label htmlFor="expense-category">Categoria:</label>
            <input type="text" id="expense-category" onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          <div className="form-field">
            <label htmlFor="expense-date">Data:</label>
            <input type="date" id="expense-date" onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          <button type="submit">Adicionar Despesa</button>
        </form>
      </div>
    </div>
  );
}

export default Despesas;