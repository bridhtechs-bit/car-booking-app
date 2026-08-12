import React, { useEffect } from 'react'
import './loginpage.css'
import { Link , useNavigate} from 'react-router-dom'
import LoginImage from '../../assets/login-img.png'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import { loginUser } from '../../features/auth/authSlice'
import { useDispatch, useSelector } from 'react-redux'

const LoginPage = () => {
    const Schema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
    });

       const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: Schema,
        onSubmit: (values) => {
            dispatch(loginUser(values));
            console.log(values);
        }
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);
    const { user, loading, error, isAuthenticated } = authState;

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home');
        }else {
            navigate('/login');
        }}, [isAuthenticated, navigate]);

  return (
    <div className='login-banner mx-2'>
        <div className='container-fluid'>
            <div className='row'>
                    <div className='col-6 d-center'>
                        <div className='form-container p-4'>
                            <h2 className='mb-4'>Welcome Back</h2>
                            <p>Please login to your account</p>
                            <form onSubmit={formik.handleSubmit}>
                                <div>
                                    <label>Email:</label>
                                    <input 
                                    className="form-control" 
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="enter your email"
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                    <small className="error">{formik.errors.email}</small>
                                    )}
                                </div>

                                <div>
                                    <label>Password:</label>
                                    <input 
                                    className="form-control" 
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="enter your password"
                                    />
                                    {formik.touched.password && formik.errors.password && (
                                    <small className="error">{formik.errors.password}</small>
                                    )}
                                </div>

                                <div className="mt-2 text-end">
                                    <Link to="/forgot-password" className="forgot-link text-decoration-none">
                                        Forgot password?
                                    </Link>
                                </div>

                            <div className="d-flex w-100">
                                <button className="login-btn" type="submit">
                                Login
                                </button>
                            </div>
                            </form>
                            <div>Don't have an account? <Link to="/register">Sign up</Link></div>

                            <div className='login-form-botom'>
                                <p>By logging in, you agree to our <Link to="/terms">Terms and Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>.</p>
                            </div>
                        </div>
                    </div>
                    <div className='col-6 d-center'>
                        <img className='login-image img-fluid' src={LoginImage} alt='login' />
                    </div>
            </div>
        </div>
    </div>
  )
}

export default LoginPage