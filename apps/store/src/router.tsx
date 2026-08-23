import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute.js'
import { AppLayout } from './layouts/AppLayout.js'
import { DashboardPage } from './pages/DashboardPage.js'
import { LoginPage } from './pages/LoginPage.js'
import { RatesPage } from './pages/RatesPage.js'
import { SignupPage } from './pages/SignupPage.js'
import { StockPage } from './pages/StockPage.js'
import { BillsListPage } from './pages/bills/BillsListPage.js'
import { BillingWorkspacePage } from './pages/bills/BillingWorkspacePage.js'
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
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/rates', element: <RatesPage /> },
      { path: '/stock', element: <StockPage /> },
      { path: '/bills', element: <BillsListPage /> },
      { path: '/bills/new', element: <BillingWorkspacePage /> },
    ],
  },
])
