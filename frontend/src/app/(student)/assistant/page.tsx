'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { ChatMessage } from '@/types/ai';
import { AIService } from '@/services/api/aiService';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    content:
      'Hello! I am your ProjectMind AI Assistant. I can help you choose project ideas, design system architecture, select tech stacks, prepare for Viva & defense exams, or structure technical documentation. What project topic would you like to explore today?',
    timestamp: '10:00 AM',
  },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTIONS = [
    'Suggest high-impact AI & Machine Learning project ideas',
    'How to design a microservice architecture with Express & FastAPI?',
    'What dataset should I use for code vulnerability detection?',
    'Generate top 5 technical defense questions for a React & Node.js project',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const assistantMsg = await AIService.sendMessageToAssistant(prompt);
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content: 'An error occurred while processing your query. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full h-[calc(100vh-2rem)] flex flex-col space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EBE6DF] pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7A263A]/10 border border-[#7A263A]/20 flex items-center justify-center text-[#7A263A]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#202020] tracking-tight flex items-center gap-2">
              AI Project Assistant
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#7A263A]/10 text-[#7A263A] border border-[#7A263A]/20">
                Intent Guard Active
              </span>
            </h1>
            <p className="text-xs text-[#666666]">
              Ask technical questions, discuss architecture design, or request project guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 shrink-0 no-scrollbar">
        {SUGGESTIONS.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sug)}
            className="shrink-0 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F6F2EB] border border-[#EBE6DF] text-xs text-[#202020] font-medium transition-all hover:border-[#7A263A]/40 shadow-xs"
          >
            💡 {sug}
          </button>
        ))}
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-5 rounded-2xl bg-white border border-[#EBE6DF] space-y-5 shadow-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-[#7A263A] text-white'
                  : msg.isOffTopic
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-[#7A263A]/10 text-[#7A263A] border border-[#7A263A]/20'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Content Bubble */}
            <div className="space-y-1">
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#7A263A] text-white shadow-xs'
                    : msg.isOffTopic
                    ? 'bg-amber-50 border border-amber-300 text-amber-950'
                    : 'bg-[#F6F2EB] border border-[#EBE6DF] text-[#202020]'
                }`}
              >
                {msg.isOffTopic && (
                  <div className="flex items-center gap-1.5 font-semibold text-amber-800 text-xs mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Off-Topic Query Detected</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Intent Classification Metadata Badge */}
                {msg.intentClassification && (
                  <div className="mt-3 pt-2.5 border-t border-[#EAE6DF] flex items-center gap-2 text-[10px] text-[#777777] font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#7A263A]" />
                    <span>Intent: {msg.intentClassification.intent}</span>
                    <span>•</span>
                    <span>Confidence: {(msg.intentClassification.confidence * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#888888] px-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#7A263A]/10 text-[#7A263A] flex items-center justify-center border border-[#7A263A]/20">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#7A263A] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#7A263A] animate-bounce delay-100" />
              <span className="w-2 h-2 rounded-full bg-[#7A263A] animate-bounce delay-200" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
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
          placeholder="Ask a project query or technical architecture question..."
          className="flex-1 bg-white border border-[#EBE6DF] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#202020] placeholder-[#888888] focus:outline-none focus:border-[#7A263A] shadow-xs transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="px-5 py-3 rounded-xl bg-[#7A263A] hover:bg-[#661F30] text-white font-semibold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-xs"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
