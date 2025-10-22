import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Upload, TrendingUp, Sparkles, Copy, Check } from 'lucide-react';

function TypingLoader() {
  return (
    <span className="animate-pulse">
      Thinking<span className="dots">.</span>
      <style>{`
        .dots::after {
          content: '';
          animation: dots 1.5s steps(4, end) infinite;
        }
        @keyframes dots {
          0% { content: ''; }
          25% { content: '.'; }
          50% { content: '..'; }
          75% { content: '...'; }
          100% { content: ''; }
        }
      `}</style>
    </span>
  );
}

export default function SugarBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('to-the-point');
  const [isLoading, setIsLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [abortController, setAbortController] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setFileUploaded(true);
        setMetadata(data.metadata);
        const welcomeMsg = `✅ Data Loaded Successfully!\n\nRecords: ${data.row_count}\nCommodities: ${data.metadata.unique_commodities}\nSuppliers: ${data.metadata.unique_suppliers}\nTotal Spend: $${data.metadata.total_spend.toLocaleString()}\n\nAsk questions like:\n• What's the total spend?\n• Show top suppliers\n• Give a summary`;
        setMessages([{ type: 'system', content: welcomeMsg, timestamp: new Date().toISOString() }]);
      } else {
        alert(`Upload failed: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Upload error: ${error.message}`);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleSendMessage = async (includeInference = false) => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message and loader assistant message
    const userMessage = { type: 'user', content: inputValue, timestamp: new Date().toISOString() };
    const loaderMessage = { type: 'assistant', content: <TypingLoader />, isLoader: true, timestamp: new Date().toISOString() };

    setMessages(prev => [...prev, userMessage, loaderMessage]);

    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const recentMessages = messages
        .filter(msg => msg.type === 'user' || msg.type === 'assistant')
        .slice(-5)
        .map(msg => ({ role: msg.type === 'user' ? 'user' : 'assistant', content: typeof msg.content === 'string' ? msg.content : '' }));
      recentMessages.push({ role: 'user', content: currentInput });

      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          mode: includeInference ? 'inference' : mode,
          context: recentMessages
        }),
        signal: controller.signal
      });
      const data = await res.json();

      // Remove loader and add actual assistant response
      setMessages(prev => [
        ...prev.filter(msg => !msg.isLoader),
        { type: 'assistant', content: data.response, timestamp: data.timestamp }
      ]);
    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages(prev => [...prev.filter(msg => !msg.isLoader), { type: 'system', content: '⛌ Generation stopped by user.', timestamp: new Date().toISOString() }]);
      } else {
        setMessages(prev => [...prev.filter(msg => !msg.isLoader), { type: 'error', content: `⛌ Connection Error: ${err.message}`, timestamp: new Date().toISOString() }]);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(false);
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="fixed bottom-2 right-2 z-50 sm:bottom-6 sm:right-6">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#11224E] p-3 rounded-full shadow-lg hover:scale-110 transition-transform sm:p-4"
          aria-label="Open chatbot"
        >
          <MessageCircle size={28} color="white" />
        </button>
      )}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl
                        fixed bottom-2 right-2 w-[96vw] h-[65vh] max-w-sm
                        sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[650px] sm:max-w-full
                        flex flex-col overflow-hidden border border-gray-200">
          <div className="bg-[#11224E] text-white p-3 flex justify-between items-center rounded-t-3xl">
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <h3 className="font-bold text-base sm:text-lg">SugarBot</h3>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Close chatbot">
              <X size={20} />
            </button>
          </div>
          {fileUploaded && (
            <div className="flex gap-2 p-2 text-xs sm:text-sm">
              <button
                onClick={() => setMode('to-the-point')}
                className={`flex-1 py-2 rounded-lg ${mode === 'to-the-point' ? 'bg-[#F87B1B] text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Quick
              </button>
              <button
                onClick={() => setMode('detailed')}
                className={`flex-1 py-2 rounded-lg ${mode === 'detailed' ? 'bg-[#CBD99B] text-black' : 'bg-gray-200 text-gray-700'}`}
              >
                Detailed
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-3 text-xs sm:text-sm space-y-3 bg-gray-50">
            {!fileUploaded && (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Upload size={40} className="text-[#F87B1B]" />
                <p className="text-gray-700 text-center">Upload Excel to start analyzing</p>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="bg-[#F87B1B] text-white px-4 py-2 rounded-lg">
                  {isLoading ? 'Processing...' : 'Upload File'}
                </button>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 sm:p-3 rounded-xl ${msg.type === 'user' ? 'bg-[#2e3c61] text-white' : 'bg-[#ddd9d9] text-gray-800 border border-gray-200'}`}>
                  {typeof msg.content === 'string' ? msg.content : msg.content}
                  {msg.type === 'assistant' && !msg.isLoader && (
                    <button onClick={() => copyToClipboard(msg.content, idx)} className="text-xs text-[#F87B1B] mt-1 flex items-center gap-1">
                      {copiedIndex === idx ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy</>)}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {fileUploaded && (
            <div className="p-3 border-t border-gray-200 bg-white flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(false); } }}
                  placeholder="Ask anything..."
                  className="flex-1 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F87B1B] focus:border-transparent"
                  disabled={isLoading}
                />
                {isLoading ? (
                  <button
                    onClick={handleStopGeneration}
                    className="bg-[#11224E] text-white p-2 rounded-xl flex items-center justify-center"
                    title="Stop generation"
                  >
                    ⬜
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendMessage(false)}
                    disabled={!inputValue.trim()}
                    className="bg-[#11224E] text-white p-2 rounded-xl"
                    title="Send message"
                  >
                    <Send size={20} />
                  </button>
                )}
              </div>
              <button
                onClick={() => handleSendMessage(true)}
                disabled={isLoading || !inputValue.trim()}
                className="bg-[#CBD99B] text-black py-2 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <TrendingUp size={18} /> Get Deep Insights
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
