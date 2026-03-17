import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Product from './pages/Product';
import Customer from './pages/Customer';
import Sale from './pages/Sale';
import Purchase from './pages/Purchase';
import Return from './pages/Return';
import ActivityLog from './pages/ActivityLog';
import User from './pages/User';
import ProductJourney from './components/ProductJourney';
import CustomerJourney from './components/CustomerJourney';
import Supplier from './pages/Supplier';
import LoginPage from './pages/LoginPage';
import AddSale from './pages/AddSale';
import EditSale from './pages/EditSale'; // Import EditSale
import CustomerSales from './pages/CustomerSales';
import CustomareSaleList from './pages/CustomareSaleList';
import ReturnSale from './pages/ReturnSale'; // Import the new component

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Product /></PrivateRoute>} />
        <Route path="/suppliers" element={<PrivateRoute><Supplier /></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><Customer /></PrivateRoute>} />
        <Route path="/sales" element={<PrivateRoute><Sale /></PrivateRoute>} />
        <Route path="/sales/new" element={<PrivateRoute><AddSale /></PrivateRoute>} />
        <Route path="/sales/:id/return" element={<PrivateRoute><ReturnSale /></PrivateRoute>} />
        <Route path="/sales/edit/:id" element={<PrivateRoute><EditSale /></PrivateRoute>} /> {/* New route for EditSale */}
        <Route path="/sales/:id" element={<PrivateRoute><EditSale /></PrivateRoute>} /> {/* Changed to EditSale */} 
        <Route path="/sales/customer/:customerId" element={<PrivateRoute><CustomerSales /></PrivateRoute>} />
        <Route path="/purchases" element={<PrivateRoute><Purchase /></PrivateRoute>} />
        <Route path="/returns" element={<PrivateRoute><Return /></PrivateRoute>} />
        <Route path="/activity-log" element={<PrivateRoute><ActivityLog /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><User /></PrivateRoute>} />
        <Route path="/products/:id" element={<PrivateRoute><ProductJourney /></PrivateRoute>} />
        <Route path="/customers/:id" element={<PrivateRoute><CustomerJourney /></PrivateRoute>} />
        <Route path="/customer-sale-list/:name/:customerId" element={<PrivateRoute><CustomareSaleList /></PrivateRoute>} />
        sales
      </Routes>
    </Router>
  );
}

export default App;