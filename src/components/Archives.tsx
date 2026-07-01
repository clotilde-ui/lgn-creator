import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, FileText, Copy, Check, RefreshCw, Trash2 } from 'lucide-react';

interface NewsletterListItem {
  id: number;
  newsletter_number: string;
  subject: string;
  created_at: string;
}

interface NewsletterDetail extends NewsletterListItem {
  yaml: string;
}

function formatDate(value: string): string {
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T') + 'Z');
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Archives() {
  const [newsletters, setNewsletters] = useState<NewsletterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<NewsletterDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchNewsletters = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/newsletters');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement');
      }
      setNewsletters(data.newsletters || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const openNewsletter = async (id: number) => {
    setLoadingDetail(true);
    setError('');
    setCopied(false);
    try {
      const response = await fetch(`/api/newsletters?id=${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement');
      }
      setSelected(data.newsletter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoadingDetail(false);
    }
  };

  const deleteNewsletter = async (id: number) => {
    if (!confirm('Supprimer cette newsletter de la base ?')) {
      return;
    }
    try {
      const response = await fetch(`/api/newsletters?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }
      if (selected?.id === id) {
        setSelected(null);
      }
      setNewsletters((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const copyYaml = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-lgn-pink/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-lgn-dark">Newsletters enregistrées</h2>
        <button
          onClick={fetchNewsletters}
          className="px-4 py-2 text-sm text-lgn-dark border border-gray-300 rounded-lg hover:bg-lgn-cream transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Rafraîchir
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Chargement...
        </div>
      ) : newsletters.length === 0 ? (
        <p className="text-slate-500 text-center py-12">Aucune newsletter enregistrée pour l'instant.</p>
      ) : (
        <div className="space-y-2">
          {newsletters.map((n) => (
            <div
              key={n.id}
              className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:border-lgn-pink transition-colors"
            >
              <button onClick={() => openNewsletter(n.id)} className="flex-1 text-left">
                <p className="font-medium text-lgn-dark">
                  LaGrowthNews n° {n.newsletter_number}
                </p>
                <p className="text-sm text-slate-500">
                  {n.subject ? `${n.subject} · ` : ''}
                  {formatDate(n.created_at)}
                </p>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openNewsletter(n.id)}
                  className="px-3 py-2 text-sm text-lgn-dark border border-gray-300 rounded-lg hover:bg-lgn-cream transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Voir
                </button>
                <button
                  onClick={() => deleteNewsletter(n.id)}
                  className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {loadingDetail && (
        <div className="flex items-center justify-center gap-2 py-6 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Chargement du code...
        </div>
      )}

      {selected && !loadingDetail && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-lgn-dark">
              Code YAML · n° {selected.newsletter_number}
            </h3>
            <button
              onClick={copyYaml}
              className="px-4 py-2 text-sm text-lgn-dark border border-gray-300 rounded-lg hover:bg-lgn-cream transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copié' : 'Copier le code'}
            </button>
          </div>
          <textarea
            value={selected.yaml}
            readOnly
            rows={20}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-lgn-cream font-mono text-xs"
          />
        </div>
      )}
    </div>
  );
}
