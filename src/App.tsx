import { useState } from 'react';
import { FileText, Loader2, AlertCircle, Sparkles, Code } from 'lucide-react';
import { ArticleData, NewsletterData } from './types';
import { EditableArticle } from './components/EditableArticle';
import { EditableTool } from './components/EditableTool';
import { generateNewsletterHTML } from './utils/generateHTML';
function App() {
  const [newsletterNumber, setNewsletterNumber] = useState('');
  const [urlArticle1, setUrlArticle1] = useState('');
  const [urlArticle2, setUrlArticle2] = useState('');
  const [urlArticle3, setUrlArticle3] = useState('');
  const [urlTool, setUrlTool] = useState('');
  const [urlDeuxioArticle, setUrlDeuxioArticle] = useState('');
  const [linkedinPostUrl, setLinkedinPostUrl] = useState('');
  const [linkedinPostExcerpt, setLinkedinPostExcerpt] = useState('');

  const [article1, setArticle1] = useState<ArticleData | null>(null);
  const [article2, setArticle2] = useState<ArticleData | null>(null);
  const [article3, setArticle3] = useState<ArticleData | null>(null);
  const [tool, setTool] = useState<ArticleData | null>(null);
  const [deuxioArticle, setDeuxioArticle] = useState<ArticleData | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedHTML, setGeneratedHTML] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [generatingSubject, setGeneratingSubject] = useState(false);

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


      const responses = await Promise.all(requests);

      for (const response of responses) {
        if (!response.ok) {
          throw new Error('Erreur lors de l\'extraction des textes');
        }
      }

      const dataArray = await Promise.all(responses.map(r => r.json()));

      dataArray.forEach((data, index) => {
        if (data.error) {
          throw new Error(data.error);
        }

        const key = urlMap[index];
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

      setEmailSubject(data.subject);
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
      linkedinPostUrl: linkedinPostUrl.trim() || undefined,
      linkedinPostExcerpt: linkedinPostExcerpt.trim() || undefined,
    };

    const html = generateNewsletterHTML(newsletterData, newsletterNumber);
    setGeneratedHTML(html);
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="linkedinPostUrl" className="block text-sm font-medium text-slate-700 mb-2">
                    URL du post LinkedIn
                  </label>
                  <input
                    id="linkedinPostUrl"
                    type="url"
                    value={linkedinPostUrl}
                    onChange={(e) => setLinkedinPostUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/posts/..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lgn-green focus:border-transparent outline-none transition-all"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="linkedinPostExcerpt" className="block text-sm font-medium text-slate-700 mb-2">
                    Debut du post LinkedIn
                  </label>
                  <textarea
                    id="linkedinPostExcerpt"
                    value={linkedinPostExcerpt}
                    onChange={(e) => setLinkedinPostExcerpt(e.target.value)}
                    placeholder="Les premières lignes du post..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lgn-green focus:border-transparent outline-none transition-all"
                    disabled={loading}
                  />
                </div>
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

                {linkedinPostUrl && (
                  <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Post LinkedIn</h3>
                    <p className="text-slate-600">{linkedinPostExcerpt || linkedinPostUrl}</p>
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

              {emailSubject && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-lgn-dark mb-2">
                    Objet de l'email
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lgn-green focus:border-transparent outline-none transition-all"
                    placeholder="L'objet sera généré par l'IA..."
                  />
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
                    </div>
                  </div>

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
      </div>
    </div>
  );
}

export default App;
