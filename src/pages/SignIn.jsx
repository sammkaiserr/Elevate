import React, { useLayoutEffect } from 'react';
import { SignIn as ClerkSignIn, useAuth } from '@clerk/react';
import { Navigate } from 'react-router-dom';
import './SignIn.css';

const SignIn = () => {
  const { isSignedIn, isLoaded } = useAuth();

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const wasDark = html.classList.contains('dark');

    html.classList.remove('dark');
    html.style.background = '#ffffff';
    if (body) {
      body.style.backgroundColor = '#ffffff';
      body.style.backgroundImage = 'none';
    }

    return () => {
      html.style.background = '';
      if (body) {
        body.style.backgroundColor = '';
        body.style.backgroundImage = '';
      }
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
          <h1 className="signin__brand-title">Elevate</h1>
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
                colorTextSecondary: '#43474e',
                borderRadius: '0.75rem',
              },
              elements: {
                rootBox: { width: '100%' },
                card: {
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 24px rgba(0,32,69,0.10)',
                  borderRadius: '1rem',
                },
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
