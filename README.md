# AI Video Model Tester

A modern, beautiful React application for testing AI video generation models from multiple providers. Built with a stunning glassmorphism design inspired by TryCrib, this app allows you to easily test and compare different AI video generation APIs.

## 🎬 Features

- **Multi-Provider Support**: Test both Replicate Sora-2 and OpenAI Sora-2 models
- **Beautiful UI**: Modern glassmorphism design with gradient backgrounds
- **Real-time Generation**: Live progress tracking and status updates
- **API Key Management**: Secure input fields for both providers
- **Video Player**: Built-in video player with full controls
- **Debug Panel**: Comprehensive logging and debugging tools
- **Responsive Design**: Works perfectly on desktop and mobile

## 🎯 Usage

1. **Choose Provider**: Select between "Replicate Sora-2" or "OpenAI Sora-2"
2. **Enter API Key**: Input your API key for the selected provider
3. **Write Prompt**: Describe the video you want to generate
4. **Generate**: Click "Generate Video" and wait for completion
5. **Watch**: View your generated video in the built-in player

## 🔑 API Key Setup

### Replicate (Recommended)
1. Sign up at [replicate.com](https://replicate.com)
2. Navigate to your account settings
3. Generate a new API token
4. Add to your `.env` file: `REPLICATE_API_TOKEN=your_token_here`

### OpenAI (Optional)
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create an account and generate an API key
3. Add to your `.env` file: `OPENAI_API_KEY=your_key_here`

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- API keys for your chosen providers

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anilmurty/ai-video-model-tester.git
   cd ai-video-model-tester
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your API keys:**
   Create a `.env` file in the root directory:
   ```bash
   # For Replicate (recommended)
   REPLICATE_API_TOKEN=your_replicate_token_here
   
   # For OpenAI (optional)
   OPENAI_API_KEY=your_openai_key_here
   ```

4. **Start the application:**
   ```bash
   npm run dev:full
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Development

### Available Scripts

- `npm start` - Start React development server
- `npm run api-server` - Start the API proxy server
- `npm run dev:full` - Run both frontend and backend concurrently
- `npm run build` - Build for production
- `npm test` - Run tests

### Project Structure

```
ai-video-model-tester/
├── src/
│   ├── App.js          # Main React component
│   ├── App.css         # Styling with glassmorphism effects
│   └── index.js         # React entry point
├── dev-server.js       # Express API proxy server
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (not committed)
└── README.md          # This file
```
## 🔧 Technical Details

- **Frontend**: React 18 with modern hooks
- **Backend**: Express.js with CORS support
- **Styling**: Custom CSS with glassmorphism effects
- **API Integration**: Replicate and OpenAI Sora-2 models
- **Video Processing**: Real-time polling and status updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -m 'Add feature'`
5. Push: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

