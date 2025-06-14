// src/components/Auth.tsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Importamos a instância de auth

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Para alternar entre login e registro
  const [error, setError] = useState(''); // Para exibir mensagens de erro

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpa erros anteriores

    try {
      if (isRegistering) {
        // Lógica de Registro
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Usuário registrado com sucesso! Faça login.');
        setIsRegistering(false); // Volta para a tela de login
      } else {
        // Lógica de Login
        await signInWithEmailAndPassword(auth, email, password);
        alert('Login bem-sucedido!');
        // Redirecionar para a dashboard principal ou recarregar a página
        // (por enquanto, apenas um alerta)
      }
    } catch (err: any) {
      console.error(err);
      // Mensagens de erro mais amigáveis para o usuário
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Formato de e-mail inválido.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Ocorreu um erro de autenticação. Tente novamente.');
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegistering ? 'Registrar Nova Conta' : 'Fazer Login'}</h2>
      <form onSubmit={handleAuthAction}>
        <div className="form-field">
          <label htmlFor="email">E-mail:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit">{isRegistering ? 'Registrar' : 'Entrar'}</button>
      </form>
      <button
        className="toggle-auth-mode"
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering ? 'Já tenho conta? Fazer Login' : 'Não tem conta? Registrar'}
      </button>
    </div>
  );
}

export default Auth;