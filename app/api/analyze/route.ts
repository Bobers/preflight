import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Redis } from '@upstash/redis';
import { z } from 'zod';
import type { AnalysisResult } from '@/types';
import { apiCircuitBreaker } from '@/utils/circuitBreaker';
import { performanceMonitor } from '@/utils/performanceMonitor';

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
  const startTime = Date.now();
  
  try {
    // Check rate limit
    const clientIP = getClientIP(request);
    const withinLimit = await checkRateLimit(clientIP);
    
    if (!withinLimit) {
      performanceMonitor.recordRequest(Date.now() - startTime, false);
      return NextResponse.json(
        { success: false, error: 'Whoa, slow down there, dude. Too many requests. Take a breather and try again later.' },
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
    const systemPrompt = `You are a ruthless business analyst asking "WHERE'S THE MONEY?" for every claim. 

Your job: Find statements that make assumptions about MONEY FLOW without evidence.

Focus on these critical money assumptions:
- WHO will pay (customer assumptions)
- HOW MUCH they'll pay (pricing assumptions) 
- WHEN they'll pay (timeline assumptions)
- HOW MANY will pay (market size assumptions)
- WHAT it costs to deliver (operational assumptions)
- HOW LONG money lasts (burn rate assumptions)

For each assumption found:
1. Extract EXACT quote (verbatim, character-for-character)
2. Classify risk:
   - critical: Could kill the business if wrong
   - important: Significantly impacts profitability  
   - minor: Small financial impact
3. Explain the money risk in max 20 words

Return JSON:
{
  "assumptions": [
    {
      "text": "exact quote from input",
      "risk_level": "critical|important|minor", 
      "reasoning": "why this money assumption is risky"
    }
  ]
}

Focus on 5-10 key MONEY assumptions. Ignore non-financial assumptions. If no money assumptions found, return empty array.

Remember: Every assumption should answer "Where's the money?" or "Where's the money going?"`;

    // Call OpenAI API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const completion = await apiCircuitBreaker.execute(async () => 
        openai.chat.completions.create({
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
        })
      );

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

      // Record successful request
      const duration = Date.now() - startTime;
      performanceMonitor.recordRequest(duration, true);
      
      // Log metrics periodically
      if (Math.random() < 0.1) { // 10% chance to log
        performanceMonitor.logMetrics();
      }

      return NextResponse.json({
        success: true,
        data: result,
      });

    } catch (error) {
      clearTimeout(timeout);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'That took way too long, man. Analysis timed out. Try again with maybe a shorter plan?' },
          { status: 504 }
        );
      }
      
      throw error;
    }

  } catch (error) {
    console.error('API error:', error);
    
    // Record failed request
    const duration = Date.now() - startTime;
    performanceMonitor.recordRequest(duration, false);
    
    // Handle circuit breaker open state
    if (error instanceof Error && error.message.includes('Circuit breaker is OPEN')) {
      return NextResponse.json(
        { success: false, error: 'The lane\'s closed, dude. Service temporarily unavailable. Please try again in a minute.' },
        { status: 503 }
      );
    }
    
    // Handle specific OpenAI errors
    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      return NextResponse.json(
        { success: false, error: 'The AI is taking a coffee break, man. Please try again in a moment.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Something went wrong with the analysis, dude. Sometimes shit happens. Please try again.' },
      { status: 500 }
    );
  }
}