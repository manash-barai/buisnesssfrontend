import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

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
        
        <div className="flex items-center"> {/* New wrapper div */}
          {/* Desktop Navigation - Only Customers and Sales visible directly */}
          <ul className="hidden md:flex space-x-4 items-center">
            {user ? (
              <>
                <li><NavLink to="/customers" className="text-gray-300 hover:text-white" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Customers</NavLink></li>
                <li><NavLink to="/sales" className="text-gray-300 hover:text-white" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Sales</NavLink></li>
              </>
            ) : (
              <li><NavLink to="/login" className="text-gray-300 hover:text-white" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Login</NavLink></li>
            )}
          </ul>

          {/* Hamburger menu button for both desktop and mobile */}
          {user && (
            <div className="flex items-center md:ml-4">
              <button
                onClick={toggleMenu}
                className="text-white focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown menu for desktop and full-width menu for mobile, controlled by isMenuOpen */}
      {isMenuOpen && user && (
        <div className="md:absolute md:right-4 md:mt-2 md:w-48 bg-app-primary-800 rounded-md shadow-lg py-1 z-50">
          <ul className="flex flex-col space-y-2 p-4">
            {/* These items are for mobile only, as they are already visible on desktop */}
            <li className="md:hidden">
              <NavLink 
                to="/customers" 
                className="block text-gray-300 hover:text-white py-2"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                onClick={toggleMenu}
              >
                Customers
              </NavLink>
            </li>
            <li className="md:hidden">
              <NavLink 
                to="/sales" 
                className="block text-gray-300 hover:text-white py-2"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                onClick={toggleMenu}
              >
                Sales
              </NavLink>
            </li>
            <li><NavLink to="/products" className="block px-4 py-2 text-gray-300 hover:bg-app-primary-700 hover:text-white" onClick={toggleMenu}>Products</NavLink></li>
            <li><NavLink to="/purchases" className="block px-4 py-2 text-gray-300 hover:bg-app-primary-700 hover:text-white" onClick={toggleMenu}>Purchases</NavLink></li>
            <li><NavLink to="/suppliers" className="block px-4 py-2 text-gray-300 hover:bg-app-primary-700 hover:text-white" onClick={toggleMenu}>Suppliers</NavLink></li>
            <li><NavLink to="/users" className="block px-4 py-2 text-gray-300 hover:bg-app-primary-700 hover:text-white" onClick={toggleMenu}>Users</NavLink></li>
            <li><NavLink to="/activity-logs" className="block px-4 py-2 text-gray-300 hover:bg-app-primary-700 hover:text-white" onClick={toggleMenu}>Activity Logs</NavLink></li>
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
