import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loginAsAdmin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // First try to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@ganaderos.com',
        password: 'admin123456',
      });
      
      // If sign in fails, try to create the user first
      if (signInError) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'admin@ganaderos.com',
          password: 'admin123456',
        });
        
        if (signUpError) throw signUpError;
        
        // Now try to sign in again
        const { error: secondSignInError } = await supabase.auth.signInWithPassword({
          email: 'admin@ganaderos.com',
          password: 'admin123456',
        });
        
        if (secondSignInError) throw secondSignInError;
      }
      
      onAuthSuccess();
      onClose();
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Error al iniciar sesión como administrador');
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Cuenta creada exitosamente. Ya puedes iniciar sesión.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onAuthSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error instanceof Error ? error.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Procesando...' : (isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={loginAsAdmin}
            disabled={loading}
            className="w-full mb-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Iniciar como Administrador'}
          </button>
          
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Credenciales de Administrador:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Email:</strong> admin@ganaderos.com</div>
            <div><strong>Contraseña:</strong> admin123456</div>
          </div>
        </div>
      </div>
    </div>
  );
}