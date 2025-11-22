'use client';

import { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import type { ScriptDefinition } from '@/lib/types/gamespec';

interface ScriptEditorProps {
  scripts: ScriptDefinition[];
  selectedScriptId: string | null;
  onScriptSelect: (scriptId: string) => void;
  onScriptUpdate: (scriptId: string, code: string) => void;
}

export function ScriptEditor({
  scripts,
  selectedScriptId,
  onScriptSelect,
  onScriptUpdate,
}: ScriptEditorProps) {
  const selectedScript = scripts.find((s) => s.id === selectedScriptId);

  return (
    <div className="h-full flex flex-col">
      {/* Script Tabs */}
      <div className="flex items-center gap-1 px-2 py-1 bg-gray-900 border-b border-gray-700 overflow-x-auto">
        {scripts.map((script) => (
          <button
            key={script.id}
            onClick={() => onScriptSelect(script.id)}
            className={`
              px-3 py-1 text-sm rounded-t transition-colors
              ${
                script.id === selectedScriptId
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }
            `}
          >
            {script.name}
          </button>
        ))}
      </div>

      {/* Code Editor */}
      <div className="flex-1 overflow-hidden">
        {selectedScript ? (
          <CodeEditor
            value={selectedScript.lua_code}
            language="lua"
            placeholder="-- Write your Lua script here"
            onChange={(e) => onScriptUpdate(selectedScript.id, e.target.value)}
            padding={15}
            style={{
              fontSize: 13,
              backgroundColor: '#1f2937',
              fontFamily:
                'ui-monospace, SFMono-Regular, SF Mono, Consolas, Liberation Mono, Menlo, monospace',
              height: '100%',
              overflow: 'auto',
            }}
            className="w-full h-full"
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
