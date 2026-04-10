import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Screening from './pages/Screening';
import ScreeningResult from './pages/Screening/ScreeningResult';
import PatientList from './pages/PatientList';
import Login from './pages/Login';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const showNav = user && location.pathname !== '/login';

  return (
    <>
      {showNav && <Header />}
      <main className="animate-fade-in" style={!showNav ? { padding: 0 } : {}}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/screening" element={
            <ProtectedRoute allowedRoles={['worker']}>
              <Screening />
            </ProtectedRoute>
          } />
          <Route path="/screening/result" element={
            <ProtectedRoute allowedRoles={['worker']}>
              <ScreeningResult />
            </ProtectedRoute>
          } />
          <Route path="/patients" element={
            <ProtectedRoute>
              <PatientList />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {showNav && <Navigation />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
