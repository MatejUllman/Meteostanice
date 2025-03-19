import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SensorsList from "./components/SensorList";
import SensorDetail from "./components/SensorDetail";
import MapComponent from "./components/MapComponent";
import AdminPanel from "./components/AdminPanel";
import About from "./components/About";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white shadow-md sticky top-0 w-full z-[1000] h-16 flex items-center">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo / Brand */}
        <Link to="/" className="text-lg font-bold hover:text-gray-200 flex">
          <img src="/sun-wind.svg" alt="icon" className="px-2 invert" />
          Mstanice
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-gray-300">
            Seznam senzorů
          </Link>
          <Link to="/mapa" className="hover:text-gray-300">
            Mapa
          </Link>
          <Link to="/admin" className="hover:text-gray-300">
            Administrace
          </Link>
          <Link to="/o-projektu" className="hover:text-gray-300">
            O projektu
          </Link>
        </div>

        {/* Hamburger Button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-700 mt-28">
          <Link
            to="/"
            className="block px-4 py-2 text-white hover:bg-blue-500"
            onClick={() => setIsOpen(false)}
          >
            Seznam senzorů
          </Link>
          <Link
            to="/mapa"
            className="block px-4 py-2 text-white hover:bg-blue-500"
            onClick={() => setIsOpen(false)}
          >
            Mapa
          </Link>
          <Link
            to="/admin"
            className="block px-4 py-2 text-white hover:bg-blue-500"
            onClick={() => setIsOpen(false)}
          >
            Administrace
          </Link>
          <Link
            to="/o-projektu"
            className="block px-4 py-2 text-white hover:bg-blue-500"
            onClick={() => setIsOpen(false)}
          >
            O projektu
          </Link>
        </div>
      )}
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<SensorsList />} />
        <Route path="/sensor/:id" element={<SensorDetail />} />
        <Route path="/mapa" element={<MapComponent />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/o-projektu" element={<About />} />
      </Routes>
    </Router>
  );
};

export default App;
