'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import {
  Bot,
  Send,
  User,
  Sparkles,
  ShieldCheck,
  Code2,
  HelpCircle,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ChatMessage } from '@/types/ai';
import { AIService } from '@/services/api/aiService';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    content:
      '👋 Hello! I am your **ProjectMind AI Mentor**. I am here to help you brainstorm creative engineering projects, architect 3-tier microservices, choose optimal tech stacks, find benchmark datasets, and rehearse for your professor viva examinations.\n\nWhat domain or project concept would you like to explore today?',
    timestamp: '10:00 AM',
    intentClassification: {
      intent: 'conversational',
      confidence: 0.99,
      explanation: 'Assistant initial welcome greeting.',
    },
    suggestedActions: [
      'Suggest top 3 high-impact AI project ideas for 2026',
      'Explain how to design an event-driven architecture with Express & FastAPI',
      'What are the top examiner viva defense questions for my project?',
      'Recommend benchmark healthcare datasets for disease classification',
    ],
  },
];

export default function AssistantPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>(
    INITIAL_MESSAGES[0].suggestedActions || []
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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

    // Multi-turn conversation history
    const historyPayload = messages.map((m) => ({
      sender: m.sender,
      content: m.content,
    }));

    try {
      const token = await getToken();
      const assistantMsg = await AIService.sendMessageToAssistant(
        prompt,
        undefined,
        historyPayload,
        token,
        user?.id
      );
      setMessages((prev) => [...prev, assistantMsg]);
      if (assistantMsg.suggestedActions && assistantMsg.suggestedActions.length > 0) {
        setCurrentSuggestions(assistantMsg.suggestedActions);
      }
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

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto w-full h-[calc(100vh-2rem)] flex flex-col space-y-4 font-sans">
      {/* Assistant Header */}
      <div className="flex items-center justify-between border-b border-[#EBE6DF] pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7A263A] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-[#202020] tracking-tight flex items-center gap-2">
              AI Project Mentor & Assistant
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                ● Live Gemini 2.5 Flash
              </span>
            </h1>
            <p className="text-xs text-[#666666]">
              Brainstorm ideas, ask architecture questions, explore datasets, and practice viva defense.
            </p>
          </div>
        </div>
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
              <span className="text-[10px] text-[#888888] px-1 font-mono">{msg.timestamp}</span>
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
  );
}
