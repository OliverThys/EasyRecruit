'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { MaolysBranding } from '@/components/ui/maolys-branding';
import { useDialog } from '@/lib/useDialog';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { alert } = useDialog();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Récupérer le token depuis l'URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get('token');
      if (tokenParam) {
        setToken(tokenParam);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert({
        title: 'Erreur',
        message: 'Les mots de passe ne correspondent pas',
        type: 'error',
      });
      return;
    }

    if (password.length < 8) {
      alert({
        title: 'Erreur',
        message: 'Le mot de passe doit contenir au moins 8 caractères',
        type: 'error',
      });
      return;
    }

    if (!token) {
      alert({
        title: 'Erreur',
        message: 'Token de réinitialisation manquant',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const response: any = await api.resetPassword(token, password);
      setSuccess(true);
      alert({
        title: 'Succès',
        message: response.message || 'Mot de passe réinitialisé avec succès',
        type: 'success',
      });
      
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      alert({
        title: 'Erreur',
        message: err.message || 'Une erreur est survenue',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <MaolysBranding variant="centered" />
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Token manquant</h2>
            <p className="text-gray-600 mb-6">
              Le lien de réinitialisation est invalide ou expiré.
            </p>
            <Link href="/forgot-password">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                Demander un nouveau lien
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <MaolysBranding variant="centered" />
          <p className="text-gray-600 text-sm mt-2">Nouveau mot de passe</p>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            {!success ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Réinitialiser votre mot de passe</h2>
                <p className="text-gray-600 mb-6">
                  Entrez votre nouveau mot de passe ci-dessous.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Minimum 8 caractères"
                        minLength={8}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Confirmez votre mot de passe"
                        minLength={8}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe réinitialisé !</h2>
                <p className="text-gray-600 mb-6">
                  Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

