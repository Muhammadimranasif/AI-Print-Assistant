import React, { useState, useEffect, useRef } from 'react';
import { TerminalLog } from '../types';
import { Terminal, Send, Trash2, Cpu } from 'lucide-react';

interface TerminalPanelProps {
  logs: TerminalLog[];
  onClear: () => void;
  onExecuteCommand: (cmd: string) => void;
}

export default function TerminalPanel({ logs, onClear, onExecuteCommand }: TerminalPanelProps) {
  const [command, setCommand] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    onExecuteCommand(command.trim());
    setCommand('');
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-sm">
      {/* Header */}
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-200 font-semibold tracking-wide flex items-center text-xs">
            AIPA-DAEMON://CONSOLE_LOGS
            <span className="ml-2 px-1.5 py-0.5 bg-emerald-950 text-emerald-400 rounded text-[9px] animate-pulse">
              LIVE
            </span>
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={onClear}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-800"
            title="Clear Console Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
          </div>
        </div>
      </div>

      {/* Log Feed */}
      <div className="p-4 h-44 overflow-y-auto space-y-1.5 bg-slate-950/90 text-slate-300 select-all scrollbar-thin scrollbar-thumb-slate-800">
        {logs.map((log) => {
          let textClass = 'text-slate-300';
          let prefix = '[INFO]';
          if (log.type === 'success') {
            textClass = 'text-emerald-400 font-medium';
            prefix = '[SUCCESS]';
          } else if (log.type === 'warning') {
            textClass = 'text-amber-400';
            prefix = '[WARN]';
          } else if (log.type === 'error') {
            textClass = 'text-rose-400 font-semibold';
            prefix = '[ERROR]';
          } else if (log.type === 'input') {
            textClass = 'text-sky-400';
            prefix = 'admin@aipa-pc:~$';
          }

          return (
            <div key={log.id} className="leading-relaxed whitespace-pre-wrap font-mono text-xs flex items-start space-x-2">
              <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
              <span className="shrink-0 select-none opacity-80">{prefix}</span>
              <span className={textClass}>{log.message}</span>
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Input Shell */}
      <form onSubmit={handleSubmit} className="border-t border-slate-800 flex bg-slate-950">
        <div className="pl-4 py-2 text-sky-400 select-none flex items-center space-x-1 shrink-0 font-bold text-xs bg-slate-900/40">
          <Cpu className="w-3.5 h-3.5" />
          <span>aipa:~#</span>
        </div>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder='Type commands like "run_daemon", "status", "test_photo", "help" ...'
          className="flex-1 bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none text-sky-300 placeholder-slate-600 px-3 py-2 text-xs font-mono"
        />
        <button
          type="submit"
          className="bg-slate-900 hover:bg-slate-800 border-l border-slate-800 px-4 py-2 text-sky-400 hover:text-sky-300 transition-colors flex items-center justify-center"
        >
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
}
