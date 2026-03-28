import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/react';
import { apiFetch } from '../config/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const data = await apiFetch(`/profiles/${userId}`);
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Fetch profile error:', err);
      return null;
    }
  };

  // Auto-sync: create profile row in backend if it doesn't exist yet
  const syncProfile = async (clerkUser) => {
    const userId = clerkUser.id;
    try {
      const fullName =
        clerkUser.fullName ||
        `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
        clerkUser.emailAddresses?.[0]?.emailAddress || '';
        
      const data = await apiFetch(`/profiles`, {
        method: 'POST',
        body: JSON.stringify({
          id: userId,
          full_name: fullName,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || ''
        })
      });
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Sync profile error:', err);
      return null;
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (clerkUser) {
      syncProfile(clerkUser).finally(() => setLoading(false));
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [isLoaded, clerkUser?.id]);

  const updateAvatar = async (url) => {
    if (!clerkUser) return { error: 'Not logged in' };
    try {
      const data = await apiFetch(`/profiles/${clerkUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ avatar_url: url })
      });
      setProfile(data);
      return { data };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user: clerkUser
      ? {
          id: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
        }
      : null,
    profile,
    loading,
    fetchProfile,
    updateAvatar,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};