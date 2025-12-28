import React, { useState } from 'react';
import { AlertCircle, Image, FileText, Zap, CheckCircle, XCircle, Upload, Loader2 } from 'lucide-react';

const DisasterClassifier = () => {
  const [mode, setMode] = useState('both');
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Mock results
    const mockResults = {
      textLabel: mode === 'image' ? null : Math.random() > 0.5 ? 'Informative' : 'Not Informative',
      imageLabel: mode === 'text' ? null : Math.random() > 0.5 ? 'Informative' : 'Not Informative',
    };
    
    const finalLabel = (mockResults.textLabel === 'Informative' || mockResults.imageLabel === 'Informative') 
      ? 'Informative' 
      : 'Not Informative';
    
    setResults({
      ...mockResults,
      finalLabel
    });
    
    setIsProcessing(false);
  };

  const handleReset = () => {
    setText('');
    setImageFile(null);
    setImagePreview(null);
    setResults(null);
  };

  const ResultBadge = ({ label, type }) => {
    const isInformative = label === 'Informative';
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
        isInformative 
          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
          : 'bg-green-500/20 text-green-400 border border-green-500/30'
      }`}>
        {isInformative ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
        <span className="font-semibold">{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Disaster Recognition AI
            </h1>
          </div>
          <p className="text-slate-300 text-lg">
            Multimodal Analysis System - Powered by GPT-4o
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-8">
          <div className="flex gap-4 justify-center">
            {[
              { id: 'text', icon: FileText, label: 'Text Only' },
              { id: 'image', icon: Image, label: 'Image Only' },
              { id: 'both', icon: Zap, label: 'Both (Late Fusion)' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  mode === id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50 scale-105'
                    : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Text Input */}
          {(mode === 'text' || mode === 'both') && (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-blue-400" size={24} />
                <h3 className="text-xl font-bold">Text Input</h3>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter a sentence about a potential disaster..."
                className="w-full h-40 bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          )}

          {/* Image Input */}
          {(mode === 'image' || mode === 'both') && (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Image className="text-green-400" size={24} />
                <h3 className="text-xl font-bold">Image Input</h3>
              </div>
              
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-slate-900/30 transition-all">
                  <Upload size={40} className="text-slate-500 mb-2" />
                  <span className="text-slate-400">Click to upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative h-40 rounded-xl overflow-hidden group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={handleAnalyze}
            disabled={isProcessing || (mode !== 'image' && !text) || (mode !== 'text' && !imageFile)}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-xl font-bold text-lg shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Analyzing...
              </>
            ) : (
              <>
                <Zap size={24} />
                Analyze
              </>
            )}
          </button>
          
          <button
            onClick={handleReset}
            className="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-lg transition-all"
          >
            Reset
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-8 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle className="text-green-400" size={28} />
              Analysis Results
            </h2>
            
            <div className="space-y-6">
              {results.textLabel && (
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-400" size={24} />
                    <span className="font-semibold text-lg">Text Classification:</span>
                  </div>
                  <ResultBadge label={results.textLabel} type="text" />
                </div>
              )}
              
              {results.imageLabel && (
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Image className="text-green-400" size={24} />
                    <span className="font-semibold text-lg">Image Classification:</span>
                  </div>
                  <ResultBadge label={results.imageLabel} type="image" />
                </div>
              )}
              
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl border-2 border-purple-500/30">
                <div className="flex items-center gap-3">
                  <Zap className="text-yellow-400" size={28} />
                  <span className="font-bold text-xl">Final Result (Late Fusion):</span>
                </div>
                <div className="scale-110">
                  <ResultBadge label={results.finalLabel} type="final" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-slate-400">
          <p>Powered by OpenAI GPT-4o • Late Fusion Multimodal Classification</p>
        </div>
      </div>
    </div>
  );
};

export default DisasterClassifier;