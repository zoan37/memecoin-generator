'use client';

import { useState, useEffect } from 'react';
import { Coins, Sparkles, Download, Settings, RefreshCw } from 'lucide-react';

interface MemecoinData {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
}

export default function MemecoinGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [memecoin, setMemecoin] = useState<MemecoinData | null>(null);
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [falAiKey, setFalAiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState('');
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.5-sonnet');

  // Popular OpenRouter models for text generation
  const availableModels = [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'google/gemini-2.0-flash-001', name: 'Google Gemini 2.0 Flash' },
  ];

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedOpenRouterKey = localStorage.getItem('openrouter_api_key');
    const savedFalAiKey = localStorage.getItem('fal_ai_api_key');
    const savedModel = localStorage.getItem('selected_model');
    
    if (savedOpenRouterKey) {
      setOpenRouterKey(savedOpenRouterKey);
    }
    if (savedFalAiKey) {
      setFalAiKey(savedFalAiKey);
    }
    
    // Check if saved model is valid, if not reset to default
    if (savedModel) {
      const validModelIds = availableModels.map(m => m.id);
      if (validModelIds.includes(savedModel)) {
        setSelectedModel(savedModel);
      } else {
        // Clear invalid model from localStorage and use default
        localStorage.setItem('selected_model', 'anthropic/claude-3.5-sonnet');
        setSelectedModel('anthropic/claude-3.5-sonnet');
      }
    }
  }, [availableModels]);

  // Save OpenRouter key to localStorage when it changes
  const handleOpenRouterKeyChange = (key: string) => {
    setOpenRouterKey(key);
    if (key) {
      localStorage.setItem('openrouter_api_key', key);
    } else {
      localStorage.removeItem('openrouter_api_key');
    }
  };

  // Save Fal AI key to localStorage when it changes
  const handleFalAiKeyChange = (key: string) => {
    setFalAiKey(key);
    if (key) {
      localStorage.setItem('fal_ai_api_key', key);
    } else {
      localStorage.removeItem('fal_ai_api_key');
    }
  };

  // Save selected model to localStorage when it changes
  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    localStorage.setItem('selected_model', newModel);
  };

  const generateMemecoin = async () => {
    // Use environment variables as fallback if user hasn't provided keys
    const effectiveOpenRouterKey = openRouterKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    const effectiveFalAiKey = falAiKey || process.env.NEXT_PUBLIC_FAL_API_KEY;

    if (!effectiveOpenRouterKey || !effectiveFalAiKey) {
      alert('API keys are required! Please set your keys in settings or contact the developer.');
      return;
    }

    setIsGenerating(true);
    try {
      // Generate text content using OpenRouter
      const textResponse = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          openRouterKey: effectiveOpenRouterKey, 
          theme,
          model: selectedModel,
          usingDefaultKeys: !openRouterKey || !falAiKey
        }),
      });

      if (!textResponse.ok) {
        throw new Error('Failed to generate text');
      }

      const textData = await textResponse.json();

      // Generate image using Fal AI
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          falAiKey: effectiveFalAiKey,
          prompt: `A cute cartoon mascot for ${textData.name} memecoin: ${textData.description}. Bright colors, fun design, crypto theme.`,
          usingDefaultKeys: !openRouterKey || !falAiKey
        }),
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to generate image');
      }

      const imageData = await imageResponse.json();

      setMemecoin({
        name: textData.name,
        symbol: textData.symbol,
        description: textData.description,
        imageUrl: imageData.imageUrl,
      });
    } catch (error) {
      console.error('Error generating memecoin:', error);
      alert('Failed to generate memecoin. Please try again or check your API keys in settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!memecoin?.imageUrl) return;

    try {
      // Fetch the image as a blob to ensure proper download
      const response = await fetch(memecoin.imageUrl);
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${memecoin.name.replace(/\s+/g, '_')}_memecoin.png`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Append to body, click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: try direct link download
      const link = document.createElement('a');
      link.href = memecoin.imageUrl;
      link.download = `${memecoin.name.replace(/\s+/g, '_')}_memecoin.png`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coins className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-bold text-white">Memecoin Generator</h1>
            <Sparkles className="w-12 h-12 text-pink-400" />
          </div>
          <p className="text-xl text-gray-300">Create the next viral memecoin with AI-powered creativity!</p>
        </div>

        {/* Control Panel */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <div className="mb-6">
            <label className="block text-white text-lg font-medium mb-3">
              Custom Theme (Optional)
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., 'space cats', 'gaming warriors', 'coffee lovers', 'pirates'..."
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <p className="text-sm text-gray-400 mt-2">
              💡 Describe a theme to influence the memecoin concept
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              {showSettings ? 'Hide Settings' : 'Show Settings'}
            </button>
            
            <button
              onClick={generateMemecoin}
              disabled={isGenerating}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate Memecoin
                </>
              )}
            </button>
          </div>

          {/* API Key Status Info */}
          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
            <div className="text-sm text-blue-200">
              {openRouterKey && falAiKey ? (
                <span>✅ Using your personal API keys</span>
              ) : (
                <span>
                  🔑 Using default API keys (may run out of credits) • 
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="underline hover:text-blue-100 ml-1"
                  >
                    Add your own keys
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Configuration
            </h2>
            
            <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
              <div className="text-sm text-yellow-200">
                💡 <strong>Don&apos;t have API keys?</strong> No problem! The app uses default keys, but they may run out of credits. 
                For unlimited usage, get your own free keys:
                <br />
                • <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-100">OpenRouter</a> (for text generation)
                <br />
                • <a href="https://fal.ai/" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-100">Fal AI</a> (for image generation)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  OpenRouter API Key (Optional)
                </label>
                <input
                  type="password"
                  value={openRouterKey}
                  onChange={(e) => handleOpenRouterKeyChange(e.target.value)}
                  placeholder="Enter your OpenRouter API key (optional)"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Fal AI API Key (Optional)
                </label>
                <input
                  type="password"
                  value={falAiKey}
                  onChange={(e) => handleFalAiKeyChange(e.target.value)}
                  placeholder="Enter your Fal AI API key (optional)"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* AI Model Selection */}
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                AI Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer"
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id} className="bg-gray-800 text-white">
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-400">
              💾 Settings are automatically saved and will persist when you refresh the page.
            </div>
          </div>
        )}

        {/* Generated Memecoin Display */}
        {memecoin && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image */}
              <div className="space-y-4">
                <div className="aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/20">
                  <img
                    src={memecoin.imageUrl}
                    alt={memecoin.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={downloadImage}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Image
                </button>
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">{memecoin.name}</h3>
                  <div className="inline-block px-4 py-2 bg-yellow-500 text-black rounded-full font-bold text-lg">
                    ${memecoin.symbol}
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-white mb-3">Description</h4>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {memecoin.description}
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-3">Token Details</h4>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span className="font-medium text-white">{memecoin.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Symbol:</span>
                      <span className="font-medium text-yellow-400">${memecoin.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium text-pink-400">Memecoin</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
