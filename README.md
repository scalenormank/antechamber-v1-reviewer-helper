# AI System Prompt Generator

A sophisticated Next.js application for creating, verifying, and analyzing AI system prompts with advanced complexity principles and comprehensive evaluation capabilities.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/pablo-canevas-projects/v0-remix-of-system-prompt-analyzer)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

## 🚀 Features

### Core Functionality
- **System Prompt Generation** - Create sophisticated AI prompts using advanced methodology
- **Prompt Verification** - Analyze existing prompts for completeness and quality
- **Response Analysis** - Evaluate AI responses for grounding, integrity, and completeness
- **Comprehensive Checklist** - Systematic evaluation framework for quality assessment

### Advanced Capabilities
- **100+ Tool Categories** - Device control, location services, calendar, finance, e-commerce, and more
- **7 Complexity Principles** - Advanced prompt engineering methodology
- **6 Context Requirements** - Building blocks for comprehensive prompts
- **8 Evaluation Tests** - Multi-dimensional quality assessment
- **3-Tier Response Analysis** - Grounding, integrity, and completeness checks

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS 4** with custom design system
- **Radix UI** components for accessibility
- **Lucide React** for icons
- **Custom toast notification system**

### Backend
- **Next.js API Routes** for backend functionality
- **OpenAI GPT-4** integration via Vercel AI SDK
- **Structured JSON responses** with comprehensive error handling
- **Fallback mechanisms** for offline functionality

### Design System
- **OKLCH color space** for consistent theming
- **Light/Dark mode** support
- **Green primary theme** with professional neutrals
- **Responsive design** with mobile-first approach
- **Custom component library** with consistent styling

## 📁 Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── generate-prompt/    # System prompt generation
│   │   ├── verify-prompt/      # Prompt analysis
│   │   ├── run-evaluations/    # Quality evaluation tests
│   │   └── analyze-response/   # Response analysis
│   ├── globals.css            # Global styles and theme
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── system-prompt-generator.tsx  # Main application component
│   └── theme-provider.tsx     # Theme management
├── lib/
│   ├── api-config.ts          # API configuration
│   └── utils.ts               # Utility functions
└── hooks/
    └── use-toast.ts           # Toast notification hook
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd antechamber-v1-reviewer-helper
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### 1. Verify Prompt
- Paste your existing system prompt
- Get comprehensive analysis of prompt structure
- Identify missing components and areas for improvement

### 2. Response Checker
- Analyze AI responses by providing:
  - System prompt used
  - User prompt
  - Tool calls made
  - Tool outputs
  - Final AI response
- Receive detailed feedback on grounding, integrity, and completeness

### 3. Checklist
- Use the systematic evaluation checklist
- Track progress across multiple quality dimensions
- Ensure comprehensive task completion

## 🔧 Configuration

### API Configuration
The application uses OpenAI's GPT-4 model with the following default settings:
- **Model**: GPT-4
- **Max Tokens**: 4000
- **Temperature**: 0.7
- **Max Context Requirements**: 6
- **Max Complexity Requirements**: 7

### Customization
- Modify tool categories in `components/system-prompt-generator.tsx`
- Adjust evaluation criteria in the same file
- Customize styling in `app/globals.css`

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set the `OPENAI_API_KEY` environment variable
3. Deploy automatically on every push

### Manual Deployment
```bash
pnpm build
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🔗 Links

- **Live Demo**: [Vercel Deployment](https://vercel.com/pablo-canevas-projects/v0-remix-of-system-prompt-analyzer)
- **Built with**: [v0.app](https://v0.app/chat/projects/Q6yp244JTE7)

## 📞 Support

For support and questions, please open an issue in the repository.
