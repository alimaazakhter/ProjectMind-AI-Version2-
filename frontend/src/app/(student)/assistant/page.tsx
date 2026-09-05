'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import {
  Bot,
  Send,
  User,
  Sparkles,
  ShieldCheck,
  Plus,
  MessageSquare,
  History as HistoryIcon,
  X,
} from 'lucide-react';
import { ChatMessage } from '@/types/ai';
import { AIService, ChatSessionSummary, StoredChatMessage } from '@/services/api/aiService';

const WELCOME_SUGGESTIONS = [
  'Suggest top 3 high-impact AI project ideas for 2026',
  'Explain how to design an event-driven architecture with Express & FastAPI',
  'What are the top examiner viva defense questions for my project?',
  'Recommend benchmark healthcare datasets for disease classification',
];

const buildWelcomeMessage = (): ChatMessage => ({
  id: 'msg-welcome',
  sender: 'assistant',
  content:
    '👋 Hello! I am your **ProjectMind AI Mentor**. I am here to help you brainstorm creative engineering projects, architect 3-tier microservices, choose optimal tech stacks, find benchmark datasets, and rehearse for your professor viva examinations.\n\nWhat domain or project concept would you like to explore today?',
  timestamp: '',
  intentClassification: {
    intent: 'conversational',
    confidence: 0.99,
    explanation: 'Assistant initial welcome greeting.',
  },
  suggestedActions: WELCOME_SUGGESTIONS,
});

const storedToChatMessage = (m: StoredChatMessage): ChatMessage => ({
  id: m.id,
  sender: m.sender,
  content: m.content,
  timestamp: m.created_at
    ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '',
  intentClassification: m.intent
    ? {
        intent: m.intent,
        confidence: typeof m.confidence === 'number' ? m.confidence : 0.9,
        explanation: `Classified as "${m.intent}"`,
      }
    : undefined,
});

export default function AssistantPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([buildWelcomeMessage()]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>(WELCOME_SUGGESTIONS);

  // Chat history state
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false); // mobile overlay

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadSessions = useCallback(async () => {
    try {
      const token = await getToken();
      const data = await AIService.getChatSessions(token);
      setSessions(data);
    } catch (err) {
      console.warn('Could not load chat history:', err);
    }
  }, [getToken]);

  // Load the user's conversation history once they are authenticated.
  useEffect(() => {
    if (user) loadSessions();
  }, [user, loadSessions]);

  const startNewChat = () => {
    setMessages([buildWelcomeMessage()]);
    setCurrentSessionId(null);
    setCurrentSuggestions(WELCOME_SUGGESTIONS);
    setInput('');
    setHistoryOpen(false);
  };

  const openSession = async (sessionId: string) => {
    if (sessionId === currentSessionId) {
      setHistoryOpen(false);
      return;
    }
    setLoadingConversation(true);
    setHistoryOpen(false);
    try {
      const token = await getToken();
      const stored = await AIService.getChatSessionMessages(sessionId, token);
      const mapped = stored.map(storedToChatMessage);
      setMessages(mapped.length > 0 ? mapped : [buildWelcomeMessage()]);
      setCurrentSessionId(sessionId);
      setCurrentSuggestions([]);
    } catch (err) {
      console.error('Failed to open conversation:', err);
    } finally {
      setLoadingConversation(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Multi-turn conversation history (exclude the synthetic welcome bubble).
    const historyPayload = messages
      .filter((m) => m.id !== 'msg-welcome')
      .map((m) => ({ sender: m.sender, content: m.content }));

    try {
      const token = await getToken();
      const assistantMsg = await AIService.sendMessageToAssistant(
        prompt,
        undefined,
        historyPayload,
        token,
        user?.id,
        currentSessionId
      );
      setMessages((prev) => [...prev, assistantMsg]);
      if (assistantMsg.suggestedActions && assistantMsg.suggestedActions.length > 0) {
        setCurrentSuggestions(assistantMsg.suggestedActions);
      }
      // Capture the (possibly new) session id and refresh the history list.
      const newSessionId = assistantMsg.session_id || null;
      if (newSessionId && newSessionId !== currentSessionId) {
        setCurrentSessionId(newSessionId);
      }
      loadSessions();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content: 'An error occurred while connecting to the AI assistant. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const relativeTime = (iso: string) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
  };

  // Reusable history panel (rendered both as desktop column and mobile overlay)
  const HistoryPanel = (
    <div className="flex flex-col h-full">
      <button
        onClick={startNewChat}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#7A263A] hover:bg-[#661F30] text-white font-bold text-xs shadow-xs transition-all shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>New Chat</span>
      </button>

      <div className="mt-3 mb-1.5 px-1 flex items-center gap-1.5 text-[10px] font-bold text-[#888888] uppercase tracking-wider font-mono shrink-0">
        <HistoryIcon className="w-3 h-3" />
        <span>Chat History</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1 no-scrollbar">
        {sessions.length === 0 ? (
          <p className="text-[11px] text-[#999999] px-1 py-3 leading-relaxed">
            No conversations yet. Start chatting and your history will appear here.
          </p>
        ) : (
          sessions.map((s) => {
            const isActive = s.id === currentSessionId;
            return (
              <button
                key={s.id}
                onClick={() => openSession(s.id)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all group ${
                  isActive
                    ? 'bg-[#7A263A]/10 border-[#7A263A]/30'
                    : 'bg-white border-[#EBE6DF] hover:border-[#7A263A]/30 hover:bg-[#F6F2EB]'
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare
                    className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isActive ? 'text-[#7A263A]' : 'text-[#999999]'}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-bold truncate ${isActive ? 'text-[#7A263A]' : 'text-[#202020]'}`}>
                      {s.title}
                    </p>
                    <p className="text-[10px] text-[#999999] truncate mt-0.5">{s.last_message || '—'}</p>
                    <p className="text-[9px] text-[#AAAAAA] font-mono mt-0.5">
                      {relativeTime(s.updated_at)} · {s.message_count} msgs
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full h-[calc(100vh-2rem)] flex gap-4 font-sans">
      {/* Desktop history sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#FAF8F5] border border-[#EBE6DF] rounded-2xl p-3 shadow-xs">
        {HistoryPanel}
      </aside>

      {/* Mobile history overlay */}
      {historyOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setHistoryOpen(false)} />
          <div className="relative w-72 max-w-[80%] bg-[#FAF8F5] border-r border-[#EBE6DF] p-3 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <span className="text-xs font-black text-[#202020]">Conversations</span>
              <button onClick={() => setHistoryOpen(false)} className="p-1 rounded-lg hover:bg-[#EBE6DF] text-[#666666]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0">{HistoryPanel}</div>
          </div>
        </div>
      )}

      {/* Chat column */}
      <div className="flex-1 flex flex-col space-y-4 min-w-0">
        {/* Assistant Header */}
        <div className="flex items-center justify-between border-b border-[#EBE6DF] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setHistoryOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#666666] hover:bg-[#EBE6DF] shrink-0"
              aria-label="Open chat history"
            >
              <HistoryIcon className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-[#7A263A] text-white flex items-center justify-center shadow-xs shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-[#202020] tracking-tight">
                AI Project Mentor & Assistant
              </h1>
              <p className="text-xs text-[#666666]">
                Brainstorm ideas, ask architecture questions, explore datasets, and practice viva defense.
              </p>
            </div>
          </div>
          <button
            onClick={startNewChat}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#EBE6DF] text-[#7A263A] font-bold text-xs hover:bg-[#F6F2EB] shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Dynamic Suggestion Chips */}
        {currentSuggestions.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 shrink-0 no-scrollbar">
            <span className="text-[11px] font-bold text-[#7A263A] uppercase tracking-wider shrink-0 font-mono">
              Suggested:
            </span>
            {currentSuggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug)}
                className="shrink-0 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F6F2EB] border border-[#EBE6DF] text-xs text-[#202020] font-medium transition-all hover:border-[#7A263A]/40 shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-[#7A263A]" />
                <span>{sug}</span>
              </button>
            ))}
          </div>
        )}

        {/* Chat Messages Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-2xl bg-white border border-[#EBE6DF] space-y-5 shadow-xs">
          {loadingConversation && (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-[#7A263A] font-semibold font-mono">
              <span className="w-4 h-4 rounded-full border-2 border-[#7A263A] border-t-transparent animate-spin" />
              Loading conversation...
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-[#7A263A] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#7A263A] border border-[#EBE6DF]'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Content Bubble */}
              <div className="space-y-1 max-w-[88%] sm:max-w-[80%]">
                <div
                  className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#7A263A] text-white shadow-xs font-medium rounded-tr-sm'
                      : 'bg-[#F6F2EB] border border-[#EBE6DF] text-[#202020] rounded-tl-sm shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap space-y-2">{msg.content}</div>

                  {/* Intent Telemetry Badge */}
                  {msg.intentClassification && msg.sender === 'assistant' && (
                    <div className="mt-3 pt-2.5 border-t border-[#EAE6DF] flex items-center gap-2 text-[10px] text-[#777777] font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#7A263A]" />
                      <span>Focus: {msg.intentClassification.intent}</span>
                      <span>•</span>
                      <span>Confidence: {(msg.intentClassification.confidence * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>
                {msg.timestamp && (
                  <span className="text-[10px] text-[#888888] px-1 font-mono">{msg.timestamp}</span>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] text-[#7A263A] border border-[#EBE6DF] flex items-center justify-center">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7A263A] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#7A263A] animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-[#7A263A] animate-bounce delay-200" />
                <span className="text-xs text-[#7A263A] font-semibold pl-1">AI Mentor thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Message Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2.5 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything (e.g. 'Suggest healthcare AI projects', 'How to prepare for viva?', 'Write FastAPI code')..."
            className="flex-1 bg-white border border-[#EBE6DF] rounded-xl px-4 py-3.5 text-xs sm:text-sm text-[#202020] placeholder-[#888888] focus:outline-none focus:border-[#7A263A] shadow-xs transition-colors font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-6 py-3.5 rounded-xl bg-[#7A263A] hover:bg-[#661F30] text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center gap-2 shadow-xs"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
