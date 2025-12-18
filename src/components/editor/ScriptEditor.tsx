
import CodeEditor from "@uiw/react-textarea-code-editor";
import type { ScriptDefinition } from "@/lib/types/gamespec";

interface ScriptEditorProps {
  scripts: ScriptDefinition[];
  selectedScriptId: string | null;
  onScriptSelect: (scriptId: string) => void;
  onScriptUpdate: (scriptId: string, code: string) => void;
  onScriptAdd: (name: string, template?: string) => void;
  onScriptDelete: (scriptId: string) => void;
  onScriptRename: (scriptId: string, newName: string) => void;
}

export function ScriptEditor({
  scripts,
  selectedScriptId,
  onScriptSelect,
  onScriptUpdate,
  onScriptAdd,
  onScriptDelete,
  onScriptRename,
}: ScriptEditorProps) {
  const selectedScript = scripts.find((s) => s.id === selectedScriptId);

  const handleAddScript = () => {
    const name = prompt("Enter script name:");
    if (name?.trim()) {
      const template = `-- ${name.trim()}

function on_start()
  print("${name.trim()} started!")
end

function on_update(dt)
  -- Update logic here
end`;
      onScriptAdd(name.trim(), template);
    }
  };

  const handleDeleteScript = (scriptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this script?")) {
      onScriptDelete(scriptId);
    }
  };

  const handleRenameScript = (scriptId: string) => {
    const script = scripts.find((s) => s.id === scriptId);
    if (!script) return;

    const newName = prompt("Enter new name:", script.name);
    if (newName?.trim() && newName.trim() !== script.name) {
      onScriptRename(scriptId, newName.trim());
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Script Tabs */}
      <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto" style={{ background: 'var(--panel-elevated)', borderBottom: '1px solid var(--ui-border)' }}>
        {scripts.map((script) => (
          <div
            key={script.id}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm rounded-t transition-all group
              ${
                script.id === selectedScriptId
                  ? "cyber-border"
                  : ""
              }
            `}
            style={{
              background: script.id === selectedScriptId ? 'var(--panel-bg)' : 'rgba(255, 255, 255, 0.03)',
              color: script.id === selectedScriptId ? 'var(--cyan-neon)' : 'var(--text-secondary)',
              border: script.id === selectedScriptId ? '1px solid var(--cyan-neon)' : '1px solid var(--ui-border)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.05em',
              fontWeight: 600
            }}
          >
            <button
              onClick={() => onScriptSelect(script.id)}
              onDoubleClick={() => handleRenameScript(script.id)}
              className="flex-1"
              title="Double-click to rename"
            >
              {script.name}
            </button>
            <button
              onClick={(e) => handleDeleteScript(script.id, e)}
              className="opacity-0 group-hover:opacity-100 transition-all"
              style={{ color: 'var(--danger)' }}
              title="Delete Script"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={handleAddScript}
          className="px-3 py-2 text-sm rounded transition-all font-bold tracking-wider glow-hover"
          style={{
            background: 'rgba(57, 255, 20, 0.15)',
            border: '1px solid var(--neon-green)',
            color: 'var(--neon-green)',
            fontFamily: 'var(--font-display)'
          }}
          title="Add New Script"
        >
          + NEW
        </button>
      </div>

      {/* Code Editor */}
      <div className="flex-1 overflow-auto" style={{ background: 'var(--panel-bg)' }}>
        {selectedScript ? (
          <CodeEditor
            value={selectedScript.lua_code}
            language="lua"
            placeholder="-- Write your Lua script here"
            onChange={(e) => onScriptUpdate(selectedScript.id, e.target.value)}
            padding={20}
            style={{
              fontSize: 14,
              backgroundColor: "var(--panel-bg)",
              fontFamily: "var(--font-code)",
              minHeight: "100%",
              color: "var(--text-primary)",
              lineHeight: "1.6"
            }}
            className="w-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
            SELECT A SCRIPT TO EDIT
          </div>
        )}
      </div>

      {/* Script Info Footer */}
      {selectedScript && (
        <div className="px-4 py-2 text-xs" style={{ background: 'var(--panel-elevated)', borderTop: '1px solid var(--ui-border)', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>
          <span style={{ color: 'var(--cyan-neon)' }}>SCRIPT:</span> {selectedScript.name} <span style={{ color: 'var(--text-muted)', marginLeft: '1rem' }}>({selectedScript.id})</span>
        </div>
      )}
    </div>
  );
}
