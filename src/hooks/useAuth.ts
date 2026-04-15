import { useState, useEffect } from 'react';

export interface LocalUser {
  uid: string;
  email: string;
  role: 'admin' | 'manager' | 'worker';
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('gasflow_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (password: string) => {
    if (password === 'test123') {
      const adminUser: LocalUser = {
        uid: 'local-admin',
        email: 'admin@gasflow.com',
        role: 'admin',
        name: 'Administrator'
      };
      localStorage.setItem('gasflow_user', JSON.stringify(adminUser));
      setUser(adminUser);
      return true;
    }
    return false;
  };

  const logout = async () => {
    localStorage.removeItem('gasflow_user');
    setUser(null);
  };

  return { user, profile: user, loading, login, logout };
}
