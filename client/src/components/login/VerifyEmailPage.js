import React, { useEffect, useState } from 'react';
import './loginpage.css';
import { Link, useParams } from 'react-router-dom';
import LoginImage from '../../assets/login-img.png';
import api from '../../services/api';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setSuccess(true);
        setMessage(res.data.message || 'Your email has been verified successfully!');
      } catch (err) {
        setSuccess(false);
        setMessage(err.response?.data?.message || 'Invalid or expired verification token.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  return (
    <div className='login-banner mx-2'>
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-6 d-center'>
            <div className='form-container p-4 text-center'>
              <h2 className='mb-3'>Email Verification</h2>

              {loading ? (
                <div className="my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Verifying...</span>
                  </div>
                  <p className="mt-3">Verifying your email address, please wait...</p>
                </div>
              ) : success ? (
                <div className="my-4">
                  <div className="alert alert-success" role="alert">
                    <h4>✓ Email Verified!</h4>
                    <p>{message}</p>
                  </div>
                  <Link to="/login" className="login-btn btn text-white text-decoration-none mt-3">
                    Proceed to Login
                  </Link>
                </div>
              ) : (
                <div className="my-4">
                  <div className="alert alert-danger" role="alert">
                    <h4>✗ Verification Failed</h4>
                    <p>{message}</p>
                  </div>
                  <Link to="/login" className="login-btn btn text-white text-decoration-none mt-3">
                    Back to Login
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className='col-6 d-center'>
            <img className='login-image img-fluid' src={LoginImage} alt='verify email' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
