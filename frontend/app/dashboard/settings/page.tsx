'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, EyeOff, ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useDialog } from '@/lib/useDialog';
import { MaolysBranding } from '@/components/ui/maolys-branding';

interface ApiConfig {
  openaiApiKey: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioWhatsappNumber: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsS3Bucket: string;
  awsRegion: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { alert, DialogComponents } = useDialog();
  
  const [config, setConfig] = useState<ApiConfig>({
    openaiApiKey: '',
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioWhatsappNumber: '',
    awsAccessKeyId: '',
    awsSecretAccessKey: '',
    awsS3Bucket: '',
    awsRegion: 'eu-west-1',
  });

  const [status, setStatus] = useState({
    openai: false,
    twilio: false,
    aws: false,
    allConfigured: false,
  });

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
    loadStatus();
  }, []);

  const loadConfig = async () => {
    try {
      const response: any = await api.getApiConfig();
      setConfig(response.apiConfig || config);
    } catch (error) {
      console.error('Erreur chargement config:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const response: any = await api.getSettingsStatus();
      setStatus(response.status);
    } catch (error) {
      console.error('Erreur chargement status:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateApiConfig(config);
      await loadStatus();
      await alert({
        title: 'Configuration sauvegardée',
        message: 'Vos clés API ont été sauvegardées avec succès. Redémarrez l\'application pour appliquer les changements.',
        type: 'success',
      });
    } catch (error: any) {
      await alert({
        title: 'Erreur',
        message: error.message || 'Erreur lors de la sauvegarde',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getStatusIcon = (isConfigured: boolean) => {
    return isConfigured ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <DialogComponents />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              </Link>
              <MaolysBranding variant="header" />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuration</h1>
            <p className="text-gray-600">Gérez vos clés API et paramètres de service</p>
          </div>

          {/* Status Overview */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">État de la configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                {getStatusIcon(status.openai)}
                <div>
                  <p className="font-medium text-gray-900">OpenAI</p>
                  <p className="text-sm text-gray-600">
                    {status.openai ? 'Configuré' : 'Non configuré'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                {getStatusIcon(status.twilio)}
                <div>
                  <p className="font-medium text-gray-900">Twilio WhatsApp</p>
                  <p className="text-sm text-gray-600">
                    {status.twilio ? 'Configuré' : 'Non configuré'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                {getStatusIcon(status.aws)}
                <div>
                  <p className="font-medium text-gray-900">AWS S3</p>
                  <p className="text-sm text-gray-600">
                    {status.aws ? 'Configuré' : 'Optionnel'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* OpenAI Configuration */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">OpenAI API</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Clé API pour l'agent IA conversationnel et le parsing de CV
                </p>
              </div>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
              >
                Créer une clé <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Clé API OpenAI <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.openaiApiKey ? 'text' : 'password'}
                  value={config.openaiApiKey}
                  onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                  placeholder="sk-proj-..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('openaiApiKey')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.openaiApiKey ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Obtenez votre clé sur{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  platform.openai.com
                </a>
              </p>
            </div>
          </div>

          {/* Twilio Configuration */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Twilio WhatsApp</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Credentials pour l'envoi et la réception de messages WhatsApp
                </p>
              </div>
              <a
                href="https://www.twilio.com/whatsapp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
              >
                Créer un compte <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account SID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.twilioAccountSid ? 'text' : 'password'}
                    value={config.twilioAccountSid}
                    onChange={(e) => setConfig({ ...config, twilioAccountSid: e.target.value })}
                    placeholder="ACxxxxx"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('twilioAccountSid')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.twilioAccountSid ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auth Token <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.twilioAuthToken ? 'text' : 'password'}
                    value={config.twilioAuthToken}
                    onChange={(e) => setConfig({ ...config, twilioAuthToken: e.target.value })}
                    placeholder="votre-auth-token"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('twilioAuthToken')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.twilioAuthToken ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.twilioWhatsappNumber}
                  onChange={(e) => setConfig({ ...config, twilioWhatsappNumber: e.target.value })}
                  placeholder="whatsapp:+14155238886"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format : whatsapp:+1234567890 (avec le préfixe whatsapp:)
                </p>
              </div>
            </div>
          </div>

          {/* AWS S3 Configuration (Optionnel) */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">AWS S3 (Optionnel)</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Stockage des CV en ligne. Si non configuré, les CV seront stockés localement.
                </p>
              </div>
              <a
                href="https://aws.amazon.com/s3/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
              >
                En savoir plus <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Key ID
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.awsAccessKeyId ? 'text' : 'password'}
                      value={config.awsAccessKeyId}
                      onChange={(e) => setConfig({ ...config, awsAccessKeyId: e.target.value })}
                      placeholder="AKIA..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('awsAccessKeyId')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.awsAccessKeyId ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Access Key
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.awsSecretAccessKey ? 'text' : 'password'}
                      value={config.awsSecretAccessKey}
                      onChange={(e) => setConfig({ ...config, awsSecretAccessKey: e.target.value })}
                      placeholder="secret-key"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('awsSecretAccessKey')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.awsSecretAccessKey ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bucket Name
                  </label>
                  <input
                    type="text"
                    value={config.awsS3Bucket}
                    onChange={(e) => setConfig({ ...config, awsS3Bucket: e.target.value })}
                    placeholder="easyrecruit-cvs"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Région
                  </label>
                  <input
                    type="text"
                    value={config.awsRegion}
                    onChange={(e) => setConfig({ ...config, awsRegion: e.target.value })}
                    placeholder="eu-west-1"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Annuler</Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sauvegarde...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </span>
              )}
            </Button>
          </div>
        </main>
      </div>
    </>
  );
}

