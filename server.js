const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'build')));

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

  try {
    if (provider === 'replicate') {
      await handleReplicateRequest(req, res, prompt);
    } else {
      await handleOpenAIRequest(req, res, prompt);
    }
  } catch (error) {
    console.log('💥 Server error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

async function handleReplicateRequest(req, res, prompt) {
  const replicateApiKey = process.env.REPLICATE_API_TOKEN;
  
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
        version: "openai/sora-2:latest",
        input: requestBody.input
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
  
  while (attempts < maxAttempts) {
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
        if (data.output && data.output.length > 0) {
          const videoUrl = data.output[0];
          console.log('🎬 Video generated successfully!');
          console.log('🔗 Video URL:', videoUrl);
          res.json({ videoUrl: videoUrl, status: 'completed' });
          return;
        } else {
          throw new Error('No video output found in successful prediction');
        }
      } else if (data.status === 'failed') {
        throw new Error(`Prediction failed: ${data.error || 'Unknown error'}`);
      }
      
      // Continue polling if still processing
    } catch (err) {
      console.log('❌ Error polling prediction:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
  }
  
  console.log('⏰ Prediction timed out after 5 minutes');
  res.status(408).json({ error: 'Prediction timed out after 5 minutes' });
}

async function handleOpenAIRequest(req, res, prompt) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
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

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} to view the app`);
  console.log('📝 Make sure to set your API keys in the .env file');
});
