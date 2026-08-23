import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute.js'
import { DashboardPage } from './pages/DashboardPage.js'
import { LoginPage } from './pages/LoginPage.js'
import { RatesPage } from './pages/RatesPage.js'
import { SignupPage } from './pages/SignupPage.js'
import { StockPage } from './pages/StockPage.js'
import { OnboardingWizard } from './pages/onboarding/OnboardingWizard.js'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <OnboardingWizard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/rates',
    element: (
      <ProtectedRoute>
        <RatesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/stock',
    element: (
      <ProtectedRoute>
        <StockPage />
      </ProtectedRoute>
    ),
  },
])
