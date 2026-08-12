import React, { useState } from 'react';
import './loginpage.css';
import { Link } from 'react-router-dom';
import LoginImage from '../../assets/login-img.png';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';

const ForgotPasswordPage = () => {
  const [serverMessage, setServerMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const Schema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Schema,
    onSubmit: async (values) => {
      setLoading(true);
      setServerMessage(null);
      setErrorMessage(null);
      try {
        const res = await api.post('/auth/forgot-password', { email: values.email });
        setServerMessage(res.data.message || 'If an account exists, a password reset link has been sent.');
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Failed to send reset link. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className='login-banner mx-2'>
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-6 d-center'>
            <div className='form-container p-4'>
              <h2 className='mb-3'>Forgot Password</h2>
              <p className='text-muted mb-4'>Enter your email address and we will send you a link to reset your password.</p>
              
              {serverMessage && (
                <div className='alert alert-success mt-2 mb-3' role='alert'>
                  {serverMessage}
                </div>
              )}

              {errorMessage && (
                <div className='alert alert-danger mt-2 mb-3' role='alert'>
                  {errorMessage}
                </div>
              )}

              <form onSubmit={formik.handleSubmit}>
                <div>
                  <label>Email Address:</label>
                  <input
                    className="form-control"
                    id="email"
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your email"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <small className="error text-danger">{formik.errors.email}</small>
                  )}
                </div>

                <div className="d-flex w-100 mt-3">
                  <button className="login-btn" type="submit" disabled={loading}>
                    {loading ? 'Sending link...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>

              <div className='mt-4'>
                Remember your password? <Link to="/login" className="text-decoration-none fw-bold">Back to Login</Link>
              </div>
            </div>
          </div>
          <div className='col-6 d-center'>
            <img className='login-image img-fluid' src={LoginImage} alt='forgot password' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
