import React, { useEffect } from 'react';
import { SignIn as ClerkSignIn, useAuth } from '@clerk/react';
import { Navigate } from 'react-router-dom';
import './SignIn.css';

const SignIn = () => {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains('dark');
    html.classList.remove('dark');
    return () => {
      if (wasDark) html.classList.add('dark');
    };
  }, []);

  if (isLoaded && isSignedIn) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="signin">
      <main className="signin__wrapper">
        <div className="signin__brand">
          <h1 className="gradient-text">Elevate</h1>
          <p>The Curated Professional Network</p>
        </div>

        <div className="signin__clerk-container">
          <ClerkSignIn
            routing="hash"
            fallbackRedirectUrl="/home"
            signUpFallbackRedirectUrl="/role-selection"
            appearance={{
              variables: {
                colorBackground: '#ffffff',
                colorText: '#181c1e',
                colorPrimary: '#002045',
                colorInputBackground: '#f1f4f6',
                colorInputText: '#181c1e',
                borderRadius: '0.75rem',
              },
              elements: {
                rootBox: { width: '100%' },
              }
            }}
          />
        </div>
      </main>

      <div className="signin__orb signin__orb--1"></div>
      <div className="signin__orb signin__orb--2"></div>
    </div>
  );
};

export default SignIn;
