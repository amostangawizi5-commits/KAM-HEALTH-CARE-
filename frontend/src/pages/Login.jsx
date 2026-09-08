import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../kazimililogo.png';

const tanzaniaEmblem =
  'https://upload.wikimedia.org/wikipedia/commons/c/c2/Coat_of_arms_of_Tanzania.svg';

const roleRoutes = {
  ADMIN: '/dashboard',
  RECEPTIONIST: '/reception',
  CONSULTANT: '/consultant',
  DOCTOR: '/doctor',
  LABORATORY: '/laboratory',
  PHARMACIST: '/dashboard',
  CASHIER: '/dashboard',
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const canSubmit = useMemo(() => {
    return (
      email.trim().length > 0 &&
      password.trim().length > 0 &&
      !loading
    );
  }, [email, password, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password to continue.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        const role = String(result.user?.role || '')
          .trim()
          .toUpperCase();

        navigate(roleRoutes[role] || '/dashboard', {
          replace: true,
        });
      } else {
        setError(
          result.message ||
            'Unable to sign in. Check your credentials and try again.'
        );
      }
    } catch (err) {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">

      {/* ================= HEADER ================= */}
      <header className="bg-white border-bottom shadow-sm py-3">
        <div className="container">

          <div className="d-flex align-items-center justify-content-center gap-3 gap-md-4">

            {/* TANZANIA EMBLEM */}
            <div
              className="rounded-circle bg-light border shadow-sm d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '80px',
                height: '80px',
              }}
            >
              <img
                src={tanzaniaEmblem}
                alt="Tanzania Coat of Arms"
                style={{
                  width: '68px',
                  height: '68px',
                  objectFit: 'contain',
                }}
              />
            </div>


            {/* MINISTRY TEXT */}
            <div className="text-center">

              <h1
                className="text-primary fw-bold mb-1"
                style={{
                  fontSize: 'clamp(20px, 3vw, 32px)',
                }}
              >
                MINISTRY OF HEALTH
              </h1>

              <p className="text-success fw-bold mb-0">
                KAM MEDICAL SERVICE
              </p>

            </div>


            {/* KAZIMILICARE LOGO */}
            <div
              className="rounded-circle bg-white border shadow-sm d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '80px',
                height: '80px',
              }}
            >
              <img
                src={logo}
                alt="KazimiliCare Logo"
                style={{
                  width: '65px',
                  height: '65px',
                  objectFit: 'contain',
                }}
              />
            </div>

          </div>

        </div>
      </header>


      {/* ================= MAIN ================= */}
      <main className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">

        <div
          className="w-100"
          style={{
            maxWidth: '600px',
          }}
        >

          {/* LOGIN CARD */}
          <div
            className="card shadow border-0"
            style={{
              minHeight: '600px',
              borderRadius: '24px',
              overflow: 'hidden',
            }}
          >

            <div className="card-body p-4 p-md-5 d-flex flex-column">

              {/* CARD HEADER */}
              <div className="d-flex align-items-center gap-3 mb-4">

                <div
                  className="rounded-circle bg-light border d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '65px',
                    height: '65px',
                  }}
                >
                  <img
                    src={logo}
                    alt="KazimiliCare"
                    style={{
                      width: '52px',
                      height: '52px',
                      objectFit: 'contain',
                    }}
                  />
                </div>

                <div>
                  <h2 className="h4 fw-bold mb-1">
                    Staff Login
                  </h2>

                  <p className="text-secondary mb-0">
                    Enter your credentials to continue.
                  </p>
                </div>

              </div>


              {/* ERROR */}
              {error && (
                <div
                  className="alert alert-danger"
                  role="alert"
                >
                  {error}
                </div>
              )}


              {/* FORM */}
              <form onSubmit={handleSubmit}>

                {/* EMAIL */}
                <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Username or Email
                  </label>

                  <input
                    type="email"
                    className="form-control form-control-lg rounded-3"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="staff@kazimilicare.com"
                    autoComplete="email"
                    required
                  />

                </div>


                {/* PASSWORD */}
                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Password
                  </label>

                  <div className="input-group">

                    <input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      className="form-control form-control-lg rounded-start-3"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter password"
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-end-3 px-4"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>

                  </div>

                </div>


                {/* FORGOT PASSWORD */}
                <div className="text-end mb-4">

                  <Link
                    to="/login"
                    className="text-decoration-none"
                  >
                    Forgot password?
                  </Link>

                </div>


                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  className="btn btn-success btn-lg w-100 py-2 fw-bold"
                  disabled={!canSubmit}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

              </form>


              {/* ADMIN SETUP */}
              <div className="border-top mt-auto pt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">

                <span className="text-secondary">
                  No admin account yet?
                </span>

                <Link
                  to="/admin-setup"
                  className="text-success fw-bold text-decoration-none"
                >
                  Set up first admin
                </Link>

              </div>

            </div>

          </div>

        </div>

      </main>


      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-top py-3">

        <div className="container">

          <div className="d-flex justify-content-between flex-wrap gap-2 small text-secondary">

            <span>
              © 2026 KAM Medical Service. All rights reserved.
            </span>

            <span>
              Powered by KazimiliCare Health Management System
            </span>

          </div>

        </div>

      </footer>

    </div>
  );
};

export default Login;