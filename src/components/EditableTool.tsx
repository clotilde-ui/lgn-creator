interface EditableToolProps {
  toolName: string;
  summary: string;
  tag: string;
  onToolNameChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onTagChange: (value: string) => void;
}

export function EditableTool({
  toolName,
  summary,
  tag,
  onToolNameChange,
  onSummaryChange,
  onTagChange,
}: EditableToolProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-lg">
          <span className="text-lg">⚒️</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Outil de la semaine</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Nom de l'outil
        </label>
        <input
          type="text"
          value={toolName}
          onChange={(e) => onToolNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Description
        </label>
        <textarea
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Tag (avec emoji, ex: 🛠️ Automation)
        </label>
        <input
          type="text"
          value={tag}
          onChange={(e) => onTagChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          placeholder="🛠️ Automation"
        />
      </div>
    </div>
  );
}
