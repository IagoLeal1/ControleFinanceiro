📊 Controle Financeiro Pessoal
Este é um aplicativo web simples para gerenciar despesas e rendas, acompanhar o saldo e filtrar transações por período.

✨ Funcionalidades Principais
Gestão de Finanças: Registre suas despesas e rendas.

Visão Geral Rápida: Veja totais de despesas, rendas e saldo atual (com indicação visual para saldo negativo).

Filtros de Período: Filtre transações por ano e mês.

Organização de Formulários: Formulários de adição de transações expansíveis/retráteis.

Design Responsivo: Funciona bem em diferentes dispositivos.

🚀 Tecnologias
React & TypeScript

Sass (SCSS)

Firebase (Authentication, Firestore)

Flaticon (UIcons)

⚙️ Instalação e Execução
Pré-requisitos
Node.js

npm ou yarn

Passos
Clone o Repositório:

git clone [URL_DO_SEU_REPOSITORIO]
cd [NOME_DA_PASTA_DO_PROJETO]

Instale as Dependências:

npm install

Configuração do Firebase:

Crie um projeto no Console do Firebase.

Habilite Authentication (Email/Password) e configure o Firestore Database.

Obtenha suas credenciais firebaseConfig no Firebase Project Settings.

Crie src/firebaseConfig.ts e cole suas credenciais:

// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = { /* SEU OBJETO FIREBASECONFIG AQUI */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db };

Importante: O Firestore exigirá a criação de índices para as consultas de filtro. O console do navegador indicará os links para criá-los no Firebase Console (expenses e incomes para campos date e createdAt).

Adicione a CDN de Ícones:
No public/index.html, adicione o link Flaticon dentro de <head>:

<!-- public/index.html -->
<head>
  <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.2.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
</head>

Executar o Aplicativo
npm run dev

O aplicativo estará disponível em http://localhost:5173/.

🚀 Como Usar
Faça login ou crie uma conta.

Adicione despesas e rendas usando os formulários.

Use os filtros para visualizar transações de períodos específicos.

📄 Licença
MIT License.