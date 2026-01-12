import { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ao iniciar, verifica se já existe um login salvo
    const recoveredUser = localStorage.getItem('@GestaoEPI:user');
    const token = localStorage.getItem('@GestaoEPI:token');

    if (recoveredUser && token) {
      setUser(JSON.parse(recoveredUser));
      // Configura o token nas requisições do axios para futuras chamadas
      api.defaults.headers.Authorization = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);

  async function signIn(email, password) {
    try {
      // Chamada real ao backend
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      const { user: userData, token } = response.data;

      localStorage.setItem('@GestaoEPI:user', JSON.stringify(userData));
      localStorage.setItem('@GestaoEPI:token', token);

      // Injeta o token em todas as chamadas futuras do axios
      api.defaults.headers.Authorization = `Bearer ${token}`;

      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Falha na autenticação. Verifique seus dados.';
      throw new Error(message);
    }
  }

  function signOut() {
    localStorage.removeItem('@GestaoEPI:user');
    localStorage.removeItem('@GestaoEPI:token');
    
    // Remove o token do axios
    api.defaults.headers.Authorization = undefined;
    
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para facilitar a importação
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
