interface EditableArticleProps {
  number: number;
  title: string;
  summary: string;
  author: string;
  tag: string;
  onTitleChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onTagChange: (value: string) => void;
}

export function EditableArticle({
  number,
  title,
  summary,
  author,
  tag,
  onTitleChange,
  onSummaryChange,
  onAuthorChange,
  onTagChange,
}: EditableArticleProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-lg font-bold">
          {number}
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Article {number}</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Titre
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Résumé
        </label>
        <textarea
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Auteur
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => onAuthorChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Tag (avec emoji, ex: 📊 Analytics)
        </label>
        <input
          type="text"
          value={tag}
          onChange={(e) => onTagChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="📊 Analytics"
        />
      </div>
    </div>
  );
}
