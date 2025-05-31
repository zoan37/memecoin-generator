import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { openRouterKey, theme, writingStyle, model, usingDefaultKeys } = await request.json();

    // Use environment variable as fallback
    const effectiveKey = openRouterKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    const selectedModel = model || 'anthropic/claude-3.5-sonnet'; // fallback to Claude 3.5 Sonnet

    if (!effectiveKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is required' },
        { status: 400 }
      );
    }

    // Log when using default keys (for monitoring purposes)
    if (usingDefaultKeys) {
      console.log(`Using default OpenRouter API key with model: ${selectedModel}`);
    }

    const basePrompt = `Generate a creative and fun memecoin concept. Create:
1. A catchy name (2-4 words max)
2. A symbol (3-5 letters, all caps)
3. A fun description (MUST be 255 characters or less, including emojis)
4. A visual description for the token image (this will be used in a Fal AI image generation prompt - describe what the image should look like, focusing on visual elements, colors, objects, composition. The image is for a memecoin but doesn't need to show actual coins or tokens - focus on the meme/theme itself)`;

    const standardConstraints = !theme ? `

The memecoin should be:
- Funny and internet culture-aware
- Safe for work
- Engaging and meme-worthy
- Crypto/blockchain themed` : '';

    const themePrompt = theme 
      ? `

The memecoin should be themed around: ${theme} (incorporate this theme creatively into the concept)`
      : '';

    const stylePrompt = writingStyle 
      ? `

WRITING TONE/STYLE: Write the memecoin name, description, and overall concept with a ${writingStyle} tone and style. Make sure the personality and voice matches this style throughout.`
      : '';

    const prompt = `${basePrompt}${standardConstraints}${themePrompt}${stylePrompt}

IMPORTANT: The description must be exactly 255 characters or fewer. Count carefully!
IMPORTANT: The visual description will be used in a Fal AI prompt, so focus ONLY on what should be in the image (objects, colors, composition, mood) - do NOT include artistic style terms like "cartoon", "photorealistic", "oil painting", etc. The image represents the memecoin's theme/meme but doesn't need to show actual coins or tokens.

Respond in this exact JSON format:
{
  "name": "coin name here",
  "symbol": "SYMBOL",
  "description": "fun description here (255 chars max)...",
  "visualDescription": "detailed visual description for Fal AI image generation (no style information, focus on the meme/theme)..."
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${effectiveKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://memecoin-generator.vercel.app',
        'X-Title': 'Memecoin Generator',
      },
      body: JSON.stringify({
        model: selectedModel,
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
      if (!memecoinData.name || !memecoinData.symbol || !memecoinData.description || !memecoinData.visualDescription) {
        throw new Error('Invalid response format');
      }

      return NextResponse.json(memecoinData);
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError);
      
      // Fallback: try to extract data manually if JSON parsing fails
      const nameMatch = content.match(/"name":\s*"([^"]+)"/);
      const symbolMatch = content.match(/"symbol":\s*"([^"]+)"/);
      const descMatch = content.match(/"description":\s*"([^"]+)"/);
      const visualDescMatch = content.match(/"visualDescription":\s*"([^"]+)"/);

      if (nameMatch && symbolMatch && descMatch && visualDescMatch) {
        return NextResponse.json({
          name: nameMatch[1],
          symbol: symbolMatch[1],
          description: descMatch[1],
          visualDescription: visualDescMatch[1],
        });
      }

      // Failed to parse response
      return NextResponse.json(
        { error: 'Failed to parse LLM response as valid JSON' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating text:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 