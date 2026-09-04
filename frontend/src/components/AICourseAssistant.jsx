import React, { useState } from 'react';
import { Sparkles, Send, Bot, Check, Copy, AlertCircle, X, BookOpen, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AICourseAssistant = ({ isOpen, onClose, onApplySyllabus }) => {
  const { token } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('syllabus');
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setError('');
    setLoading(true);
    setAiData(null);

    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, type })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'AI generation failed');
      }

      setAiData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (aiData && onApplySyllabus) {
      onApplySyllabus(aiData);
      onClose();
    }
  };

  const handleCopy = () => {
    if (aiData) {
      const text = `${aiData.title}\n\n${aiData.summary}\n\nKey Highlights:\n${aiData.keyPoints?.join('\n')}\n\nLessons:\n${aiData.suggestedLessons?.join('\n')}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-indigo-100 relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-xl shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">EduCore AI Course Copilot</h2>
              <p className="text-xs text-gray-500">Powered by Server-Side Google Gemini AI Microservice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Course Topic or Prompt
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Next.js 14 App Router and TypeScript Mastery"
                className="w-full pl-4 pr-24 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="absolute right-2 top-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow transition flex items-center space-x-1 disabled:opacity-50"
              >
                {loading ? (
                  <span>Generating...</span>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-gray-500 font-semibold">Preset Type:</span>
            <button
              type="button"
              onClick={() => setType('syllabus')}
              className={`px-3 py-1 rounded-full font-medium transition ${
                type === 'syllabus' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Full Course Syllabus
            </button>
            <button
              type="button"
              onClick={() => setType('description')}
              className={`px-3 py-1 rounded-full font-medium transition ${
                type === 'description' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Course Summary
            </button>
          </div>
        </form>

        {/* AI Output Display */}
        {loading ? (
          <div className="text-center py-12 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <Bot className="h-10 w-10 text-indigo-600 animate-bounce mx-auto mb-3" />
            <div className="text-sm font-bold text-gray-800">Synthesizing AI Response...</div>
            <div className="text-xs text-gray-500 mt-1">Executing Gemini LLM prompt via secure Express route</div>
          </div>
        ) : aiData ? (
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-inner space-y-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border border-indigo-400/30">
                  AI Output Ready
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{aiData.title}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition text-xs flex items-center space-x-1"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{aiData.summary}</p>

            {aiData.keyPoints && (
              <div>
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Key Highlights</div>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {aiData.keyPoints.map((kp, idx) => (
                    <li key={idx}>{kp}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiData.suggestedLessons && (
              <div>
                <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Suggested Modules</div>
                <div className="space-y-1">
                  {aiData.suggestedLessons.map((les, idx) => (
                    <div key={idx} className="bg-slate-800/80 px-3 py-1.5 rounded text-xs font-mono text-slate-200">
                      {les}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {onApplySyllabus && (
              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleApply}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition flex items-center space-x-1"
                >
                  <Check className="h-4 w-4" />
                  <span>Apply AI Text to Course Form</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <Lightbulb className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-gray-600">Enter a prompt above to auto-generate course content</div>
            <div className="text-[11px] text-gray-400 mt-1">Example: "Python Data Science and Pandas for Beginners"</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AICourseAssistant;
