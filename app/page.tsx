'use client';

import { useState } from 'react';
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

  const generateMemecoin = async () => {
    if (!openRouterKey || !falAiKey) {
      alert('Please set your API keys in settings first!');
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
        body: JSON.stringify({ openRouterKey }),
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
          falAiKey,
          prompt: `A cute cartoon mascot for ${textData.name} memecoin: ${textData.description}. Bright colors, fun design, crypto theme.`,
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
      alert('Failed to generate memecoin. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (memecoin?.imageUrl) {
      const link = document.createElement('a');
      link.href = memecoin.imageUrl;
      link.download = `${memecoin.name.replace(/\s+/g, '_')}_memecoin.png`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
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

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              API Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  OpenRouter API Key
                </label>
                <input
                  type="password"
                  value={openRouterKey}
                  onChange={(e) => setOpenRouterKey(e.target.value)}
                  placeholder="Enter your OpenRouter API key"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Fal AI API Key
                </label>
                <input
                  type="password"
                  value={falAiKey}
                  onChange={(e) => setFalAiKey(e.target.value)}
                  placeholder="Enter your Fal AI API key"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
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
        </div>

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

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p>Powered by OpenRouter AI & Fal AI • Made with ❤️ for the meme economy</p>
        </div>
      </div>
    </div>
  );
}
