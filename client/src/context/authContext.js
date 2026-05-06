import { createContext, useState, useEffect } from 'react';
import { getTokenFromLocalStorage, isTokenExpired } from '../utils/tokenUtil';

// 1. Création du contexte (Le canal du haut-parleur)
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stocke les infos de l'utilisateur
  const [loading, setLoading] = useState(true); // Évite les flashs au chargement

  useEffect(() => {
    // Au démarrage de l'app, on vérifie si un utilisateur est déjà là
    const token = getTokenFromLocalStorage();
    const storedUser = JSON.parse(localStorage.getItem('user'));

    //si il n'est pas là
    if (!token || isTokenExpired(token)) {
      ///on demande une connexion
      setUser(null);
      setLoading(false);
      return;
    }

    if (token && !isTokenExpired(token)) {
      setUser(storedUser);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData); // On annonce la connexion
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null); // On annonce la déconnexion
  };

  return (
    // 2. Diffusion de l'information à tous les composants enfants
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};