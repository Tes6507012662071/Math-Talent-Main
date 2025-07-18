import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventDetail from "./pages/EventDetail";
import Apply from "./pages/Apply";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import About from "./pages/About";
import Testprofile from "./pages/Testprofile";


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/testprofile" element={<Testprofile />} />

        {/* Test Routes */}
        
        {/* Protected Routes */}
        <Route 
          path="/apply/:eventId" 
          element={
            <ProtectedRoute>
              <Apply />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;