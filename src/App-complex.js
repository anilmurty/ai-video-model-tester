import React, { useState } from 'react';
import './App.css';
import { Button } from './components/ui/button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.js';
import { Input } from './components/ui/input.js';
import { Label } from './components/ui/label.js';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group.js';
import { Textarea } from './components/ui/textarea.js';
import { Play, Settings, Video, Loader2 } from 'lucide-react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [provider, setProvider] = useState('replicate');
  const [replicateApiKey, setReplicateApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');

  const handleSubmit = async () => {
    console.log('🚀 Starting video generation process...');
    console.log('📝 Prompt:', prompt);
    console.log('🏢 Provider:', provider);
    
    if (!prompt.trim()) {
      console.log('❌ Error: Empty prompt');
      setError('Please enter a prompt');
      return;
    }

    // Check API keys
    if (provider === 'replicate' && !replicateApiKey.trim()) {
      setError('Please enter your Replicate API key');
      return;
    }
    if (provider === 'openai' && !openaiApiKey.trim()) {
      setError('Please enter your OpenAI API key');
      return;
    }

    setLoading(true);
    setError('');
    setVideoUrl('');
    setDebugInfo('Starting request...');

    // Check if we're in debug mode
    if (process.env.REACT_APP_DEBUG) {
      console.log('🐛 DEBUG MODE ENABLED - Enhanced logging active');
    }

    try {
      if (provider === 'replicate') {
        await handleReplicateRequest();
      } else {
        await handleOpenAIRequest();
      }
    } catch (err) {
      console.log('💥 Error caught:', err);
      console.log('💥 Error message:', err.message);
      console.log('💥 Error stack:', err.stack);
      
      // Enhanced error handling
      let errorMessage = err.message;
      if (err.message === 'Failed to fetch') {
        errorMessage = 'Network error: Unable to connect to API. This could be due to:\n' +
          '1. API not being available\n' +
          '2. CORS issues (try running with a CORS proxy)\n' +
          '3. Network connectivity issues\n' +
          '4. API endpoint may be incorrect';
      }
      
      setError(errorMessage);
      setDebugInfo(`Error: ${errorMessage}`);
    } finally {
      console.log('🏁 Request completed, setting loading to false');
      setLoading(false);
    }
  };

  const handleReplicateRequest = async () => {
    console.log('🌐 Making request to server-side Replicate API...');
    setDebugInfo(`Making request to server-side Replicate API with prompt: "${prompt}"`);

    const response = await fetch('http://localhost:3001/api/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        provider: 'replicate',
        apiKey: replicateApiKey
      })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response status text:', response.statusText);
    setDebugInfo(`Response received: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ Error response body:', errorData);
      setDebugInfo(`Error: ${response.status} - ${errorData.error}`);
      throw new Error(`Server API request failed: ${response.status} ${response.statusText}. Details: ${errorData.error}`);
    }

    const data = await response.json();
    console.log('✅ Full server API response:', JSON.stringify(data, null, 2));
    setDebugInfo(`Server API Response: ${JSON.stringify(data, null, 2)}`);
    
    if (data.videoUrl) {
      console.log('🎬 Video generated successfully!');
      console.log('🔗 Video URL:', data.videoUrl);
      setVideoUrl(data.videoUrl);
      setDebugInfo(`Video generated successfully! URL: ${data.videoUrl}`);
    } else {
      console.log('⚠️ No video URL found in response');
      setError('No video URL returned from server API');
      setDebugInfo('No video URL found in server API response');
    }
  };


  const handleOpenAIRequest = async () => {
    console.log('🌐 Making request to server-side OpenAI API...');
    setDebugInfo(`Making request to server-side OpenAI API with prompt: "${prompt}"`);

    const response = await fetch('http://localhost:3001/api/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        provider: 'openai',
        apiKey: openaiApiKey
      })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response status text:', response.statusText);
    setDebugInfo(`Response received: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ Error response body:', errorData);
      setDebugInfo(`Error: ${response.status} - ${errorData.error}`);
      throw new Error(`Server API request failed: ${response.status} ${response.statusText}. Details: ${errorData.error}`);
    }

    const data = await response.json();
    console.log('✅ Full server API response:', JSON.stringify(data, null, 2));
    setDebugInfo(`Server API Response: ${JSON.stringify(data, null, 2)}`);
    
    if (data.videoUrl) {
      console.log('🎬 Video generated successfully!');
      console.log('🔗 Video URL:', data.videoUrl);
      setVideoUrl(data.videoUrl);
      setDebugInfo(`Video generated successfully! URL: ${data.videoUrl}`);
    } else {
      console.log('⚠️ No video URL found in response');
      setError('No video URL returned from server API');
      setDebugInfo('No video URL found in server API response');
    }
  };

  const handleClear = () => {
    setPrompt('');
    setVideoUrl('');
    setError('');
    setDebugInfo('');
    console.log('🧹 Cleared all form data');
  };

  const buildDate = new Date().toLocaleDateString();

  return (
    <div className="App" style={{minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem'}}>
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>AI Video Model Tester</h1>
          <p style={{color: '#e0e7ff'}}>Built on {buildDate}</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Provider Selection */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Choose AI Provider
              </CardTitle>
              <CardDescription className="text-blue-100">
                Select which AI service to use for video generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={provider} onValueChange={setProvider} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="replicate" id="replicate" />
                  <Label htmlFor="replicate" className="text-white font-medium">
                    Replicate Sora-2
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="openai" id="openai" />
                  <Label htmlFor="openai" className="text-white font-medium">
                    OpenAI Sora-2
                  </Label>
                </div>
              </RadioGroup>
              
              {/* API Key Inputs */}
              <div className="space-y-4">
                {provider === 'replicate' && (
                  <div className="space-y-2">
                    <Label htmlFor="replicate-key" className="text-white">
                      Replicate API Key
                    </Label>
                    <Input
                      id="replicate-key"
                      type="password"
                      placeholder="r8_..."
                      value={replicateApiKey}
                      onChange={(e) => setReplicateApiKey(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                )}
                
                {provider === 'openai' && (
                  <div className="space-y-2">
                    <Label htmlFor="openai-key" className="text-white">
                      OpenAI API Key
                    </Label>
                    <Input
                      id="openai-key"
                      type="password"
                      placeholder="sk-..."
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prompt Input */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Prompt
              </CardTitle>
              <CardDescription className="text-blue-100">
                Describe the video you want to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your video prompt here..."
                rows={6}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 resize-none"
              />
              
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Generate Video
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="bg-red-500/20 backdrop-blur-sm border-red-400/30">
              <CardContent className="pt-6">
                <p className="text-red-100 whitespace-pre-wrap">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Video Display */}
          {videoUrl && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Generated Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    onLoadStart={() => console.log('🎬 Video loading started')}
                    onLoadedData={() => console.log('🎬 Video data loaded')}
                    onError={(e) => console.log('🎬 Video error:', e)}
                    onCanPlay={() => console.log('🎬 Video can play')}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <p className="text-green-400 font-medium">✅ Video Generated Successfully!</p>
                  <div className="space-y-1">
                    <Label className="text-white/80 text-sm">Video URL:</Label>
                    <div className="bg-black/20 rounded p-2 font-mono text-xs text-white break-all">
                      <a 
                        href={videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        {videoUrl}
                      </a>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">
                    If the video doesn't load above, click the URL link to view it directly.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug Section */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="pt-6">
              <Button
                onClick={() => setShowDebug(!showDebug)}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                {showDebug ? 'Hide' : 'Show'} Debug Info
              </Button>
              
              {showDebug && (
                <div className="mt-4 space-y-4">
                  <div className="bg-black/20 rounded-lg p-4 space-y-2">
                    <h4 className="text-white font-medium">Current State:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-white/80">
                      <div>Provider: {provider}</div>
                      <div>Loading: {loading ? 'Yes' : 'No'}</div>
                      <div>Has Video URL: {videoUrl ? 'Yes' : 'No'}</div>
                      <div>Has Error: {error ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                  
                  {debugInfo && (
                    <div className="bg-black/20 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Last Debug Message:</h4>
                      <pre className="text-xs text-white/80 whitespace-pre-wrap">{debugInfo}</pre>
                    </div>
                  )}
                  
                  <div className="bg-yellow-500/20 rounded-lg p-4">
                    <h4 className="text-yellow-200 font-medium mb-2">Debug Instructions:</h4>
                    <ol className="text-yellow-100 text-sm space-y-1 list-decimal list-inside">
                      <li>Open your browser's Developer Tools (F12)</li>
                      <li>Go to the Console tab</li>
                      <li>Try generating a video to see detailed logs</li>
                      <li>Check the Network tab to see the API request/response</li>
                    </ol>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
