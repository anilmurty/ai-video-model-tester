import React, { useState } from 'react';
import './App.css';

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

    try {
      if (provider === 'replicate') {
        await handleReplicateRequest();
      } else {
        await handleOpenAIRequest();
      }
    } catch (err) {
      console.log('💥 Error caught:', err);
      setError(err.message);
      setDebugInfo(`Error: ${err.message}`);
    } finally {
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

        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {/* Provider Selection */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem'}}>
              Choose AI Provider
            </h3>
            <p style={{color: '#e0e7ff', marginBottom: '1rem'}}>
              Select which AI service to use for video generation
            </p>
            
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: 'white'}}>
                <input
                  type="radio"
                  name="provider"
                  value="replicate"
                  checked={provider === 'replicate'}
                  onChange={(e) => setProvider(e.target.value)}
                  style={{marginRight: '0.5rem'}}
                />
                Replicate Sora-2
              </label>
              <label style={{display: 'flex', alignItems: 'center', color: 'white'}}>
                <input
                  type="radio"
                  name="provider"
                  value="openai"
                  checked={provider === 'openai'}
                  onChange={(e) => setProvider(e.target.value)}
                  style={{marginRight: '0.5rem'}}
                />
                OpenAI Sora-2
              </label>
            </div>
            
            {/* API Key Inputs */}
            {provider === 'replicate' && (
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', color: 'white', marginBottom: '0.5rem'}}>
                  Replicate API Key
                </label>
                <input
                  type="password"
                  placeholder="r8_..."
                  value={replicateApiKey}
                  onChange={(e) => setReplicateApiKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            )}
            
            {provider === 'openai' && (
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', color: 'white', marginBottom: '0.5rem'}}>
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem'}}>
              Video Prompt
            </h3>
            <p style={{color: '#e0e7ff', marginBottom: '1rem'}}>
              Describe the video you want to generate
            </p>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your video prompt here..."
              rows={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.875rem',
                resize: 'none',
                marginBottom: '1rem'
              }}
            />
            
            <div style={{display: 'flex', gap: '0.75rem'}}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: loading ? '#64748b' : '#3b82f6',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Generating...' : 'Generate Video'}
              </button>
              
              <button
                onClick={handleClear}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'transparent',
                  color: 'white',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              color: '#fecaca'
            }}>
              {error}
            </div>
          )}

          {/* Video Display */}
          {videoUrl && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem'}}>
                Generated Video
              </h3>
              
              <div style={{
                aspectRatio: '16/9',
                background: 'black',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '1rem'
              }}>
                <video
                  src={videoUrl}
                  controls
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                  onLoadStart={() => console.log('🎬 Video loading started')}
                  onLoadedData={() => console.log('🎬 Video data loaded')}
                  onError={(e) => console.log('🎬 Video error:', e)}
                  onCanPlay={() => console.log('🎬 Video can play')}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <p style={{color: '#4ade80', fontWeight: '500', marginBottom: '0.5rem'}}>
                  ✅ Video Generated Successfully!
                </p>
                <div style={{marginBottom: '0.5rem'}}>
                  <label style={{color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem'}}>Video URL:</label>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '4px',
                    padding: '0.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'white',
                    wordBreak: 'break-all'
                  }}>
                    <a 
                      href={videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{color: '#60a5fa', textDecoration: 'underline'}}
                    >
                      {videoUrl}
                    </a>
                  </div>
                </div>
                <p style={{color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem'}}>
                  If the video doesn't load above, click the URL link to view it directly.
                </p>
              </div>
            </div>
          )}

          {/* Debug Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <button
              onClick={() => setShowDebug(!showDebug)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'transparent',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {showDebug ? 'Hide' : 'Show'} Debug Info
            </button>
            
            {showDebug && (
              <div style={{marginTop: '1rem'}}>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{color: 'white', fontWeight: '500', marginBottom: '0.5rem'}}>Current State:</h4>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)'}}>
                    <div>Provider: {provider}</div>
                    <div>Loading: {loading ? 'Yes' : 'No'}</div>
                    <div>Has Video URL: {videoUrl ? 'Yes' : 'No'}</div>
                    <div>Has Error: {error ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                
                {debugInfo && (
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <h4 style={{color: 'white', fontWeight: '500', marginBottom: '0.5rem'}}>Last Debug Message:</h4>
                    <pre style={{color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem', whiteSpace: 'pre-wrap'}}>{debugInfo}</pre>
                  </div>
                )}
                
                <div style={{
                  background: 'rgba(251, 191, 36, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <h4 style={{color: '#fde047', fontWeight: '500', marginBottom: '0.5rem'}}>Debug Instructions:</h4>
                  <ol style={{color: '#fef3c7', fontSize: '0.875rem', paddingLeft: '1.5rem'}}>
                    <li>Open your browser's Developer Tools (F12)</li>
                    <li>Go to the Console tab</li>
                    <li>Try generating a video to see detailed logs</li>
                    <li>Check the Network tab to see the API request/response</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
