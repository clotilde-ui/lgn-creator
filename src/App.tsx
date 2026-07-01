import { useState } from 'react';
import { FileText, Loader2, AlertCircle, Sparkles, Code, Save, Check, Database, PenLine, Send, ExternalLink } from 'lucide-react';
import { ArticleData, NewsletterData } from './types';
import { EditableArticle } from './components/EditableArticle';
import { EditableTool } from './components/EditableTool';
import { Archives } from './components/Archives';
import { generateNewsletterHTML } from './utils/generateHTML';
import { generateEmailHTML } from './utils/generateEmailHTML';

type Tab = 'generation' | 'archives';

function App() {
  const [tab, setTab] = useState<Tab>('generation');
  const [newsletterNumber, setNewsletterNumber] = useState('');
  const [urlArticle1, setUrlArticle1] = useState('');
  const [urlArticle2, setUrlArticle2] = useState('');
  const [urlArticle3, setUrlArticle3] = useState('');
  const [urlTool, setUrlTool] = useState('');
  const [urlDeuxioArticle, setUrlDeuxioArticle] = useState('');

  const [article1, setArticle1] = useState<ArticleData | null>(null);
  const [article2, setArticle2] = useState<ArticleData | null>(null);
  const [article3, setArticle3] = useState<ArticleData | null>(null);
  const [tool, setTool] = useState<ArticleData | null>(null);
  const [deuxioArticle, setDeuxioArticle] = useState<ArticleData | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedHTML, setGeneratedHTML] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailSubjectProposals, setEmailSubjectProposals] = useState<string[]>([]);
  const [generatingSubject, setGeneratingSubject] = useState(false);
  const [savingNewsletter, setSavingNewsletter] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sendingBrevo, setSendingBrevo] = useState(false);
  const [brevoSuccess, setBrevoSuccess] = useState(false);
  const [brevoError, setBrevoError] = useState('');

  const handleExtract = async () => {
    if (!newsletterNumber.trim()) {
      setError('Veuillez entrer le numéro de la newsletter');
      return;
    }

    const hasAtLeastOneUrl = urlArticle1.trim() || urlArticle2.trim() || urlArticle3.trim() ||
                             urlTool.trim() || urlDeuxioArticle.trim();

    if (!hasAtLeastOneUrl) {
      setError('Veuillez entrer au moins une URL');
      return;
    }

    setLoading(true);
    setError('');
    setArticle1(null);
    setArticle2(null);
    setArticle3(null);
    setTool(null);
    setDeuxioArticle(null);
    setGeneratedHTML('');

    try {
      const apiUrl = '/api/extract-text';

      const headers = {
        'Content-Type': 'application/json',
      };

      const requests = [];
      const urlMap: { [key: string]: string } = {};

      if (urlArticle1.trim()) {
        requests.push(fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: urlArticle1, type: 'article' }),
        }));
        urlMap[requests.length - 1] = 'article1';
      }

      if (urlArticle2.trim()) {
        requests.push(fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: urlArticle2, type: 'article' }),
        }));
        urlMap[requests.length - 1] = 'article2';
      }

      if (urlArticle3.trim()) {
        requests.push(fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: urlArticle3, type: 'article' }),
        }));
        urlMap[requests.length - 1] = 'article3';
      }

      if (urlTool.trim()) {
        requests.push(fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: urlTool, type: 'tool' }),
        }));
        urlMap[requests.length - 1] = 'tool';
      }

      if (urlDeuxioArticle.trim()) {
        requests.push(fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: urlDeuxioArticle, type: 'deuxio' }),
        }));
        urlMap[requests.length - 1] = 'deuxioArticle';
      }


      const settledResults = await Promise.allSettled(
        requests.map(async (request) => {
          const response = await request;
          const payload = await response.json().catch(() => null);

          if (!response.ok) {
            const apiError = payload && typeof payload === 'object' && 'error' in payload
              ? String(payload.error)
              : `Erreur API (${response.status})`;
            throw new Error(apiError);
          }

          if (payload && typeof payload === 'object' && 'error' in payload) {
            throw new Error(String(payload.error));
          }

          return payload;
        })
      );

      const keyLabels: Record<string, string> = {
        article1: 'Article 1',
        article2: 'Article 2',
        article3: 'Article 3',
        tool: 'Outil',
        deuxioArticle: 'Deuxio',
      };

      const errors: string[] = [];
      let successCount = 0;

      settledResults.forEach((result, index) => {
        const key = urlMap[index];
        const label = keyLabels[key] || key;

        if (result.status === 'rejected') {
          const reason = result.reason instanceof Error ? result.reason.message : 'Erreur inconnue';
          errors.push(`${label}: ${reason}`);
          return;
        }

        successCount += 1;
        const data = result.value;
        switch (key) {
          case 'article1':
            setArticle1(data);
            break;
          case 'article2':
            setArticle2(data);
            break;
          case 'article3':
            setArticle3(data);
            break;
          case 'tool':
            setTool(data);
            break;
          case 'deuxioArticle':
            setDeuxioArticle(data);
            break;
        }
      });

      if (errors.length > 0) {
        if (successCount === 0) {
          throw new Error(errors.join(' | '));
        }
        setError(`Certaines URLs n'ont pas pu être extraites: ${errors.join(' | ')}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSubject = async () => {
    const hasArticles = article1 || article2 || article3 || tool || deuxioArticle;
    if (!hasArticles) {
      setError('Veuillez d\'abord extraire au moins un article');
      return;
    }

    setGeneratingSubject(true);
    setError('');

    try {
      const response = await fetch('/api/generate-subject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article1Summary: article1?.summary || '',
          article2Summary: article2?.summary || '',
          article3Summary: article3?.summary || '',
          toolSummary: tool?.summary || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de l\'objet');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setEmailSubjectProposals(data.subjects || []);
      setEmailSubject('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setGeneratingSubject(false);
    }
  };

  const handleGenerateHTML = () => {
    const newsletterData: NewsletterData = {
      article1,
      article2,
      article3,
      tool,
      deuxioArticle,
    };

    const html = generateNewsletterHTML(newsletterData, newsletterNumber);
    setGeneratedHTML(html);
  };

  const handleSaveNewsletter = async () => {
    if (!generatedHTML) {
      setError('Veuillez d\'abord générer le HTML');
      return;
    }

    setSavingNewsletter(true);
    setSaveSuccess(false);
    setError('');

    try {
      const response = await fetch('/api/newsletters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsletterNumber: newsletterNumber.trim() || 'sans numéro',
          subject: emailSubject.trim(),
          yaml: generatedHTML,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'enregistrement');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSavingNewsletter(false);
    }
  };

  const handleCreateBrevoCampaign = async () => {
    if (!generatedHTML) {
      setBrevoError('Veuillez d\'abord générer la newsletter');
      return;
    }
    if (!emailSubject.trim()) {
      setBrevoError('Veuillez d\'abord renseigner l\'objet de l\'email (étape 3)');
      return;
    }

    setSendingBrevo(true);
    setBrevoSuccess(false);
    setBrevoError('');

    try {
      const newsletterData: NewsletterData = {
        article1,
        article2,
        article3,
        tool,
        deuxioArticle,
      };

      const html = generateEmailHTML(newsletterData, newsletterNumber);

      const response = await fetch('/api/create-brevo-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `LaGrowthNews n° ${newsletterNumber}`.trim(),
          subject: emailSubject.trim(),
          html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la campagne Brevo');
      }

      setBrevoSuccess(true);
    } catch (err) {
      setBrevoError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSendingBrevo(false);
    }
  };

  const handleDownloadYAML = () => {
    if (!generatedHTML) {
      setError('Veuillez d\'abord générer le HTML');
      return;
    }

    const blob = new Blob([generatedHTML], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lgn-${newsletterNumber}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lgn-cream to-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/favicon.svg" alt="LGN Logo" className="w-20 h-20" />
          </div>
          <h1 className="text-4xl font-bold text-lgn-pink mb-2">
            Générateur de Newsletter
          </h1>
          <p className="text-gray-700">
            Générez automatiquement votre newsletter marketing
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setTab('generation')}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
              tab === 'generation'
                ? 'bg-lgn-pink text-white'
                : 'bg-white text-lgn-dark border border-gray-300 hover:bg-lgn-cream'
            }`}
          >
            <PenLine className="w-4 h-4" />
            Génération
          </button>
          <button
            onClick={() => setTab('archives')}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
              tab === 'archives'
                ? 'bg-lgn-pink text-white'
                : 'bg-white text-lgn-dark border border-gray-300 hover:bg-lgn-cream'
            }`}
          >
            <Database className="w-4 h-4" />
            Archives
          </button>
        </div>

        {tab === 'archives' ? (
          <Archives />
        ) : (
        <>
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-lgn-pink/20">
          <h2 className="text-xl font-semibold text-lgn-dark mb-6">1. Entrez les URLs</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="newsletterNumber" className="block text-sm font-medium text-lgn-dark mb-2">
                Numéro de la newsletter
              </label>
              <input
                id="newsletterNumber"
                type="text"
                value={newsletterNumber}
                onChange={(e) => setNewsletterNumber(e.target.value)}
                placeholder="309"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lgn-green focus:border-transparent outline-none transition-all"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="url1" className="block text-sm font-medium text-lgn-dark mb-2">
                  URL Article 1
                </label>
                <input
                  id="url1"
                  type="url"
                  value={urlArticle1}
                  onChange={(e) => setUrlArticle1(e.target.value)}
                  placeholder="https://exemple.com/article-1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lgn-green focus:border-transparent outline-none transition-all"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="url2" className="block text-sm font-medium text-slate-700 mb-2">
                  URL Article 2
                </label>
                <input
                  id="url2"
                  type="url"
                  value={urlArticle2}
                  onChange={(e) => setUrlArticle2(e.target.value)}
                  placeholder="https://exemple.com/article-2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lgn-green focus:border-transparent outline-none transition-all"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="url3" className="block text-sm font-medium text-slate-700 mb-2">
                  URL Article 3
                </label>
                <input
                  id="url3"
                  type="url"
                  value={urlArticle3}
                  onChange={(e) => setUrlArticle3(e.target.value)}
                  placeholder="https://exemple.com/article-3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lgn-green focus:border-transparent outline-none transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-lgn-pink/20">
              <label htmlFor="urlTool" className="block text-sm font-medium text-slate-700 mb-2">
                URL Outil de la semaine
              </label>
              <input
                id="urlTool"
                type="url"
                value={urlTool}
                onChange={(e) => setUrlTool(e.target.value)}
                placeholder="https://exemple.com/outil"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                disabled={loading}
              />
            </div>

            <div className="pt-4 border-t border-lgn-pink/20">
              <h3 className="text-sm font-semibold text-lgn-dark mb-3">Ressources deux.io</h3>
              <div>
                <label htmlFor="urlDeuxioArticle" className="block text-sm font-medium text-slate-700 mb-2">
                  URL Article deux.io
                </label>
                <input
                  id="urlDeuxioArticle"
                  type="url"
                  value={urlDeuxioArticle}
                  onChange={(e) => setUrlDeuxioArticle(e.target.value)}
                  placeholder="https://deux.io/article"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lgn-green focus:border-transparent outline-none transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              onClick={handleExtract}
              disabled={loading}
              className="w-full px-6 py-3 bg-lgn-green text-white rounded-lg font-medium hover:bg-lgn-green/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Extraire et générer les résumés
                </>
              )}
            </button>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {(article1 || article2 || article3 || tool) && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-lgn-pink/20">
              <h2 className="text-xl font-semibold text-lgn-dark mb-6">2. Vérifiez et modifiez si nécessaire</h2>

              <div className="space-y-6">
                {article1 && (
                  <EditableArticle
                    number={1}
                    title={article1.title || ''}
                    summary={article1.summary}
                    author={article1.author || 'Auteur inconnu'}
                    tag={article1.tag || ''}
                    onTitleChange={(value) => setArticle1({ ...article1, title: value })}
                    onSummaryChange={(value) => setArticle1({ ...article1, summary: value })}
                    onAuthorChange={(value) => setArticle1({ ...article1, author: value })}
                    onTagChange={(value) => setArticle1({ ...article1, tag: value })}
                  />
                )}

                {article2 && (
                  <EditableArticle
                    number={2}
                    title={article2.title || ''}
                    summary={article2.summary}
                    author={article2.author || 'Auteur inconnu'}
                    tag={article2.tag || ''}
                    onTitleChange={(value) => setArticle2({ ...article2, title: value })}
                    onSummaryChange={(value) => setArticle2({ ...article2, summary: value })}
                    onAuthorChange={(value) => setArticle2({ ...article2, author: value })}
                    onTagChange={(value) => setArticle2({ ...article2, tag: value })}
                  />
                )}

                {article3 && (
                  <EditableArticle
                    number={3}
                    title={article3.title || ''}
                    summary={article3.summary}
                    author={article3.author || 'Auteur inconnu'}
                    tag={article3.tag || ''}
                    onTitleChange={(value) => setArticle3({ ...article3, title: value })}
                    onSummaryChange={(value) => setArticle3({ ...article3, summary: value })}
                    onAuthorChange={(value) => setArticle3({ ...article3, author: value })}
                    onTagChange={(value) => setArticle3({ ...article3, tag: value })}
                  />
                )}

                {tool && (
                  <EditableTool
                    toolName={tool.toolName || 'Outil'}
                    summary={tool.summary}
                    tag={tool.tag || ''}
                    onToolNameChange={(value) => setTool({ ...tool, toolName: value })}
                    onSummaryChange={(value) => setTool({ ...tool, summary: value })}
                    onTagChange={(value) => setTool({ ...tool, tag: value })}
                  />
                )}

                {deuxioArticle && (
                  <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Article deux.io</h3>
                    <p className="text-slate-600">{deuxioArticle.title || 'Titre extrait'}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-lgn-pink/20">
              <h2 className="text-xl font-semibold text-lgn-dark mb-6">3. Générer l'objet de l'email</h2>

              <button
                onClick={handleGenerateSubject}
                disabled={generatingSubject}
                className="w-full px-6 py-3 bg-lgn-dark text-white rounded-lg font-medium hover:bg-lgn-dark/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mb-4"
              >
                {generatingSubject ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Générer l'objet avec l'IA
                  </>
                )}
              </button>

              {emailSubjectProposals.length > 0 && (
                <div className="mb-6 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-lgn-dark mb-2">Choisir une proposition</p>
                    <ul className="space-y-2">
                      {emailSubjectProposals.map((proposal, i) => (
                        <li key={i}>
                          <button
                            onClick={() => setEmailSubject(proposal)}
                            className={`w-full text-left px-4 py-2 rounded-lg border text-sm transition-colors ${
                              emailSubject === proposal
                                ? 'border-lgn-green bg-lgn-green/10 font-medium text-lgn-dark'
                                : 'border-gray-200 hover:border-lgn-green hover:bg-lgn-green/5 text-slate-700'
                            }`}
                          >
                            {proposal}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lgn-dark mb-2">
                      Objet sélectionné (modifiable)
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lgn-green focus:border-transparent outline-none transition-all"
                      placeholder="Cliquer sur une proposition ou saisir manuellement…"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-lgn-pink/20">
              <h2 className="text-xl font-semibold text-lgn-dark mb-6">4. Générer la newsletter</h2>

              <button
                onClick={handleGenerateHTML}
                className="w-full px-6 py-3 bg-lgn-pink text-lgn-dark rounded-lg font-medium hover:bg-lgn-pink/90 transition-colors flex items-center justify-center gap-2"
              >
                <Code className="w-5 h-5" />
                Générer le code HTML de la newsletter
              </button>

              {generatedHTML && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-lgn-dark">
                      Code HTML généré
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(generatedHTML)}
                        className="px-4 py-2 text-sm text-lgn-dark border border-gray-300 rounded-lg hover:bg-lgn-cream transition-colors"
                      >
                        Copier le code
                      </button>
                      <button
                        onClick={handleDownloadYAML}
                        className="px-4 py-2 text-sm bg-lgn-pink text-white rounded-lg hover:bg-lgn-pink/90 transition-colors flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Télécharger YAML
                      </button>
                      <button
                        onClick={handleSaveNewsletter}
                        disabled={savingNewsletter}
                        className="px-4 py-2 text-sm bg-lgn-green text-white rounded-lg hover:bg-lgn-green/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {savingNewsletter ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : saveSuccess ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {saveSuccess ? 'Enregistrée' : 'Enregistrer'}
                      </button>
                      <button
                        onClick={handleCreateBrevoCampaign}
                        disabled={sendingBrevo}
                        className="px-4 py-2 text-sm bg-lgn-dark text-white rounded-lg hover:bg-lgn-dark/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {sendingBrevo ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : brevoSuccess ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {brevoSuccess ? 'Brouillon créé' : 'Créer la campagne Brevo'}
                      </button>
                    </div>
                  </div>

                  {brevoSuccess && (
                    <a
                      href="https://app.brevo.com/marketing-campaigns/classic"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-4 bg-lgn-green/10 border border-lgn-green/30 rounded-lg text-sm text-lgn-dark hover:bg-lgn-green/20 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Brouillon créé dans Brevo. Clique ici pour le relire et l'envoyer.
                    </a>
                  )}

                  {brevoError && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800 text-sm">{brevoError}</p>
                    </div>
                  )}

                  <textarea
                    value={generatedHTML}
                    readOnly
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-lgn-cream font-mono text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}

export default App;
