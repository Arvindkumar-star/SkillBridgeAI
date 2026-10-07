import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../../services/api';
import {
  BotMessageSquare,
  Send,
  User,
  Sparkles,
  Zap
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const PROMPT_SUGGESTIONS = [
  'Explain the technical requirements for my target role.',
  'Why is Docker my highest priority gap?',
  'How can I raise my overall readiness score to 85%?',
  'What should I focus on in my roadmap this week?'
];

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      sender: 'assistant',
      text: "Hello! I'm your **AI Career Intelligence Advisor**.\n\nI have complete context of your uploaded resume, target job requirements, readiness calculations, roadmap milestones, and verified skill levels.\n\nAsk me anything about your technical requirements, how to close priority gaps, or interview strategy!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/chat', { query: text.trim() });
      if (res.data?.success) {
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: 'assistant',
          text: res.data.data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue retrieving your career context. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <BotMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>AI Career Intelligence Advisor</span>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-300 text-[10px] font-semibold border border-brand-500/30">
                Grounded Context
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Personalized career guidance grounded in your real resumes, target jobs, and verification tests.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-300 shrink-0 mt-1 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-3xl rounded-2xl text-xs md:text-sm leading-relaxed p-5 shadow-lg ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-medium ml-12'
                  : 'bg-[#101726]/90 border border-slate-800/80 text-slate-200 glass-panel mr-6'
              }`}
            >
              {msg.sender === 'user' ? (
                <div className="whitespace-pre-wrap">{msg.text}</div>
              ) : (
                <div className="prose prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-li:my-1 text-slate-200">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-2.5 leading-relaxed text-slate-200">{children}</p>,
                      strong: ({ children }) => <strong className="font-bold text-brand-300">{children}</strong>,
                      em: ({ children }) => <em className="text-slate-300">{children}</em>,
                      h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2 mt-4">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold text-brand-200 mb-2 mt-3">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-100 mb-1 mt-2">{children}</h3>,
                      ul: ({ children }) => <ul className="space-y-1.5 my-2.5 pl-4 list-disc marker:text-brand-400">{children}</ul>,
                      ol: ({ children }) => <ol className="space-y-1.5 my-2.5 pl-4 list-decimal marker:text-brand-400">{children}</ol>,
                      li: ({ children }) => <li className="text-slate-300">{children}</li>,
                      table: ({ children }) => (
                        <div className="my-4 overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-900/60 shadow-md">
                          <table className="w-full text-left border-collapse text-xs">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-slate-800/90 text-brand-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                          {children}
                        </thead>
                      ),
                      tbody: ({ children }) => (
                        <tbody className="divide-y divide-slate-800">
                          {children}
                        </tbody>
                      ),
                      tr: ({ children }) => (
                        <tr className="hover:bg-slate-800/40 transition-colors">
                          {children}
                        </tr>
                      ),
                      th: ({ children }) => (
                        <th className="py-2.5 px-3.5 font-bold text-slate-200">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="py-2.5 px-3.5 text-slate-300 leading-normal align-top">
                          {children}
                        </td>
                      ),
                      code: ({ children }) => (
                        <code className="px-1.5 py-0.5 rounded bg-slate-800 text-brand-300 font-mono text-[11px] border border-slate-700">
                          {children}
                        </code>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-brand-500 pl-3.5 my-2 italic text-slate-400 bg-brand-950/20 py-1.5 rounded-r">
                          {children}
                        </blockquote>
                      )
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              )}

              <span
                className={`text-[10px] block mt-3 text-right font-mono ${
                  msg.sender === 'user' ? 'text-white/70' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3.5 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-300 shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5 glass-panel">
              <div className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing profile context & formulating insights...</span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Chips & Input Bar */}
      <div className="space-y-3 shrink-0 pt-2">
        <div className="flex flex-wrap gap-2">
          {PROMPT_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(sug)}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-800 hover:border-brand-500/40 transition-all shadow-sm flex items-center gap-1.5"
            >
              <Zap className="w-3 h-3 text-brand-400" />
              <span>{sug}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputQuery);
          }}
          className="flex items-center gap-2.5 relative"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about your readiness, priority gaps, roadmaps, or interview strategy..."
            className="flex-1 px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 text-xs md:text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-slate-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white transition-all disabled:opacity-40 shadow-lg shadow-brand-500/25 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
