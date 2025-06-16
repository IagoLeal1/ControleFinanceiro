import { generateYears, months } from '../utils/dateHelpers';
import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig'; // Importa a instância do Firestore
import { collection, query, getDocs } from 'firebase/firestore'; // Importa funções para buscar dados

// Definição das categorias base (apenas 'Todas as Categorias')
const baseCategories = [{ value: 'all', label: 'Todas as Categorias' }];

interface FiltroProps {
  user: any; // Nova prop para receber o objeto user (para user.uid)
  selectedYear: number;
  selectedMonth: string;
  selectedCategory: string;
  onYearChange: (year: number) => void;
  onMonthChange: (month: string) => void;
  onCategoryChange: (category: string) => void;
}

function Filtro({ user, selectedYear, selectedMonth, selectedCategory, onYearChange, onMonthChange, onCategoryChange }: FiltroProps) {
  const years = generateYears(5);
  // Estado para armazenar as categorias disponíveis, inicializado com 'Todas as Categorias'
  const [availableCategories, setAvailableCategories] = useState(baseCategories);

  // Log para ver o user prop no momento da renderização do componente
  console.log("Filtro.tsx (Render): User prop no momento da renderização:", user);

  // Efeito para buscar as categorias do Firestore
  useEffect(() => {
    console.log("Filtro.tsx (useEffect): useEffect para buscar categorias iniciado.");
    console.log("Filtro.tsx (useEffect): Usuário (user) dentro do useEffect:", user);

    // Se não houver usuário logado OU se o objeto user não tiver um UID (ainda não autenticado completamente), reseta e sai.
    // O user.uid é crucial para o caminho do Firestore.
    if (!user || !user.uid) {
      setAvailableCategories(baseCategories);
      console.log("Filtro.tsx (useEffect): Nenhum usuário logado ou UID ausente, resetando categorias.");
      return;
    }

    const fetchCategories = async () => {
      console.log(`Filtro.tsx (fetchCategories): Tentando buscar categorias para o UID: ${user.uid}`);
      try {
        const expensesCollectionRef = collection(db, `users/${user.uid}/expenses`);
        const querySnapshot = await getDocs(query(expensesCollectionRef));
        
        const fetchedCategories: string[] = [];
        querySnapshot.forEach((doc) => {
          const category = doc.data().category;
          console.log(`Filtro.tsx (fetchCategories): Categoria encontrada no documento ${doc.id}:`, category); 
          if (category && typeof category === 'string' && !fetchedCategories.includes(category)) {
            fetchedCategories.push(category);
          }
        });

        fetchedCategories.sort((a, b) => a.localeCompare(b));

        const formattedCategories = [
          ...baseCategories,
          ...fetchedCategories.map(cat => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) }))
        ];
        setAvailableCategories(formattedCategories);
        console.log("Filtro.tsx (fetchCategories): Categorias formatadas para o filtro:", formattedCategories);

      } catch (error) {
        console.error("Filtro.tsx (fetchCategories): Erro ao buscar categorias:", error);
        setAvailableCategories(baseCategories); 
      }
    };

    fetchCategories();
  }, [user]); // Este efeito é executado sempre que o objeto 'user' muda (login/logout)

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
        {/* Novo filtro de categoria - agora usa categorias dinâmicas */}
        <div>
          <label htmlFor="filter-category">Categoria (Despesas):</label>
          <select
            id="filter-category"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {availableCategories.map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default Filtro;
