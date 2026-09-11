import React, {lazy, Suspense} from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import Roote from "./routes/roote";
import {AuthProvider} from "./context/authContext.js";
const Home = lazy(()=>import("./pages/Home"));
const LoginPage = lazy(()=>import("./components/login/LoginPage"));
const RegisterPage = lazy(()=>import("./components/register/RegisterPage"));
const ForgotPasswordPage = lazy(()=>import("./components/login/ForgotPasswordPage"));
const ResetPasswordPage = lazy(()=>import("./components/login/ResetPasswordPage"));
const VerifyEmailPage = lazy(()=>import("./components/login/VerifyEmailPage"));
const CarListing = lazy(()=>import("./pages/CarListing"));
const MyBookings = lazy(()=>import("./pages/MyBookings"));
const CarDetail = lazy(()=>import("./pages/CarDetails"));


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        {/* suspense capture le chargement des composants */}
        <Suspense>
          <Roote />
        </Suspense>
      </AuthProvider>
    ),
    children: [
      {
        path: "/",
        element: <Home/>
      },
      {
        path: "/home",
        element: <Home/>
      },
      {
        path: "/cars",
        element: <CarListing/>
      },
      {
        path: "/car/:id",
        element: <CarDetail/>
      },
      {
        path: "/my-bookings",
        element: <MyBookings/>
      },
      {
        path: "/login",
        element: <LoginPage/>
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage/>
      },
      {
        path: "/reset-password/:token",
        element: <ResetPasswordPage/>
      },
      {
        path: "/verify-email/:token",
        element: <VerifyEmailPage/>
      },
      {
        path: "/register",
        element: <RegisterPage/>
      },
      {
        path: "/about",
        element: <div>About Page</div>
      }
    ]
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}
export default App;