import React, { useState } from 'react';
import './loginpage.css';
import { Link, useParams, useNavigate } from 'react-router-dom';
import LoginImage from '../../assets/login-img.png';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [serverMessage, setServerMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const Schema = Yup.object().shape({
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your new password'),
  });

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: Schema,
    onSubmit: async (values) => {
      setLoading(true);
      setServerMessage(null);
      setErrorMessage(null);
      try {
        const res = await api.post(`/auth/reset-password/${token}`, {
          password: values.password,
        });
        setServerMessage(res.data.message || 'Password reset successfully!');
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Invalid or expired reset token.');
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
              <h2 className='mb-3'>Reset Password</h2>
              <p className='text-muted mb-4'>Enter your new password below.</p>

              {serverMessage && (
                <div className='alert alert-success mt-2 mb-3' role='alert'>
                  {serverMessage} Redirection to login page...
                </div>
              )}

              {errorMessage && (
                <div className='alert alert-danger mt-2 mb-3' role='alert'>
                  {errorMessage}
                </div>
              )}

              {!isSuccess && (
                <form onSubmit={formik.handleSubmit}>
                  <div>
                    <label>New Password:</label>
                    <input
                      className="form-control"
                      id="password"
                      type="password"
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter new password"
                    />
                    {formik.touched.password && formik.errors.password && (
                      <small className="error text-danger">{formik.errors.password}</small>
                    )}
                  </div>

                  <div className="mt-3">
                    <label>Confirm New Password:</label>
                    <input
                      className="form-control"
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Confirm new password"
                    />
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                      <small className="error text-danger">{formik.errors.confirmPassword}</small>
                    )}
                  </div>

                  <div className="d-flex w-100 mt-4">
                    <button className="login-btn" type="submit" disabled={loading}>
                      {loading ? 'Resetting password...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              )}

              <div className='mt-4'>
                <Link to="/login" className="text-decoration-none fw-bold">Back to Login</Link>
              </div>
            </div>
          </div>
          <div className='col-6 d-center'>
            <img className='login-image img-fluid' src={LoginImage} alt='reset password' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
