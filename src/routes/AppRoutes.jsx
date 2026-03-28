import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth as useClerkAuth } from '@clerk/react';
import SignIn from '../pages/SignIn';
import RoleSelection from '../pages/RoleSelection';
import StudentProfileSetup from '../pages/StudentProfileSetup';
import ProfessionalProfileSetup from '../pages/ProfessionalProfileSetup';
import Home from '../pages/Home';
import CreateBlog from '../pages/CreateBlog';
import Chat from '../pages/Chat';
import Network from '../pages/Network';
import Settings from '../pages/Settings';
import UserProfile from '../pages/UserProfile';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useClerkAuth();
  if (!isLoaded) return null; // Wait for Clerk to initialise
  if (!isSignedIn) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
        <Route path="/profile/student" element={<ProtectedRoute><StudentProfileSetup /></ProtectedRoute>} />
        <Route path="/profile/professional" element={<ProtectedRoute><ProfessionalProfileSetup /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile/user/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;