import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageCircle, X, Send, Mic, Loader2, Volume2, VolumeX, StopCircle } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { language, t } = useLanguage();

  // Initialize Speech Recognition (Memoized to prevent recreation on re-renders)
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = useMemo(() => SpeechRecognition ? new SpeechRecognition() : null, [SpeechRecognition]);

  // Reset welcome message when language changes
  useEffect(() => {
    let welcome = 'Namaste! I am your Krishi Sakhi AI assistant. How can I help you today?';
    if (language === 'hi') welcome = 'नमस्ते! मैं आपका कृषि सखी एआई सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?';
    if (language === 'mr') welcome = 'नमस्कार! मी तुमचा कृषी सखी एआय सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो?';

    setMessages([{ role: 'model', text: welcome }]);
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Stop speech when closed
  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      if (isListening && recognition) {
        recognition.stop();
        setIsListening(false);
      }
    }
  }, [isOpen, isListening, recognition]);

  const speakText = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map app language code to BCP 47 tag
    const langMap: Record<string, string> = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'mr': 'mr-IN'
    };
    utterance.lang = langMap[language] || 'en-IN';
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // Stop listening if active
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }

    const userMsg: ChatMessage = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const history = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`);
    const responseText = await getChatResponse(history, userMsg.text, language);

    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
    
    speakText(responseText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const toggleListening = () => {
    if (!recognition) {
        alert("Voice input is not supported in your browser.");
        return;
    }

    if (isListening) {
        recognition.stop();
        setIsListening(false);
    } else {
        // Set recognition language
        const langMap: Record<string, string> = {
            'en': 'en-US', // Use US/IN for English input
            'hi': 'hi-IN',
            'mr': 'mr-IN'
        };
        recognition.lang = langMap[language] || 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript);
        };
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            if (event.error === 'network') {
                alert("Network error: Voice input requires an active internet connection.");
            }
        };

        try {
            recognition.start();
        } catch (error) {
            console.error("Failed to start recognition:", error);
            setIsListening(false);
        }
    }
  };

  const toggleMute = () => {
    if (!isMuted) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 max-w-[90vw] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden animate-fade-in-up">
          <div className="bg-green-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
               <div className="bg-white/20 p-1.5 rounded-full">
                  <MessageCircle size={20} />
               </div>
               <div>
                   <h3 className="font-bold text-sm">{t.assistant_title}</h3>
                   <span className="text-xs text-green-100 flex items-center gap-1">
                     <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span> {t.online}
                   </span>
               </div>
            </div>
            <div className="flex items-center gap-1">
                <button onClick={toggleMute} className="hover:bg-green-700 p-1.5 rounded transition-colors" title={isMuted ? "Unmute TTS" : "Mute TTS"}>
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:bg-green-700 p-1 rounded transition-colors">
                  <X size={20} />
                </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
                    msg.role === 'user' 
                      ? 'bg-green-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                  {msg.role === 'model' && !isMuted && idx === messages.length - 1 && isSpeaking && (
                      <div className="absolute -top-1 -right-1">
                          <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                      </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="animate-spin text-green-600" size={16} />
                  <span className="text-xs text-gray-500">{t.ai_thinking}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <button 
                onClick={toggleListening}
                className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'}`}
                title="Voice Input"
            >
                {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isListening ? "Listening..." : t.chat_placeholder}
              className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none text-sm text-gray-900"
              disabled={isListening}
            />
            <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50 hover:scale-110 active:scale-95 group"
        >
          <MessageCircle size={28} className="group-hover:animate-bounce" />
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">1</span>
        </button>
      )}
    </>
  );
};

export default ChatWidget;