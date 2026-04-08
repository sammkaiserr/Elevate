import React from 'react';
import { SignIn as ClerkSignIn, useAuth } from '@clerk/react';
import { Navigate } from 'react-router-dom';
import './SignIn.css';

const SignIn = () => {
  const { isSignedIn, isLoaded } = useAuth();

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
          />
        </div>
      </main>

      
      <div className="signin__orb signin__orb--1"></div>
      <div className="signin__orb signin__orb--2"></div>
    </div>
  );
};

export default SignIn;
