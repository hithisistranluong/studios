# StudyAI - AI-Powered Study Experience

An AI-powered web application that transforms messy notes into smart, interactive study experiences.

## Features

- **📝 Note Input**: Upload or type your notes directly
- **📋 Summarization**: Get AI-generated summaries of your notes
- **🎴 Flashcards**: Auto-generate flashcards for effective studying
- **❓ Quiz Generation**: Create quizzes to test your knowledge
- **💬 Q&A Chat**: Ask questions about your notes and get AI-powered answers

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, TailwindCSS
- **Backend**: Node.js with Next.js API Routes
- **Database**: Supabase
- **AI**: OpenAI GPT-4o-mini

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (optional, for data persistence)
- OpenAI API key (required for AI features)

### Environment Variables

The application requires the following environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | **Yes** | Your OpenAI API key. Get one at https://platform.openai.com/api-keys |
| `OPENAI_MODEL` | No | Primary model to use (default: `gpt-3.5-turbo`). Examples: `gpt-4o-mini`, `gpt-4` |
| `OPENAI_FALLBACK_MODELS` | No | Comma-separated list of fallback model IDs to try if primary model returns 403 Forbidden |
| `MOCK_OPENAI` | No | Set to `true` to return demo/mock responses without calling OpenAI API (useful for development) |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Your Supabase anonymous key |

> **Important**: Never commit your API keys to version control. The `OPENAI_API_KEY` is used server-side only and is never exposed to the client.

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd studios-draft
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your credentials:
```env
# Required - OpenAI API key for AI features
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional - Model configuration
# OPENAI_MODEL=gpt-3.5-turbo
# OPENAI_FALLBACK_MODELS=gpt-4o-mini,gpt-4

# Optional - Enable mock mode for development without API credits
# MOCK_OPENAI=true

# Optional - Supabase configuration (for data persistence)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Deployment

When deploying to production (Vercel, Netlify, etc.), make sure to:

1. Set the `OPENAI_API_KEY` environment variable in your hosting provider's dashboard
2. (Optional) Set Supabase environment variables if using data persistence
3. The AI features will not work without a valid `OPENAI_API_KEY`

**Vercel:**
- Go to your project settings → Environment Variables
- Add `OPENAI_API_KEY` with your API key value

**Netlify:**
- Go to Site settings → Environment variables
- Add `OPENAI_API_KEY` with your API key value

## Usage

1. **Add Notes**: Type or upload your study notes in the text area
2. **Choose an Action**:
   - Click **Summarize** to get a concise summary
   - Click **Flashcards** to generate study flashcards
   - Click **Quiz** to create a quiz from your notes
   - Click **Q&A Chat** to ask questions about your notes
3. **Study**: Use the generated content to study effectively

## API Endpoints

### POST `/api/ai`

Process notes with AI actions.

**Request Body**:
```json
{
  "action": "summarize" | "flashcards" | "quiz" | "qa",
  "content": "Your notes here",
  "question": "Optional question for Q&A action"
}
```

**Success Response**:
- `summarize`: `{ summary: string }`
- `flashcards`: `{ flashcards: { front: string, back: string }[] }`
- `quiz`: `{ quiz: { question: string, options: string[], correct_answer: number }[] }`
- `qa`: `{ answer: string }`

**Error Response**:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "retryable": true | false
}
```

**Error Codes**:
- `CONFIG_ERROR` - Missing or invalid API key configuration
- `VALIDATION_ERROR` - Invalid request parameters
- `AUTH_ERROR` - Invalid API key
- `RATE_LIMIT` - Rate limit exceeded (retryable)
- `SERVICE_ERROR` - OpenAI service unavailable (retryable)
- `INTERNAL_ERROR` - Unexpected server error

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Troubleshooting

### "OPENAI_API_KEY environment variable is not set"

This error occurs when the OpenAI API key is not configured. Make sure:
1. You have created a `.env.local` file in the project root
2. The file contains `OPENAI_API_KEY=your-api-key`
3. You have restarted the development server after adding the env file

### "Invalid API key"

Your OpenAI API key may be incorrect or expired. Verify your key at https://platform.openai.com/api-keys

### "Rate limit exceeded"

You've made too many requests. Wait a few moments and try again. Consider upgrading your OpenAI plan if this happens frequently.

### AI features not working in production

Make sure you've added the `OPENAI_API_KEY` environment variable in your hosting provider's dashboard and redeployed.

## License

MIT

