import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';
import './login.css';

const ForgotPassword = () => {
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
        setServerMessage(res.data.message || 'If an account exists, a reset link has been sent to your email.');
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
              <h2 className='mb-3'>Admin Forgot Password</h2>
              <p className='text-muted mb-4'>Enter your admin email to receive a password reset link.</p>

              {serverMessage && (
                <div className='alert alert-success mt-3' role='alert'>
                  {serverMessage}
                </div>
              )}

              {errorMessage && (
                <div className='alert alert-danger mt-3' role='alert'>
                  {errorMessage}
                </div>
              )}

              <form onSubmit={formik.handleSubmit}>
                <div>
                  <label>Admin Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className='form-control'
                    placeholder="enter your admin email"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="invalid-feedback d-block">{formik.errors.email}</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-btn mt-4"
                  disabled={loading}
                >
                  {loading ? 'Sending Link...' : 'Send Reset Link'}
                </button>
              </form>

              <div className='mt-4'>
                <Link to="/login" className="text-decoration-none fw-bold text-dark">
                  ← Back to Admin Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
