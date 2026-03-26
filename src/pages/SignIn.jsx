import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SignIn.css';

const SignIn = () => {
  // 'sign-in' | 'sign-up' | 'forgot-password' | 'verify-otp'
  const [view, setView] = useState('sign-in');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Status
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, resetPassword, verifyOtp, updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (view === 'sign-up') {
        if (!fullName.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        const { error: signUpError } = await signUp(email, password, fullName);
        if (signUpError) throw signUpError;
        navigate('/role-selection');
      } 
      else if (view === 'sign-in') {
        const result = await Promise.race([
          signIn(email, password),
          new Promise((resolve, reject) => setTimeout(() => reject(new Error("Request timed out after 5 seconds. Please check your internet connection and try again.")), 5000))
        ]);
        
        if (result.error) throw result.error;
        navigate('/home');
      }
      else if (view === 'forgot-password') {
        const { error: resetError } = await resetPassword(email);
        if (resetError) throw resetError;
        setMessage('A reset code has been sent to your email.');
        setView('verify-otp');
      }
      else if (view === 'verify-otp') {
        if (newPassword.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        
        // 1. Verify the OTP code sent to the email
        const { error: otpError } = await verifyOtp(email, otpCode);
        if (otpError) throw otpError;
        
        // 2. The user is now logged in (session established). Update their password.
        const { error: updateError } = await updatePassword(newPassword);
        if (updateError) throw updateError;
        
        // 3. Navigate to home
        navigate('/home');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    }
    setLoading(false);
  };

  const getTitle = () => {
    switch (view) {
      case 'sign-up': return 'Create your account';
      case 'forgot-password': return 'Reset password';
      case 'verify-otp': return 'Enter reset code';
      default: return 'Welcome back';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'sign-up': return 'Enter your details to get started.';
      case 'forgot-password': return 'Enter your email to receive a reset code.';
      case 'verify-otp': return `We sent a code to ${email}.`;
      default: return 'Please enter your details to sign in.';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Please wait...';
    switch (view) {
      case 'sign-up': return 'Create Account';
      case 'forgot-password': return 'Send Reset Code';
      case 'verify-otp': return 'Update Password';
      default: return 'Sign In to Account';
    }
  };

  return (
    <div className="signin">
      <main className="signin__wrapper">
        <div className="signin__brand">
          <h1 className="gradient-text">Elevate</h1>
          <p>The Curated Professional Network</p>
        </div>

        <div className="signin__card">
          <div className="signin__card-accent"></div>
          <div className="signin__card-body">
            <div className="signin__welcome">
              <h2>{getTitle()}</h2>
              <p>{getSubtitle()}</p>
            </div>

            {error && (
              <div className="signin__error">
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>error</span>
                {error}
              </div>
            )}
            
            {message && (
              <div className="signin__message" style={{ background: '#ecfdf5', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', border: '1px solid #a7f3d0' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check_circle</span>
                {message}
              </div>
            )}

            <form className="signin__form" onSubmit={handleSubmit}>
              {/* Sign Up Fields */}
              {view === 'sign-up' && (
                <div className="signin__field">
                  <label className="signin__label" htmlFor="fullName">Full Name</label>
                  <input className="signin__input" id="fullName" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
              )}

              {/* Email Field (Used in sign-in, sign-up, forgot-password) */}
              {(view === 'sign-in' || view === 'sign-up' || view === 'forgot-password') && (
                <div className="signin__field">
                  <label className="signin__label" htmlFor="email">Email Address</label>
                  <input className="signin__input" id="email" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              )}

              {/* Password Field (Used in sign-in, sign-up) */}
              {(view === 'sign-in' || view === 'sign-up') && (
                <div className="signin__field">
                  <div className="signin__field-header">
                    <label className="signin__label" htmlFor="password">Password</label>
                    {view === 'sign-in' && (
                      <button type="button" onClick={() => { setView('forgot-password'); setError(''); setMessage(''); }} className="signin__forgot" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input className="signin__input" id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
              )}

              {/* OTP Code and New Password Fields */}
              {view === 'verify-otp' && (
                <>
                  <div className="signin__field">
                    <label className="signin__label" htmlFor="otpCode">6-Digit Reset Code</label>
                    <input className="signin__input" id="otpCode" type="text" placeholder="123456" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required />
                  </div>
                  <div className="signin__field">
                    <label className="signin__label" htmlFor="newPassword">New Password</label>
                    <input className="signin__input" id="newPassword" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                  </div>
                </>
              )}

              <button type="submit" className="btn-gradient signin__submit" disabled={loading}>
                {getButtonText()}
              </button>
              
              {(view === 'forgot-password' || view === 'verify-otp') && (
                 <button type="button" onClick={() => { setView('sign-in'); setError(''); setMessage(''); }} className="signin__toggle" style={{ width: '100%', marginTop: '1rem' }}>
                   Back to Sign In
                 </button>
              )}
            </form>
          </div>
        </div>

        {(view === 'sign-in' || view === 'sign-up') && (
          <p className="signin__footer">
            {view === 'sign-up' ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => { setView(view === 'sign-in' ? 'sign-up' : 'sign-in'); setError(''); setMessage(''); }} className="signin__toggle">
              {view === 'sign-up' ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        )}
      </main>

      {/* Decorative orbs */}
      <div className="signin__orb signin__orb--1"></div>
      <div className="signin__orb signin__orb--2"></div>
    </div>
  );
};

export default SignIn;
