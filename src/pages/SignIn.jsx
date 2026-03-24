import React from 'react';
import { Link } from 'react-router-dom';
import './SignIn.css';

const SignIn = () => {
  return (
    <div className="signin">
      <main className="signin__wrapper">
        {/* Brand */}
        <div className="signin__brand">
          <h1 className="gradient-text">Elevate</h1>
          <p>The Curated Professional Network</p>
        </div>

        {/* Sign In Card */}
        <div className="signin__card">
          <div className="signin__card-accent"></div>
          <div className="signin__card-body">
            <div className="signin__welcome">
              <h2>Welcome back</h2>
              <p>Please enter your details to sign in.</p>
            </div>

            {/* Form */}
            <form className="signin__form" onSubmit={(e) => e.preventDefault()}>
              <div className="signin__field">
                <label className="signin__label" htmlFor="email">Email Address</label>
                <input
                  className="signin__input"
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                />
              </div>

              <div className="signin__field">
                <div className="signin__field-header">
                  <label className="signin__label" htmlFor="password">Password</label>
                  <a href="#" className="signin__forgot">Forgot Password?</a>
                </div>
                <input
                  className="signin__input"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <Link to="/home">
                <button type="button" className="btn-gradient signin__submit">
                  Sign In to Account
                </button>
              </Link>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="signin__footer">
          Don't have an account?
          <Link to="/role-selection">Sign Up</Link>
        </p>
      </main>

      {/* Decorative orbs */}
      <div className="signin__orb signin__orb--1"></div>
      <div className="signin__orb signin__orb--2"></div>
    </div>
  );
};

export default SignIn;
