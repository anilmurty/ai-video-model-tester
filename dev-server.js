require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { spawn } = require('child_process');

const app = express();
const PORT = 3001; // API server runs on 3001

// Middleware
app.use(cors());
app.use(express.json());

// Replicate API proxy endpoint
app.post('/api/generate-video', async (req, res) => {
  console.log('🎬 Received video generation request');
  console.log('📝 Prompt:', req.body.prompt);
  console.log('🏢 Provider:', req.body.provider);
  
  const { prompt, provider } = req.body;
  
  if (!prompt) {
    console.log('❌ Error: No prompt provided');
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Set a timeout for the entire request
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.log('⏰ Request timeout - sending 408 response');
      res.status(408).json({ error: 'Request timeout - video generation took too long' });
    }
  }, 300000); // 5 minutes

  try {
    if (provider === 'replicate') {
      await handleReplicateRequest(req, res, prompt);
    } else {
      await handleOpenAIRequest(req, res, prompt);
    }
  } catch (error) {
    console.log('💥 Server error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  } finally {
    clearTimeout(timeout);
  }
});

async function handleReplicateRequest(req, res, prompt) {
  const replicateApiKey = req.body.apiKey || process.env.REPLICATE_API_TOKEN;
  
  if (!replicateApiKey) {
    console.log('❌ Replicate API key not found');
    return res.status(400).json({ error: 'Replicate API key not configured' });
  }

  console.log('🔑 Replicate API Key present:', replicateApiKey ? 'Yes' : 'No');
  console.log('🔑 API Key (first 10 chars):', replicateApiKey.substring(0, 10) + '...');

  const requestBody = {
    input: {
      prompt: prompt,
      duration: 10,
      aspect_ratio: "16:9"
    }
  };

  console.log('📤 Replicate request body:', JSON.stringify(requestBody, null, 2));
  console.log('🌐 Making request to Replicate API...');

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${replicateApiKey}`
      },
      body: JSON.stringify({
        version: "openai/sora-2",
        input: {
          prompt: prompt,
          seconds: 8,
          aspect_ratio: "landscape",
          openai_api_key: process.env.OPENAI_API_KEY
        }
      })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response status text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response body:', errorText);
      throw new Error(`Replicate API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Full Replicate API response:', JSON.stringify(data, null, 2));
    
    if (data.id) {
      console.log('🎬 Prediction created:', data.id);
      console.log('📊 Prediction status:', data.status);
      
      // Start polling for completion
      pollForCompletion(data.id, replicateApiKey, res);
    } else {
      console.log('⚠️ No prediction ID found in response');
      res.status(400).json({ error: 'No prediction ID returned from Replicate API' });
    }
  } catch (error) {
    console.log('💥 Replicate API error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

async function pollForCompletion(predictionId, apiKey, res) {
  console.log('🔄 Polling for completion of prediction:', predictionId);
  
  const maxAttempts = 30; // 5 minutes max
  let attempts = 0;
  let responseSent = false;
  
  while (attempts < maxAttempts && !responseSent) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    attempts++;
    
    console.log(`🔄 Polling attempt ${attempts}/${maxAttempts}`);
    
    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to check prediction status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Prediction status:', data.status);
      
      if (data.status === 'succeeded') {
        console.log('🎬 Video generation succeeded!');
        console.log('📊 Full response data:', JSON.stringify(data, null, 2));
        
        if (data.output) {
          const videoUrl = data.output;
          console.log('🎬 Video generated successfully!');
          console.log('🔗 Video URL:', videoUrl);
          console.log('🔗 Full URL length:', videoUrl.length);
          if (!responseSent) {
            res.json({ videoUrl: videoUrl, status: 'completed' });
            responseSent = true;
          }
          return;
        } else {
          console.log('⚠️ No output found, checking alternative output format...');
          console.log('📊 Available fields:', Object.keys(data));
          console.log('📊 Output field:', data.output);
          console.log('📊 URLs field:', data.urls);
          
          // Try to get URL from urls field
          if (data.urls && data.urls.get) {
            console.log('🔗 Trying to get video from URLs field...');
            const videoUrl = data.urls.get;
            if (!responseSent) {
              res.json({ videoUrl: videoUrl, status: 'completed' });
              responseSent = true;
            }
            return;
          }
          
          throw new Error('No video output found in successful prediction');
        }
      } else if (data.status === 'failed') {
        throw new Error(`Prediction failed: ${data.error || 'Unknown error'}`);
      }
      
      // Continue polling if still processing
    } catch (err) {
      console.log('❌ Error polling prediction:', err.message);
      if (!responseSent) {
        res.status(500).json({ error: err.message });
        responseSent = true;
      }
      return;
    }
  }
  
  if (!responseSent) {
    console.log('⏰ Prediction timed out after 5 minutes');
    res.status(408).json({ error: 'Prediction timed out after 5 minutes' });
  }
}

async function handleOpenAIRequest(req, res, prompt) {
  const openaiApiKey = req.body.apiKey || process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.log('❌ OpenAI API key not found');
    return res.status(400).json({ error: 'OpenAI API key not configured' });
  }

  console.log('🔑 OpenAI API Key present:', openaiApiKey ? 'Yes' : 'No');
  console.log('🔑 API Key (first 10 chars):', openaiApiKey.substring(0, 10) + '...');

  const requestBody = {
    model: 'sora-2',
    prompt: prompt,
    max_duration: 10
  };

  console.log('📤 OpenAI request body:', JSON.stringify(requestBody, null, 2));
  console.log('🌐 Making request to OpenAI API...');

  try {
    const response = await fetch('https://api.openai.com/v1/video/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'sora-2'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response status text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response body:', errorText);
      throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Full OpenAI API response:', JSON.stringify(data, null, 2));
    
    if (data.data && data.data.length > 0) {
      const videoData = data.data[0];
      console.log('🎬 Video data:', videoData);
      console.log('🔗 Video URL:', videoData.url);
      res.json({ videoUrl: videoData.url, status: 'completed' });
    } else {
      console.log('⚠️ No video data found in response');
      res.status(400).json({ error: 'No video data returned from API' });
    }
  } catch (error) {
    console.log('💥 OpenAI API error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log('📝 Make sure to set your API keys in the .env file');
  console.log('🔗 React app should connect to: http://localhost:3001/api/generate-video');
});
