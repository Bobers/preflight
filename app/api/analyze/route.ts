import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Redis } from '@upstash/redis';
import { z } from 'zod';
import type { AnalysisResult } from '@/types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Schema for validating AI response
const AssumptionSchema = z.object({
  text: z.string(),
  risk_level: z.enum(['critical', 'important', 'minor']),
  reasoning: z.string().max(100), // Ensure reasoning is concise
});

const AIResponseSchema = z.object({
  assumptions: z.array(AssumptionSchema),
});

// Rate limiting function
async function checkRateLimit(ip: string): Promise<boolean> {
  const key = `rate_limit:${ip}`;
  const limit = 10; // 10 requests per hour
  const window = 3600; // 1 hour in seconds

  try {
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, window);
    }
    
    return current <= limit;
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Allow request if rate limiting fails
    return true;
  }
}

// Get client IP from request
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIP = getClientIP(request);
    const withinLimit = await checkRateLimit(clientIP);
    
    if (!withinLimit) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Window': '3600',
          }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { text } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid input. Please provide text to analyze.' },
        { status: 400 }
      );
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Text exceeds maximum length of 10,000 characters.' },
        { status: 400 }
      );
    }

    if (text.length < 100) {
      return NextResponse.json(
        { success: false, error: 'Text must be at least 100 characters long.' },
        { status: 400 }
      );
    }

    // Create prompt for OpenAI
    const systemPrompt = `You are an expert business analyst who identifies hidden assumptions in business plans. Your task is to:

1. Read the business plan text carefully
2. Identify statements that contain assumptions (claims without evidence, projections, market beliefs)
3. Extract the EXACT quote from the text (verbatim, character-for-character)
4. Classify each assumption's risk level:
   - critical: Fundamental assumptions that could invalidate the entire business
   - important: Significant assumptions that affect major aspects
   - minor: Small assumptions with limited impact
5. Provide brief reasoning (max 20 words) explaining the risk

Return a JSON object with an "assumptions" array. Each assumption should have:
- text: The exact quote from the input (must be a substring that exists in the original text)
- risk_level: "critical", "important", or "minor"
- reasoning: Brief explanation (max 20 words)

Focus on identifying 5-10 key assumptions. If the text contains no identifiable assumptions or is nonsensical, return an empty assumptions array.`;

    // Call OpenAI API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 2000,
      }, {
        signal: controller.signal as AbortSignal,
      });

      clearTimeout(timeout);

      const aiResponse = completion.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // Parse and validate AI response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        throw new Error('Invalid response format from AI');
      }

      // Validate with Zod
      let validatedData;
      try {
        validatedData = AIResponseSchema.parse(parsedResponse);
      } catch (zodError) {
        console.error('Validation error:', zodError);
        // Return empty assumptions if validation fails
        validatedData = { assumptions: [] };
      }

      // Calculate summary
      const summary = {
        total: validatedData.assumptions.length,
        critical: validatedData.assumptions.filter(a => a.risk_level === 'critical').length,
        important: validatedData.assumptions.filter(a => a.risk_level === 'important').length,
        minor: validatedData.assumptions.filter(a => a.risk_level === 'minor').length,
      };

      const result: AnalysisResult = {
        assumptions: validatedData.assumptions,
        summary,
      };

      return NextResponse.json({
        success: true,
        data: result,
      });

    } catch (error) {
      clearTimeout(timeout);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Analysis took too long. Please try again.' },
          { status: 504 }
        );
      }
      
      throw error;
    }

  } catch (error) {
    console.error('API error:', error);
    
    // Handle specific OpenAI errors
    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      return NextResponse.json(
        { success: false, error: 'AI service is currently busy. Please try again in a moment.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'An error occurred during analysis. Please try again.' },
      { status: 500 }
    );
  }
}