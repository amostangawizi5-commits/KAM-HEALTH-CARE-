import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../kazimililogo.png';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <main className="min-vh-100 d-flex align-items-center justify-content-center bg-light">

      <section
        className="d-flex flex-column align-items-center justify-content-center text-center p-4 w-100"
        aria-label="KazimiliCare loading screen"
      >

        {/* Title */}
        <p className="text-primary fw-bold fs-2 mb-4">
          KAZIMILICARE
        </p>

        {/* Loader */}
        <div
          className="position-relative d-flex align-items-center justify-content-center"
          style={{ width: '168px', height: '168px' }}
        >
          <div
            className="spinner-border text-success"
            style={{ width: '168px', height: '168px' }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>

          <img
            src={logo}
            alt="KazimiliCare Logo"
            className="position-absolute img-fluid rounded bg-white p-1"
            style={{ width: '82px', height: '82px' }}
          />
        </div>

        {/* Subtitle */}
        <p className="text-primary fw-bold mt-4 mb-0">
          Please wait ... loading
        </p>

        {/* Login Button */}
        <button
          type="button"
          className="btn btn-primary fw-bold mt-4 px-4 py-2"
          onClick={() => navigate('/login')}
        >
          Open Login
        </button>

      </section>

    </main>
  );
};

export default LandingPage;