/**
 * @jest-environment node
 */

// Mock modules before imports
jest.mock('openai');
jest.mock('@upstash/redis');

describe('Verbatim Quote Extraction Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up environment variables
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
  });

  it('should extract verbatim quotes that match exactly with source text', async () => {
    const testText = `Our revolutionary product will capture 50% of the market within one year. 
    We expect zero competition because our technology is completely unique. 
    Customer acquisition will cost nothing due to viral growth.`;

    const mockAssumptions = [
      {
        text: "will capture 50% of the market within one year",
        risk_level: "critical",
        reasoning: "Extremely aggressive market share projection"
      },
      {
        text: "We expect zero competition",
        risk_level: "critical", 
        reasoning: "Unrealistic competitive assessment"
      },
      {
        text: "Customer acquisition will cost nothing",
        risk_level: "important",
        reasoning: "Overly optimistic CAC assumption"
      }
    ];

    // Mock Redis
    const { Redis } = require('@upstash/redis');
    Redis.mockImplementation(() => ({
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(true)
    }));

    // Mock OpenAI
    const OpenAI = require('openai').default;
    OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({ assumptions: mockAssumptions })
              }
            }]
          })
        }
      }
    }));

    // Import after mocks
    const { POST } = await import('@/app/api/analyze/route');
    const { NextRequest } = await import('next/server');

    // Create request
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1'
      },
      body: JSON.stringify({ text: testText })
    });

    // Call API
    const response = await POST(request);
    const data = await response.json();

    // Verify response structure
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.assumptions).toHaveLength(3);

    // CRITICAL: Verify each quote exists verbatim in source text
    data.data.assumptions.forEach((assumption: any) => {
      const quoteExistsInSource = testText.includes(assumption.text);
      expect(quoteExistsInSource).toBe(true);
      
      // Verify exact match (not paraphrased)
      const extractedText = testText.substring(
        testText.indexOf(assumption.text),
        testText.indexOf(assumption.text) + assumption.text.length
      );
      expect(extractedText).toBe(assumption.text);
    });

    // Verify summary counts
    expect(data.data.summary.total).toBe(3);
    expect(data.data.summary.critical).toBe(2);
    expect(data.data.summary.important).toBe(1);
    expect(data.data.summary.minor).toBe(0);
  });

  it('should return empty assumptions for nonsense input', async () => {
    const nonsenseText = "a".repeat(100); // Valid length but nonsense

    // Mock Redis
    const { Redis } = require('@upstash/redis');
    Redis.mockImplementation(() => ({
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(true)
    }));

    // Mock OpenAI returning empty assumptions
    const OpenAI = require('openai').default;
    OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({ assumptions: [] })
              }
            }]
          })
        }
      }
    }));

    const { POST } = await import('@/app/api/analyze/route');
    const { NextRequest } = await import('next/server');

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1'
      },
      body: JSON.stringify({ text: nonsenseText })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.assumptions).toHaveLength(0);
    expect(data.data.summary.total).toBe(0);
  });

  it('should enforce character limits', async () => {
    // Mock Redis
    const { Redis } = require('@upstash/redis');
    Redis.mockImplementation(() => ({
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(true)
    }));

    const { POST } = await import('@/app/api/analyze/route');
    const { NextRequest } = await import('next/server');

    // Test too short (< 100 chars)
    const shortRequest = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1'
      },
      body: JSON.stringify({ text: 'Too short' })
    });

    const shortResponse = await POST(shortRequest);
    const shortData = await shortResponse.json();
    
    expect(shortResponse.status).toBe(400);
    expect(shortData.success).toBe(false);
    expect(shortData.error).toContain('at least 100 characters');

    // Test too long (> 10000 chars)
    const longRequest = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1'
      },
      body: JSON.stringify({ text: 'a'.repeat(10001) })
    });

    const longResponse = await POST(longRequest);
    const longData = await longResponse.json();
    
    expect(longResponse.status).toBe(400);
    expect(longData.success).toBe(false);
    expect(longData.error).toContain('exceeds maximum length');
  });

  it('should handle rate limiting', async () => {
    // Mock Redis to simulate rate limit exceeded
    const { Redis } = require('@upstash/redis');
    Redis.mockImplementation(() => ({
      incr: jest.fn().mockResolvedValue(11), // Over limit
      expire: jest.fn().mockResolvedValue(true)
    }));

    const { POST } = await import('@/app/api/analyze/route');
    const { NextRequest } = await import('next/server');

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1'
      },
      body: JSON.stringify({ text: 'a'.repeat(100) })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Too many requests');
  });
});