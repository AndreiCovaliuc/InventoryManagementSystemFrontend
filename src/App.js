import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { setAuthNavigate } from './services/AxiosInterceptor';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import ProductList from './components/products/ProductList';
import CategoryList from './components/categories/CategoryList';
import SupplierList from './components/suppliers/SupplierList';
import InventoryList from './components/inventory/InventoryList';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserList from './components/users/UserList';
import UserProfile from './components/users/UserProfile'; 
import Unauthorized from './components/common/Unauthorized';
import ProtectedRoute from './components/common/ProtectedRoute';
import TransactionList from './components/transactions/TransactionList';
import TransactionDetail from './components/transactions/TransactionDetail';
import TransactionForm from './components/transactions/TransactionForm';
import { AuthProvider } from './context/AuthContext';
import { PresenceProvider } from './context/PresenceContext';
import ChatList from './components/chat/ChatList';
import ChatDetail from './components/chat/ChatDetail';
import CompanyRegister from './components/auth/CompanyRegister';
import AIAssistant from './components/ai/AIAssistant';
import './App.css';

// Bridges react-router's navigate into the axios interceptor so auth redirects
// happen client-side instead of via window.location (which reloads the SPA).
function AuthNavigateBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    setAuthNavigate(navigate);
  }, [navigate]);
  return null;
}

function App() {
  return (
    <Router>
      <AuthNavigateBridge />
      <AuthProvider>
        <PresenceProvider>
          <div className="App">
            <Routes>

            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register-company" element={<CompanyRegister />} />
            {/* Chat routes */}
<Route
  path="/chat"
  element={
    <ProtectedRoute
      element={
        <>
          <Navbar />
          <Container style={{ marginTop: '20px' }}>
            <ChatList />
          </Container>
        </>
      }
    />
  }
/>

<Route
  path="/chat/:chatId"
  element={
    <ProtectedRoute
      element={
        <>
          <Navbar />
          <Container style={{ marginTop: '20px' }}>
            <ChatDetail />
          </Container>
        </>
      }
    />
  }
/>
            {/* Protected routes with layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <Dashboard />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            {/* Transaction routes */}
            <Route
              path="/transactions"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <TransactionList />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            <Route
              path="/transactions/new"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <TransactionForm />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            <Route
              path="/transactions/:id"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <TransactionDetail />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            <Route
              path="/transactions/:id/edit"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <TransactionForm />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <Dashboard />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            <Route
              path="/products"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <ProductList />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            <Route
              path="/categories"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <CategoryList />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <SupplierList />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            <Route
              path="/inventory"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <InventoryList />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            {/* User Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <UserProfile />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            {/* Admin-only routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute
                  requiredRole="ADMIN"
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <UserList />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            <Route
              path="/register"
              element={
                <ProtectedRoute
                  requiredRole="ADMIN"
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <Register />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            {/* Unauthorized and catch-all routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

            {/* AI Assistant - Floating button and side panel */}
            <AIAssistant />
          </div>
        </PresenceProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;