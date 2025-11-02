'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X, Download, Mail, FileText, Star, MessageSquare, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useDialog } from '@/lib/useDialog';
import { MaolysBranding } from '@/components/ui/maolys-branding';

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params.id as string;
  const { alert, confirm, DialogComponents } = useDialog();

  const [candidate, setCandidate] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [candidateId]);

  const loadData = async () => {
    try {
      const [candidateData, conversationData]: any = await Promise.all([
        api.getCandidate(candidateId),
        api.getCandidateConversation(candidateId),
      ]);

      setCandidate(candidateData.candidate);
      setConversation(conversationData);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await api.updateCandidateStatus(candidateId, status);
      loadData();
      await alert({
        title: 'Statut mis à jour',
        message: status === 'ACCEPTED' 
          ? 'Le candidat a été accepté et un message WhatsApp a été envoyé.' 
          : 'Le candidat a été refusé et un message WhatsApp a été envoyé.',
        type: 'success',
      });
    } catch (error: any) {
      await alert({
        title: 'Erreur',
        message: error.message || 'Erreur lors de la mise à jour du statut',
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 mb-2">Candidat non trouvé</p>
          <Link href="/dashboard">
            <Button variant="outline">Retour au dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const messages = conversation?.messages || [];

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100 border-gray-200';
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-blue-50 border-blue-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusBadge = () => {
    switch (candidate.status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            <Check className="h-4 w-4 mr-1.5" />
            Accepté
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
            <X className="h-4 w-4 mr-1.5" />
            Refusé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
            En cours
          </span>
        );
    }
  };

  return (
    <>
      <DialogComponents />
      <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href={`/dashboard/jobs/${candidate.job.id}`}>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </Link>
            <MaolysBranding variant="header" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {candidate.name || 'Candidat anonyme'}
                </h1>
                {getStatusBadge()}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {candidate.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{candidate.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span>{candidate.job.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    Candidature le {new Date(candidate.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {candidate.score !== null && (
                <div className={`flex flex-col items-center justify-center px-6 py-4 rounded-xl border-2 ${getScoreBgColor(candidate.score)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className={`h-5 w-5 ${getScoreColor(candidate.score)}`} fill="currentColor" />
                    <span className={`text-4xl font-bold ${getScoreColor(candidate.score)}`}>
                      {candidate.score}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Score</span>
                </div>
              )}

              <div className="flex gap-3">
                {candidate.status !== 'ACCEPTED' && candidate.status !== 'REJECTED' && (
                  <>
                    <Button
                      onClick={async () => {
                        const confirmed = await confirm({
                          title: 'Accepter le candidat',
                          message: 'Accepter ce candidat ? Un message WhatsApp sera envoyé.',
                          variant: 'default',
                          confirmText: 'Accepter',
                        });
                        if (confirmed) {
                          handleUpdateStatus('ACCEPTED');
                        }
                      }}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-green-200"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Accepter
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const confirmed = await confirm({
                          title: 'Refuser le candidat',
                          message: 'Refuser ce candidat ? Un message WhatsApp sera envoyé.',
                          variant: 'default',
                          confirmText: 'Refuser',
                        });
                        if (confirmed) {
                          handleUpdateStatus('REJECTED');
                        }
                      }}
                      className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Refuser
                    </Button>
                  </>
                )}
                {candidate.status === 'REJECTED' && (
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: 'Supprimer le candidat',
                        message: 'Êtes-vous sûr de vouloir supprimer définitivement ce candidat ?',
                        variant: 'danger',
                        confirmText: 'Supprimer',
                      });
                      if (confirmed) {
                        try {
                          await api.deleteCandidate(candidateId);
                          await alert({
                            title: 'Candidat supprimé',
                            message: 'Le candidat a été supprimé avec succès.',
                            type: 'success',
                          });
                          router.push(`/dashboard/jobs/${candidate.job.id}`);
                        } catch (error: any) {
                          await alert({
                            title: 'Erreur',
                            message: error.message || 'Erreur lors de la suppression',
                            type: 'error',
                          });
                        }
                      }
                    }}
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {candidate.summary && (
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Résumé IA</h2>
                </div>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{candidate.summary}</p>
              </div>
            )}

            {candidate.scoreDetails && candidate.scoreDetails.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-yellow-600" fill="currentColor" />
                  <h2 className="text-xl font-semibold text-gray-900">Détails du scoring</h2>
                </div>
                <div className="space-y-3">
                  {candidate.scoreDetails.map((detail: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-gray-700">{detail.criterion}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">{detail.points} pts</span>
                        <span className="text-xl">{detail.emoji}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {candidate.cvUrl && (
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Download className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Curriculum Vitae</h3>
                      <p className="text-sm text-gray-600">Téléchargez le CV du candidat</p>
                    </div>
                  </div>
                  <a
                    href={candidate.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Conversation sidebar */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Conversation WhatsApp</h2>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucune conversation disponible</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {messages.map((msg: any, index: number) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'agent' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-xl ${
                        msg.role === 'agent'
                          ? 'bg-blue-100 text-gray-900 rounded-tl-none'
                          : 'bg-green-100 text-gray-900 rounded-tr-none'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className="text-xs text-gray-500 mt-1.5">
                        {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
    </>
  );
}

