import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const activeLinkStyle = {
    color: 'white',
    fontWeight: 'bold',
  };

  return (
   <nav className="bg-app-primary-700 p-4 sticky top-0 z-50">

      <div className="container mx-auto flex justify-between items-center max-w-7xl">
        <NavLink to="/" className="text-white text-xl font-bold">Business Tracker</NavLink>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-4">
          {user ? (
            <>
              
              <li><NavLink to="/customers" className="text-gray-300 hover:text-white" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Customers</NavLink></li>
              <li><NavLink to="/sales" className="text-gray-300 hover:text-white" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Sales</NavLink></li>
 <li><NavLink to="/returns" className="text-gray-300 hover:text-white" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Returns</NavLink></li>
              <li><NavLink to="/products" className="text-gray-300 hover:text-white" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Products</NavLink></li>
              <li><NavLink to="/purchases" className="text-gray-300 hover:text-white" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Purchases</NavLink></li>
              
              
              <li><NavLink to="/suppliers" className="text-gray-300 hover:text-white" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Suppliers</NavLink></li>
              <li><NavLink to="/users" className="text-gray-300 hover:text-white" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Users</NavLink></li>
             
              <li><NavLink to="/activity-logs" className="text-gray-300 hover:text-white" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Activity Logs</NavLink></li>
              <li>
                <button onClick={handleLogout} className="text-gray-300 hover:text-white">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li><NavLink to="/login" className="text-gray-300 hover:text-white" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Login</NavLink></li>
          )}
        </ul>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          {user && (
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-app-primary-800">
          <ul className="flex flex-col space-y-2 p-4">
            
            <li>
              <NavLink 
                to="/customers" 
                className="block text-gray-300 hover:text-white py-2"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                onClick={toggleMenu}
              >
                Customers
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/products" 
                className="block text-gray-300 hover:text-white py-2"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                onClick={toggleMenu}
              >
                Products
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/purchases" 
                className="block text-gray-300 hover:text-white py-2"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                onClick={toggleMenu}
              >
                Purchases
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/returns" 
                className="block text-gray-300 hover:text-white py-2"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                onClick={toggleMenu}
              >
                Returns
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/sales" 
                className="block text-gray-300 hover:text-white py-2"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                onClick={toggleMenu}
              >
                Sales
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/suppliers" 
                className="block text-gray-300 hover:text-white py-2"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                onClick={toggleMenu}
              >
                Suppliers
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/users" 
                className="block text-gray-300 hover:text-white py-2"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                onClick={toggleMenu}
              >
                Users
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/activity-logs" 
                className="block text-gray-300 hover:text-white py-2"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                onClick={toggleMenu}
              >
                Activity Logs
              </NavLink>
            </li>
            <li>
              <button 
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }} 
                className="block text-gray-300 hover:text-white py-2 w-full text-left"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
