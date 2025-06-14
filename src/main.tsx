import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.scss'; // Importa o CSS global

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    // <React.StrictMode> // Pode manter ou remover conforme preferir para desenvolvimento
      <App />
    // </React.StrictMode>
  );
} else {
  console.error('Elemento com ID "root" não encontrado no HTML.');
}
