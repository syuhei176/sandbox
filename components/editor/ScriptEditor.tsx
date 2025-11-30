"use client";

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
      <div className="flex items-center gap-1 px-2 py-1 bg-gray-900 border-b border-gray-700 overflow-x-auto">
        {scripts.map((script) => (
          <div
            key={script.id}
            className={`
              flex items-center gap-1 px-3 py-1 text-sm rounded-t transition-colors group
              ${
                script.id === selectedScriptId
                  ? "bg-gray-800 text-white"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600"
              }
            `}
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
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 ml-1"
              title="Delete Script"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={handleAddScript}
          className="px-2 py-1 text-sm bg-green-600 hover:bg-green-700 rounded transition-colors"
          title="Add New Script"
        >
          +
        </button>
      </div>

      {/* Code Editor */}
      <div className="flex-1 overflow-auto">
        {selectedScript ? (
          <CodeEditor
            value={selectedScript.lua_code}
            language="lua"
            placeholder="-- Write your Lua script here"
            onChange={(e) => onScriptUpdate(selectedScript.id, e.target.value)}
            padding={15}
            style={{
              fontSize: 13,
              backgroundColor: "#1f2937",
              fontFamily:
                "ui-monospace, SFMono-Regular, SF Mono, Consolas, Liberation Mono, Menlo, monospace",
              minHeight: "100%",
            }}
            className="w-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Select a script to edit
          </div>
        )}
      </div>

      {/* Script Info Footer */}
      {selectedScript && (
        <div className="px-3 py-1 bg-gray-900 border-t border-gray-700 text-xs text-gray-400">
          Script: {selectedScript.name} ({selectedScript.id})
        </div>
      )}
    </div>
  );
}
