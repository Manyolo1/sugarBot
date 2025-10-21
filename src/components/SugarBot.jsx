import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Upload, TrendingUp, Sparkles, Copy, Check } from 'lucide-react';

export default function AIChatbot() {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Handle Excel Upload
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

    const userMessage = { type: 'user', content: inputValue, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    const recentMessages = messages
      .filter(msg => msg.type === 'user' || msg.type === 'assistant')
      .slice(-5)
      .map(msg => ({ role: msg.type === 'user' ? 'user' : 'assistant', content: msg.content }));

    recentMessages.push({ role: 'user', content: currentInput });

    try {
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

      setMessages(prev => [...prev, { type: 'assistant', content: data.response, timestamp: data.timestamp }]);
    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages(prev => [...prev, { type: 'system', content: '⛌ Generation stopped by user.', timestamp: new Date().toISOString() }]);
      } else {
        setMessages(prev => [...prev, { type: 'error', content: `⛌ Connection Error: ${err.message}`, timestamp: new Date().toISOString() }]);
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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chatbot Toggle */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="bg-[#11224E] p-4 rounded-full shadow-lg hover:scale-110 transition-transform">
          <MessageCircle size={28} color="white" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[420px] h-[650px] flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-[#11224E] text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Sparkles size={20} />
              <h3 className="font-bold">SugarBot</h3>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>

          {/* Mode Toggle */}
          {fileUploaded && (
            <div className="flex gap-2 p-2">
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {!fileUploaded && (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Upload size={48} className="text-[#F87B1B]" />
                <p className="text-gray-700 text-center">Upload Excel to start analyzing</p>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="bg-[#F87B1B] text-white px-6 py-3 rounded-lg">{isLoading ? 'Processing...' : 'Upload File'}</button>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl ${msg.type === 'user' ? 'bg-[#2e3c61] text-white' : 'bg-[#ddd9d9] text-gray-800 border border-gray-200'}`}>
                  {msg.content}
                  {msg.type === 'assistant' && (
                    <button onClick={() => copyToClipboard(msg.content, idx)} className="text-xs text-[#F87B1B] mt-2 flex items-center gap-1">
                      {copiedIndex === idx ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy</>)}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {fileUploaded && (
            <div className="p-4 border-t border-gray-200 bg-white flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything..."
                  className="flex-1 px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F87B1B] focus:border-transparent"
                  disabled={isLoading}
                />
                {isLoading ? (
                  <button onClick={handleStopGeneration} className="bg-[#11224E] text-white p-3 rounded-xl flex items-center justify-center " title="Stop generation">
                    ⬜
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendMessage(false)}
                    disabled={!inputValue.trim()}
                    className="bg-[#11224E] text-white p-3 rounded-xl"
                    title="Send message"
                  >
                    <Send size={20} />
                  </button>
                )}
              </div>
              <button onClick={() => handleSendMessage(true)} disabled={isLoading || !inputValue.trim()} className="bg-[#CBD99B]  text-black py-2 rounded-xl flex items-center justify-center gap-2">
                <TrendingUp size={18} /> Get Deep Insights
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
