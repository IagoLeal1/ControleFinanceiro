import React, { useState } from 'react';

function Rendas() {
  const [isActive, setIsActive] = useState(false);

  const handleFocus = () => setIsActive(true);
  const handleBlur = () => setIsActive(false);

  return (
    <div>
      <h2>Nova Renda</h2>
      <div className={`form-container ${isActive ? 'income-active' : ''}`}>
        <form>
          {/* Cada par label/input dentro de um form-field */}
          <div className="form-field">
            <label htmlFor="income-description">Descrição:</label>
            <input type="text" id="income-description" onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          <div className="form-field">
            <label htmlFor="income-value">Valor:</label>
            <input type="number" id="income-value" step="0.01" onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          <div className="form-field">
            <label htmlFor="income-date">Data:</label>
            <input type="date" id="income-date" onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          <button type="submit">Adicionar Renda</button>
        </form>
      </div>
    </div>
  );
}

export default Rendas;