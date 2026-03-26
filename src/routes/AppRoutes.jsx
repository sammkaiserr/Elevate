import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/profile/student" element={<StudentProfileSetup />} />
        <Route path="/profile/professional" element={<ProfessionalProfileSetup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/network" element={<Network />} />
        <Route path="/create" element={<CreateBlog />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile/user/:userId" element={<UserProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;