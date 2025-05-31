import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { openRouterKey } = await request.json();

    if (!openRouterKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is required' },
        { status: 400 }
      );
    }

    const prompt = `Generate a creative and fun memecoin concept. Create:
1. A catchy name (2-4 words max)
2. A symbol (3-5 letters, all caps)
3. A fun description (MUST be 255 characters or less, including emojis)

The memecoin should be:
- Funny and internet culture-aware
- Safe for work
- Engaging and meme-worthy
- Crypto/blockchain themed

IMPORTANT: The description must be exactly 255 characters or fewer. Count carefully!

Respond in this exact JSON format:
{
  "name": "coin name here",
  "symbol": "SYMBOL",
  "description": "fun description here (255 chars max)..."
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://memecoin-generator.vercel.app',
        'X-Title': 'Memecoin Generator',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate text content' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 500 }
      );
    }

    // Parse the JSON response from the LLM
    try {
      const memecoinData = JSON.parse(content);
      
      // Validate the required fields
      if (!memecoinData.name || !memecoinData.symbol || !memecoinData.description) {
        throw new Error('Invalid response format');
      }

      return NextResponse.json(memecoinData);
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError);
      
      // Fallback: try to extract data manually if JSON parsing fails
      const nameMatch = content.match(/"name":\s*"([^"]+)"/);
      const symbolMatch = content.match(/"symbol":\s*"([^"]+)"/);
      const descMatch = content.match(/"description":\s*"([^"]+)"/);

      if (nameMatch && symbolMatch && descMatch) {
        return NextResponse.json({
          name: nameMatch[1],
          symbol: symbolMatch[1],
          description: descMatch[1],
        });
      }

      // Ultimate fallback
      return NextResponse.json({
        name: "MoonDoge",
        symbol: "MDOGE",
        description: "A doge that went to the moon and came back with diamond paws! This memecoin represents the spirit of HODLing through thick and thin, with a cute space-traveling doge as our mascot. 🚀🌙",
      });
    }
  } catch (error) {
    console.error('Error generating text:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 