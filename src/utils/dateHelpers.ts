// src/utils/dateHelpers.ts

/**
 * Formata um objeto Date para uma string 'YYYY-MM-DD'.
 * @param date O objeto Date a ser formatado.
 * @returns A data formatada como string.
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mês é 0-indexado
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Retorna as strings de início e fim (exclusivo) de um determinado mês para consultas de intervalo.
   * @param year O ano.
   * @param month O mês (1-12).
   * @returns Um objeto contendo startOfMonthString e startOfNextMonthString.
   */
  export const getMonthDateRangeStrings = (year: number, month: number) => {
    const startDate = new Date(year, month - 1, 1); // Mês é 0-indexado para o construtor Date
    const endDate = new Date(year, month, 1); // Início do próximo mês
  
    const startOfMonthString = formatDateToYYYYMMDD(startDate);
    const startOfNextMonthString = formatDateToYYYYMMDD(endDate);
  
    return { startOfMonthString, startOfNextMonthString };
  };
  
  /**
   * Gera uma lista de anos para o filtro.
   * @param count O número de anos a gerar, retrocedendo a partir do ano atual.
   * @returns Um array de números de ano.
   */
  export const generateYears = (count: number = 5): number[] => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: count }, (_, i) => currentYear - i);
  };
  
  /**
   * Lista de meses para o filtro.
   */
  export const months = [
    { value: 'all', label: 'Todos os Meses' },
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];
  