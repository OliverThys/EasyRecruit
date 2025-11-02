'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, QrCode, Check, X, Download, RefreshCw, Mail, Clock, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useDialog } from '@/lib/useDialog';
import { MaolysBranding } from '@/components/ui/maolys-branding';

interface Candidate {
  id: string;
  name: string | null;
  email: string | null;
  score: number | null;
  status: string;
  createdAt: string;
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const { alert, confirm, DialogComponents } = useDialog();

  const [job, setJob] = useState<any>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Délai minimum pour le feedback visuel lors de l'actualisation
      const minDelay = isRefresh ? 500 : 0;
      const startTime = Date.now();

      const [jobData, candidatesData]: any = await Promise.all([
        api.getJob(jobId),
        api.getCandidates(jobId),
      ]);

      setJob(jobData.job);
      setCandidates(candidatesData.candidates || []);

      // S'assurer que l'animation est visible au moins 500ms
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minDelay) {
        await new Promise((resolve) => setTimeout(resolve, minDelay - elapsedTime));
      }
    } catch (error: any) {
      console.error('Erreur chargement:', error);
      if (error.message?.includes('401') || error.message?.includes('non trouvée')) {
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadData(true);
  };

  const handleGenerateQR = async () => {
    try {
      const response: any = await api.generateWhatsAppLink(jobId);
      setQrCode(response.qrCode);
      await alert({
        title: 'QR Code généré',
        message: 'Le QR code a été généré avec succès !',
        type: 'success',
      });
    } catch (error: any) {
      await alert({
        title: 'Erreur',
        message: error.message || 'Erreur lors de la génération du QR code',
        type: 'error',
      });
    }
  };

  const handleUpdateStatus = async (candidateId: string, status: string) => {
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

  const handleDeleteCandidate = async (candidateId: string) => {
    const confirmed = await confirm({
      title: 'Supprimer le candidat',
      message: 'Êtes-vous sûr de vouloir supprimer définitivement ce candidat ?',
      variant: 'danger',
      confirmText: 'Supprimer',
    });

    if (!confirmed) return;

    try {
      await api.deleteCandidate(candidateId);
      loadData();
      await alert({
        title: 'Candidat supprimé',
        message: 'Le candidat a été supprimé avec succès.',
        type: 'success',
      });
    } catch (error: any) {
      await alert({
        title: 'Erreur',
        message: error.message || 'Erreur lors de la suppression',
        type: 'error',
      });
    }
  };

  const handleDeleteJob = async () => {
    if (!job) return;
    
    const confirmed = await confirm({
      title: 'Supprimer l\'offre',
      message: `Êtes-vous sûr de vouloir supprimer définitivement l'offre "${job.title}" ?\n\nTous les candidats associés seront également supprimés.`,
      variant: 'danger',
      confirmText: 'Supprimer',
    });

    if (!confirmed) return;

    try {
      await api.deleteJob(jobId);
      await alert({
        title: 'Offre supprimée',
        message: 'L\'offre a été supprimée avec succès.',
        type: 'success',
      });
      router.push('/dashboard');
    } catch (error: any) {
      await alert({
        title: 'Erreur',
        message: error.message || 'Erreur lors de la suppression',
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return <div>Offre non trouvée</div>;
  }

  return (
    <>
      <DialogComponents />
      <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </Link>
            <MaolysBranding variant="header" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button onClick={handleGenerateQR}>
                <QrCode className="mr-2 h-4 w-4" />
                Générer QR Code
              </Button>
              <Button
                onClick={handleDeleteJob}
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>

          {qrCode && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Scannez ce QR code pour postuler :</p>
              <div className="flex items-center gap-4">
                <img
                  src={qrCode}
                  alt="QR Code"
                  width={200}
                  height={200}
                  className="border border-gray-300 rounded"
                />
                {job.whatsappLink && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Ou cliquez sur le lien :</p>
                    <a
                      href={job.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {job.whatsappLink}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Candidats ({candidates.length})
            </h2>
          </div>

          {candidates.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg font-medium mb-2">Aucun candidat pour le moment</p>
              <p className="text-sm text-gray-400">Les candidats apparaîtront ici lorsqu'ils postuleront</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {candidates
                .sort((a, b) => {
                  // Si les deux ont un score, trier par score décroissant
                  if (a.score !== null && b.score !== null) {
                    return b.score - a.score;
                  }
                  // Si seul a a un score, a vient avant
                  if (a.score !== null && b.score === null) {
                    return -1;
                  }
                  // Si seul b a un score, b vient avant
                  if (a.score === null && b.score !== null) {
                    return 1;
                  }
                  // Si les deux sont null, trier par date de création décroissante
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                })
                .map((candidate) => {
                  const getScoreColor = (score: number | null) => {
                    if (score === null) return 'text-gray-400';
                    if (score >= 80) return 'text-green-600';
                    if (score >= 60) return 'text-blue-600';
                    if (score >= 40) return 'text-orange-600';
                    return 'text-red-600';
                  };

                  const getScoreBgColor = (score: number | null) => {
                    if (score === null) return 'bg-gray-100';
                    if (score >= 80) return 'bg-green-50 border-green-200';
                    if (score >= 60) return 'bg-blue-50 border-blue-200';
                    if (score >= 40) return 'bg-orange-50 border-orange-200';
                    return 'bg-red-50 border-red-200';
                  };

                  const getStatusBadge = () => {
                    switch (candidate.status) {
                      case 'ACCEPTED':
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            Accepté
                          </span>
                        );
                      case 'REJECTED':
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            <X className="h-3 w-3 mr-1" />
                            Refusé
                          </span>
                        );
                      case 'COMPLETED':
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            Terminé
                          </span>
                        );
                      default:
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            En cours
                          </span>
                        );
                    }
                  };

                  return (
                    <Link
                      key={candidate.id}
                      href={`/dashboard/candidates/${candidate.id}`}
                      className="block px-6 py-5 hover:bg-gray-50 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between gap-6">
                        {/* Informations principales */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {candidate.name || 'Candidat anonyme'}
                            </h3>
                            {getStatusBadge()}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            {candidate.email && (
                              <div className="flex items-center gap-1.5">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="truncate max-w-xs">{candidate.email}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>{new Date(candidate.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </div>
                        </div>

                        {/* Score et actions */}
                        <div className="flex items-center gap-4">
                          {candidate.score !== null && (
                            <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg border-2 ${getScoreBgColor(candidate.score)} min-w-[80px]`}>
                              <div className="flex items-center gap-1 mb-0.5">
                                <Star className={`h-4 w-4 ${getScoreColor(candidate.score)}`} fill="currentColor" />
                                <span className={`text-2xl font-bold ${getScoreColor(candidate.score)}`}>
                                  {candidate.score}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-gray-600">Score</span>
                            </div>
                          )}
                          
                          {candidate.score === null && (
                            <div className="flex flex-col items-center justify-center px-4 py-3 rounded-lg border-2 bg-gray-50 border-gray-200 min-w-[80px]">
                              <div className="flex items-center gap-1 mb-0.5">
                                <Star className="h-4 w-4 text-gray-400" />
                                <span className="text-2xl font-bold text-gray-400">-</span>
                              </div>
                              <span className="text-xs font-medium text-gray-500">En attente</span>
                            </div>
                          )}

                          {/* Boutons d'action */}
                          <div className="flex gap-2">
                            {candidate.status !== 'ACCEPTED' && candidate.status !== 'REJECTED' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const confirmed = await confirm({
                                    title: 'Accepter le candidat',
                                    message: 'Accepter ce candidat ? Un message WhatsApp sera envoyé.',
                                    variant: 'default',
                                    confirmText: 'Accepter',
                                  });
                                  if (confirmed) {
                                    handleUpdateStatus(candidate.id, 'ACCEPTED');
                                  }
                                }}
                                >
                                  <Check className="h-4 w-4 mr-1.5" />
                                  Accepter
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const confirmed = await confirm({
                                    title: 'Refuser le candidat',
                                    message: 'Refuser ce candidat ? Un message WhatsApp sera envoyé.',
                                    variant: 'default',
                                    confirmText: 'Refuser',
                                  });
                                  if (confirmed) {
                                    handleUpdateStatus(candidate.id, 'REJECTED');
                                  }
                                }}
                                >
                                  <X className="h-4 w-4 mr-1.5" />
                                  Refuser
                                </Button>
                              </>
                            )}
                            {candidate.status === 'REJECTED' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const confirmed = await confirm({
                                    title: 'Supprimer le candidat',
                                    message: 'Êtes-vous sûr de vouloir supprimer définitivement ce candidat ?',
                                    variant: 'danger',
                                    confirmText: 'Supprimer',
                                  });
                                  if (confirmed) {
                                    handleDeleteCandidate(candidate.id);
                                  }
                                }}
                              >
                                Supprimer
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      </main>
    </div>
    </>
  );
}

