import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { getChatResponse } from '../data/chatResponses';
import { useApp } from '../contexts/AppContext';

export default function ChatBot() {
  const { crowdData, vacantRooms } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hey there! 🎓 I'm your SmartCampus AI. I have access to live campus status! Ask me about crowd levels, vacant rooms, or navigation.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing with live context
    setTimeout(() => {
      // Enhanced response logic with live data context
      let contextResponse = getChatResponse(userMessage.text);
      
      // Inject live data if relevant
      if (userMessage.text.toLowerCase().includes('library')) {
        const lib = crowdData.find(z => z.id === 'library');
        if (lib) contextResponse += `\n\n📊 **Live Status**: The library currently has about **${lib.crowd} people**. It's currently ${lib.status}.`;
      }
      
      if (userMessage.text.toLowerCase().includes('canteen')) {
        const can = crowdData.find(z => z.id === 'canteen');
        if (can) contextResponse += `\n\n📊 **Live Status**: The canteen has **${can.crowd} people** right now. It's ${can.status}.`;
      }

      if (userMessage.text.toLowerCase().includes('vacant') || userMessage.text.toLowerCase().includes('empty')) {
        const vacantCount = vacantRooms.filter(r => r.isVacant).length;
        contextResponse += `\n\n📊 **Live Status**: There are currently **${vacantCount} vacant rooms** available across the buildings.`;
      }

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: contextResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "Where is the library?",
    "Any vacant classrooms?",
    "Is the canteen crowded?",
    "Help",
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow group z-50"
        id="chatbot-toggle"
      >
        <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-72' : 'w-96'}`}>
      {/* Header */}
      <div
        className={`glass-strong rounded-t-2xl ${isMinimized ? 'rounded-b-2xl' : ''} border border-glass-border overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent/20 to-blue-500/20 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">SmartCampus AI</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] text-success">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-text-secondary" />
            </button>
            <button
              onClick={() => { setIsOpen(false); setIsMinimized(false); }}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Messages */}
        {!isMinimized && (
          <>
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-primary/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  {msg.type === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.type === 'user'
                        ? 'bg-accent text-white rounded-br-md'
                        : 'glass text-text-primary rounded-bl-md'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <p className={`text-[9px] mt-1 ${msg.type === 'user' ? 'text-blue-200' : 'text-text-muted'}`}>
                      {msg.time}
                    </p>
                  </div>
                  {msg.type === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-surface-light flex items-center justify-center shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 text-text-secondary" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 items-start animate-fade-in">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="glass px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-text-muted rounded-full" style={{ animation: 'typing 1.4s infinite 0s' }} />
                      <span className="w-2 h-2 bg-text-muted rounded-full" style={{ animation: 'typing 1.4s infinite 0.2s' }} />
                      <span className="w-2 h-2 bg-text-muted rounded-full" style={{ animation: 'typing 1.4s infinite 0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-glass-border flex gap-2 overflow-x-auto">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="shrink-0 text-[11px] px-3 py-1.5 rounded-full border border-accent/30 text-accent-light hover:bg-accent/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-glass-border">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-surface/50 text-sm text-text-primary px-4 py-2.5 rounded-xl border border-glass-border focus:outline-none focus:border-accent/50 transition-all placeholder:text-text-muted"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-accent hover:bg-accent-glow disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
