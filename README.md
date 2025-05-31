# 🚀 Memecoin Generator

Generate viral memecoins with AI-powered creativity! This web application creates unique memecoin names, symbols, descriptions, and images using OpenRouter LLM and Fal AI image generation.

## ✨ Features

- **AI-Generated Content**: Creates unique memecoin names, symbols, and descriptions
- **Custom Images**: Generates mascot images tailored to each memecoin
- **Modern UI**: Beautiful, responsive interface with glassmorphism design
- **Download Images**: Save generated images for your projects
- **Secure API Keys**: Client-side storage of your API credentials

## 🛠️ Setup

### Prerequisites

You'll need API keys from:

1. **OpenRouter** - For text generation
   - Visit [OpenRouter](https://openrouter.ai/)
   - Sign up and get your API key
   - Make sure you have credits for Claude 3.5 Sonnet

2. **Fal AI** - For image generation
   - Visit [Fal AI](https://fal.ai/)
   - Sign up and get your API key
   - Ensure you have credits for FLUX image generation

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd memecoin-generator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Usage

1. **Configure API Keys**:
   - Click "Show Settings" to reveal the API configuration panel
   - Enter your OpenRouter API key
   - Enter your Fal AI API key
   - Keys are stored locally in your browser

2. **Generate Memecoin**:
   - Click "Generate Memecoin" to create a new memecoin
   - The AI will generate a unique name, symbol, and description
   - A custom mascot image will be created based on the concept

3. **Download & Use**:
   - View your generated memecoin details
   - Download the mascot image for use in your projects
   - Generate unlimited variations

## 🎨 Generated Content

Each memecoin includes:

- **Name**: Catchy 2-4 word memecoin name
- **Symbol**: 3-10 letter ticker symbol
- **Description**: Fun 50-100 word description
- **Image**: Custom mascot artwork (1024x1024px)

## 🔧 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **APIs**: OpenRouter (Claude 3.5 Sonnet), Fal AI (FLUX)

## 🚀 Deployment

Deploy to Vercel, Netlify, or any other platform that supports Next.js:

```bash
npm run build
npm start
```

## 🔒 Security & Privacy

- API keys are stored locally in your browser
- No data is persisted on our servers
- All API calls are made directly from your browser
- Generated content is not logged or stored

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

This tool is for entertainment and educational purposes. Generated memecoins are fictional concepts. Always do your own research before investing in any cryptocurrency projects.

---

**Made with ❤️ for the meme economy**
