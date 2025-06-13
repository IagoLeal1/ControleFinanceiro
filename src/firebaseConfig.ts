// Importe as funções necessárias do SDK
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // Descomente se for usar Analytics
import { getAuth } from "firebase/auth"; // Para autenticação
import { getFirestore } from "firebase/firestore"; // Para banco de dados Firestore

// Suas credenciais de configuração do Firebase (COPIE E COLE DO PASSO 2)
const firebaseConfig = {
    apiKey: "AIzaSyB_5lfA2TXwQUgDCF3zqqaCwhvBUGHk3Eo",
    authDomain: "controle-financeiro-653dd.firebaseapp.com",
    projectId: "controle-financeiro-653dd",
    storageBucket: "controle-financeiro-653dd.firebasestorage.app",
    messagingSenderId: "588983950706",
    appId: "1:588983950706:web:65f4d77ddcfd8be3e711eb",
    measurementId: "G-PC6EWRE5RQ"
  };

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Inicialize os serviços que você vai usar
const auth = getAuth(app); // Para autenticação
const db = getFirestore(app); // Para o Firestore (banco de dados)
// const analytics = getAnalytics(app); // Descomente se for usar Analytics

// Exporte os serviços para que possam ser usados em outros componentes
export { auth, db };
// export { auth, db, analytics }; // Se você ativou o Analytics