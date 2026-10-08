"use client";

import { useState, useEffect } from 'react';
import CalculatorView from '../../views/CalculatorView';
import SignupModal from '../../views/SignupModal';
import Scope3View from '../../views/Scope3View';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialStep, setModalInitialStep] = useState<'details' | 'login'>('details');
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const openModal = (step: 'details' | 'login' = 'details') => {
    setModalInitialStep(step);
    setIsModalOpen(true);
  };

  const handleAuthSuccess = (userData: any, token: string) => {
    setIsModalOpen(false);
    // Authenticate in the main app context
    login(userData, token, token);
    
    // Redirect to the data manager dashboard
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      {user ? (
        <Scope3View user={user} onLogout={handleLogout} />
      ) : (
        <CalculatorView 
          onUnlockScope3={() => openModal('details')} 
          onLogin={() => openModal('login')} 
        />
      )}

      <SignupModal 
        isOpen={isModalOpen} 
        initialStep={modalInitialStep}
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleAuthSuccess} 
      />
    </main>
  );
}
