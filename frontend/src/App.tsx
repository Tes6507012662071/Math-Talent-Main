import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventDetail from "./pages/EventDetail";
import Apply from "./pages/Apply";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";



// import Apply from "./pages/Apply";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/apply/:eventId" element={<Apply />} />
        <Route path="/profile"element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;
