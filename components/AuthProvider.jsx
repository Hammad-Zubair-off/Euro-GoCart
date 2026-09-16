'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  const refreshMe = useCallback(async () => {
    try {
      const data = await api('/auth/me', { auth: true });
      setUser(data.user);
      setStore(data.store);
      setIsAdmin(Boolean(data.isAdmin));
      return data;
    } catch {
      setUser(null);
      setStore(null);
      setIsAdmin(false);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) {
        refreshMe().finally(() => mounted && setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        refreshMe();
      } else {
        setUser(null);
        setStore(null);
        setIsAdmin(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [refreshMe]);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await refreshMe();
    setShowLogin(false);
  };

  const signUp = async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name || email.split('@')[0] } },
    });
    if (error) throw error;
    await refreshMe();
    setShowLogin(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStore(null);
    setIsAdmin(false);
  };

  const requireAuth = () => {
    if (!session) {
      setShowLogin(true);
      return false;
    }
    return true;
  };

  const value = useMemo(
    () => ({
      session,
      user,
      store,
      isAdmin,
      loading,
      showLogin,
      setShowLogin,
      signIn,
      signUp,
      signOut,
      refreshMe,
      requireAuth,
      isLoggedIn: Boolean(session),
    }),
    [session, user, store, isAdmin, loading, showLogin, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
