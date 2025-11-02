'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, X, FileText, Target, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useDialog } from '@/lib/useDialog';
import { MaolysBranding } from '@/components/ui/maolys-branding';

export default function NewJobPage() {
  const router = useRouter();
  const { alert, DialogComponents } = useDialog();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [essentialCriteria, setEssentialCriteria] = useState<Array<{ name: string; type: string; value: string }>>([
    { name: '', type: 'skill', value: '' },
  ]);
  const [niceToHave, setNiceToHave] = useState<Array<{ name: string; type: string; value: string }>>([]);

  const addEssentialCriterion = () => {
    setEssentialCriteria([...essentialCriteria, { name: '', type: 'skill', value: '' }]);
  };

  const removeEssentialCriterion = (index: number) => {
    setEssentialCriteria(essentialCriteria.filter((_, i) => i !== index));
  };

  const addNiceToHave = () => {
    setNiceToHave([...niceToHave, { name: '', type: 'skill', value: '' }]);
  };

  const removeNiceToHave = (index: number) => {
    setNiceToHave(niceToHave.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const filteredEssential = essentialCriteria.filter(c => c.name && c.value);
      const filteredNice = niceToHave.filter(c => c.name && c.value);

      await api.createJob({
        title,
        description,
        essentialCriteria: filteredEssential,
        niceToHave: filteredNice,
      });

      await alert({
        title: 'Offre créée',
        message: 'L\'offre d\'emploi a été créée avec succès !',
        type: 'success',
      });
      router.push('/dashboard');
    } catch (error: any) {
      await alert({
        title: 'Erreur',
        message: error.message || 'Erreur lors de la création de l\'offre',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogComponents />
      <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nouvelle offre d'emploi</h1>
          <p className="text-gray-600">Créez une nouvelle offre et commencez à recruter via WhatsApp</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-100 p-8 space-y-8">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Titre du poste <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ex: Développeur Full-Stack Senior"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Décrivez le poste, les missions, l'entreprise..."
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Critères essentiels (obligatoires) <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {essentialCriteria.map((criterion, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={criterion.name}
                    onChange={(e) => {
                      const updated = [...essentialCriteria];
                      updated[index].name = e.target.value;
                      setEssentialCriteria(updated);
                    }}
                    placeholder="Ex: Expérience React"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={criterion.value}
                    onChange={(e) => {
                      const updated = [...essentialCriteria];
                      updated[index].value = e.target.value;
                      setEssentialCriteria(updated);
                    }}
                    placeholder="Ex: 3+ ans"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {essentialCriteria.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEssentialCriterion(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEssentialCriterion}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un critère essentiel
            </Button>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Critères bonus (nice-to-have)
            </label>
            <div className="space-y-3">
              {niceToHave.map((criterion, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={criterion.name}
                    onChange={(e) => {
                      const updated = [...niceToHave];
                      updated[index].name = e.target.value;
                      setNiceToHave(updated);
                    }}
                    placeholder="Ex: TypeScript"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={criterion.value}
                    onChange={(e) => {
                      const updated = [...niceToHave];
                      updated[index].value = e.target.value;
                      setNiceToHave(updated);
                    }}
                    placeholder="Ex: Expérience"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNiceToHave(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addNiceToHave}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un critère bonus
            </Button>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="px-6">
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Création...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Créer l'offre</span>
                </span>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
    </>
  );
}

