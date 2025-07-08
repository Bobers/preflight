# Preflight MVP v2.0

Preflight is an AI-powered tool that analyzes business plans to identify hidden assumptions and potential risks. It helps entrepreneurs and business professionals validate their ideas by surfacing unexamined beliefs that could impact success.

## Features

- **Assumption Detection**: Uses GPT-4o-mini to identify assumptions in business plans
- **Risk Categorization**: Classifies assumptions as critical, important, or minor
- **Verbatim Quotes**: Extracts exact quotes from the source text
- **Real-time Analysis**: Processes documents in 10-15 seconds
- **Privacy-Focused**: No data persistence, anonymous analytics only

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4o-mini
- **Rate Limiting**: Upstash Redis
- **Analytics**: Vercel Web Analytics
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key with billing enabled
- Upstash Redis account (free tier works)
- Vercel account for deployment

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd preflight-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Upstash Redis Configuration  
   UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url_here
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key with GPT-4o-mini access | Yes |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST API URL | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST API token | Yes |

## Setting Up Services

### OpenAI
1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Generate an API key in the API keys section
3. Set up billing with a $50 limit for safety
4. Enable GPT-4o-mini model access

### Upstash Redis
1. Create an account at [upstash.com](https://upstash.com)
2. Create a new Redis database (free tier)
3. Copy the REST URL and token from the database details

### Vercel (for deployment)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to link your project
4. Add environment variables in Vercel dashboard

## Project Structure

```
preflight-mvp/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts      # API endpoint for analysis
│   ├── privacy/
│   │   └── page.tsx          # Privacy policy page
│   ├── layout.tsx            # Root layout with analytics
│   └── page.tsx              # Main application page
├── components/               # React components (if needed)
├── types/
│   └── index.ts             # TypeScript type definitions
├── utils/
│   ├── analytics.ts         # Analytics event tracking
│   ├── hooks.ts             # Custom React hooks
│   ├── sampleContent.ts     # Sample business plan
│   └── testSamples.ts       # Additional test samples
├── public/                  # Static assets
└── package.json            # Dependencies and scripts
```

## API Documentation

### POST /api/analyze

Analyzes business plan text for assumptions.

**Request Body:**
```json
{
  "text": "Your business plan text here..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assumptions": [
      {
        "text": "exact quote from the plan",
        "risk_level": "critical" | "important" | "minor",
        "reasoning": "Brief explanation (max 20 words)"
      }
    ],
    "summary": {
      "total": 6,
      "critical": 3,
      "important": 2,
      "minor": 1
    }
  }
}
```

**Rate Limiting:** 10 requests per hour per IP address

## Key Features & Constraints

- **Character Limits**: 100-10,000 characters per analysis
- **Processing Time**: Target <15 seconds per analysis
- **Quote Accuracy**: Extracts verbatim quotes only
- **No Data Storage**: Stateless processing, no user data saved
- **Mobile Responsive**: Optimized for all screen sizes

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Testing

The application includes sample business plans for testing. Click "Try with sample" to load test content.

For manual testing:
- Test minimum input (100 characters)
- Test maximum input (10,000 characters)
- Test rate limiting (>10 requests/hour)
- Test error states (network issues, API failures)

## Cost Estimates

- **OpenAI API**: ~$0.0007 per analysis (GPT-4o-mini)
- **Target**: <$50/month at expected usage
- **Monitoring**: Check Vercel dashboard for API usage

## Security Considerations

- No sensitive data logging
- Input sanitization for XSS prevention
- Rate limiting to prevent abuse
- HTTPS only in production
- Environment variables for secrets

## Known Limitations

- English language only
- Best suited for business plans and pitch decks
- May miss subtle or implied assumptions
- Requires clear, well-structured text
- No support for documents with tables/charts

## Deployment Checklist

- [ ] Set all environment variables in Vercel
- [ ] Enable Vercel Analytics
- [ ] Test production build locally
- [ ] Verify rate limiting works
- [ ] Check mobile responsiveness
- [ ] Monitor initial API costs
- [ ] Set up billing alerts

## Support

For questions or issues, contact: feedback@preflight.com

## License

Proprietary - All rights reserved