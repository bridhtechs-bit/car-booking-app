import React, { useEffect } from 'react'
import './registerpage.css'
import { Link, useNavigate } from 'react-router-dom'
import RegisterImage from '../../assets/login-img.png' // tu peux changer l’image
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { registerUser } from '../../features/auth/authSlice'
import { useDispatch, useSelector } from 'react-redux'

const RegisterPage = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { isAuthenticated, loading } = useSelector((state) => state.auth)

  /* =======================
     VALIDATION SCHEMA
  ======================= */
  const Schema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm your password')
  })

  /* =======================
     FORMIK
  ======================= */
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Schema,
    onSubmit: (values) => {
      const { confirmPassword, ...userData } = values
      dispatch(registerUser(userData))
    }
  })

  /* =======================
     REDIRECTION
  ======================= */
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="login-banner mx-2">
      <div className="container-fluid">
        <div className="row">

          {/* FORM */}
          <div className="col-6 d-center">
            <div className="form-container p-4">
              <h2 className="mb-3">Create Account</h2>
              <p>Join us and start booking your car</p>

              <form onSubmit={formik.handleSubmit}>

                {/* NAME */}
                <div className="mb-3">
                  <label>Name</label>
                  <input
                    className="form-control"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your name"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <small className="error">{formik.errors.name}</small>
                  )}
                </div>

                {/* EMAIL */}
                <div className="mb-3">
                  <label>Email</label>
                  <input
                    className="form-control"
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your email"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <small className="error">{formik.errors.email}</small>
                  )}
                </div>

                {/* PASSWORD */}
                <div className="mb-3">
                  <label>Password</label>
                  <input
                    className="form-control"
                    type="password"
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your password"
                  />
                  {formik.touched.password && formik.errors.password && (
                    <small className="error">{formik.errors.password}</small>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="mb-3">
                  <label>Confirm Password</label>
                  <input
                    className="form-control"
                    type="password"
                    name="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Confirm your password"
                  />
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <small className="error">{formik.errors.confirmPassword}</small>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-btn w-100"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Register'}
                </button>
              </form>

              <div className="mt-3 text-center">
                <p>
                  Already have an account ?
                  <Link className="link ms-1" to="/login">Login</Link>
                </p>
              </div>
            </div>
          </div>

          {/* IMAGE */}
          <div className="col-6 d-center">
            <img
              className="login-image img-fluid"
              src={RegisterImage}
              alt="register"
            />
          </div>

        </div>
      </div>
    </div>
  )
}

export default RegisterPage