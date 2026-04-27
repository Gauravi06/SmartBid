import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login        from './pages/Login';
import Register     from './pages/Register';
import AuctionList  from './pages/AuctionList';
import AuctionRoom  from './pages/AuctionRoom';
import CreateAuction from './pages/CreateAuction';
import WinnerPage   from './pages/WinnerPage';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? children : <Navigate to="/" />;
};

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.role === 'admin' ? children : <Navigate to="/auctions" />;
};

function App() 
{
  return (
    <Router>
      <Routes>
        <Route path="/"            element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/auctions"    element={<PrivateRoute><AuctionList /></PrivateRoute>} />
        <Route path="/auction/:id" element={<PrivateRoute><AuctionRoom /></PrivateRoute>} />
        <Route path="/create"      element={<PrivateRoute><CreateAuction /></PrivateRoute>} />
        <Route path="/winner/:id"  element={<PrivateRoute><WinnerPage /></PrivateRoute>} />
        <Route path="/admin"       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </Router>
  );
}

export default App;