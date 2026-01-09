import { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Para checar o token ao carregar a página

  useEffect(() => {
    // Ao iniciar, verifica se já existe um login salvo
    const recoveredUser = localStorage.getItem('@GestaoEPI:user');
    const token = localStorage.getItem('@GestaoEPI:token');

    if (recoveredUser && token) {
      setUser(JSON.parse(recoveredUser));
    }
    
    setLoading(false);
  }, []);

  async function signIn(email, password) {
    // --- MOCK DE API ---
    // Aqui simulamos uma chamada assíncrona ao backend
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Regra Mock: Aceita qualquer email com a senha "123456"
            if (password === '123456') {
                const mockUser = {
                    id: 1,
                    name: 'Administrador',
                    email: email,
                    role: 'admin',
                    avatar: 'https://github.com/shadcn.png' // Avatar placeholder
                };

                localStorage.setItem('@GestaoEPI:user', JSON.stringify(mockUser));
                localStorage.setItem('@GestaoEPI:token', 'mock-jwt-token-xyz');

                setUser(mockUser);
                resolve({ success: true });
            } else {
                reject({ message: 'E-mail ou senha incorretos.' });
            }
        }, 1000); // Delay de 1 segundo para testar loading
    });
  }

  function signOut() {
    localStorage.removeItem('@GestaoEPI:user');
    localStorage.removeItem('@GestaoEPI:token');
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