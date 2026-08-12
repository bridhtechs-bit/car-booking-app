import React from 'react'
import {Link, useNavigate} from 'react-router-dom';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useDispatch, useSelector} from 'react-redux';
import {loginAdmin} from '../../features/auth/authSlice';
import { useEffect } from 'react';
import './login.css';

const Login = () => {
   const Schema = Yup.object().shape({
       email: Yup.string().email('Invalid email').required('Email is required'),
         password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    });

    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);
    const { admin, loading, error, isAuthenticated } = authState;
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Schema,
        onSubmit: (values) => {
            dispatch(loginAdmin(values));
        }
    });

    useEffect(()=>{
        if (isAuthenticated) navigate('/admin');
    }, [isAuthenticated, navigate]);



  return (
    <div className='login-banner mx-2'>
        <div className='container-fluid'>
            <div className='row'>
                    <div className='col-6 d-center'>
                        <div className='form-container p-4'>
                            <h2 className='mb-4'>Admin Login</h2>
                            <p>Please login to your admin account</p>
                            {error && (
                              <div className='alert text-danger mt-3' role='alert'>
                                {typeof error === 'string' ? error : error.message || JSON.stringify(error)}
                              </div>
                            )}
                            <form onSubmit={formik.handleSubmit}>
                                <div>
                                    <label>Email:</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className='form-control'
                                        placeholder="enter your email"
                                    />
                                    
                                    {formik.touched.email && formik.errors.email && (
                                        <div className="invalid-feedback">{formik.errors.email}</div>
                                    )}
                                </div>
                                <div className="mt-3">
                                    <label>Password:</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className='form-control'
                                        placeholder='enter your password'
                                    />
                                    {formik.touched.password && formik.errors.password && (
                                        <div className="invalid-feedback">{formik.errors.password}</div>
                                    )}
                                </div>
                                <div className="mt-2 text-end">
                                    <Link to="/forgot-password" className="text-decoration-none small text-muted">
                                        Forgot password?
                                    </Link>
                                </div>
                                <button 
                                    type="submit" 
                                    className="login-btn mt-3"
                                    disabled={loading}
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>
                        </div>
                    </div>
            </div>
        </div>
    </div>
  )
}

export default Login