import React from 'react';
import { generateYears, months } from '../utils/dateHelpers'; // Importa do utilitário

interface FiltroProps {
  selectedYear: number;
  selectedMonth: string;
  onYearChange: (year: number) => void;
  onMonthChange: (month: string) => void;
}

function Filtro({ selectedYear, selectedMonth, onYearChange, onMonthChange }: FiltroProps) {
  const years = generateYears(5); // Gerar os últimos 5 anos

  return (
    <div>
      <h2>Filtrar Transações</h2>
      <div className="filter-options">
        <div>
          <label htmlFor="filter-year">Ano:</label>
          <select
            id="filter-year"
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-month">Mês:</label>
          <select
            id="filter-month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default Filtro;
