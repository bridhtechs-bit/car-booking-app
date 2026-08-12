import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import Roote from "./routes/roote";
import Home from "./pages/Home";
import LoginPage from "./components/login/LoginPage";
import RegisterPage from "./components/register/RegisterPage";
import ForgotPasswordPage from "./components/login/ForgotPasswordPage";
import ResetPasswordPage from "./components/login/ResetPasswordPage";
import VerifyEmailPage from "./components/login/VerifyEmailPage";
import CarListing from "./pages/CarListing";
import CarDetails from "./pages/CarDetails";
import MyBookings from "./pages/MyBookings";
import CarDetail from "./pages/carDetail";
import { AuthProvider } from "./context/authContext";


const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthProvider><Roote /></AuthProvider>,
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