import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { falAiKey, prompt } = await request.json();

    if (!falAiKey || !prompt) {
      return NextResponse.json(
        { error: 'Fal AI key and prompt are required' },
        { status: 400 }
      );
    }

    // Enhanced prompt for better memecoin mascot generation
    const enhancedPrompt = `${prompt} Professional digital art, high quality, colorful, cartoon style, friendly mascot character, crypto currency theme, clean background, 1024x1024 resolution, perfect for a token logo`;

    console.log('Generating image with prompt:', enhancedPrompt);

    // Using Fal AI's FLUX model for image generation
    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        image_size: 'square_hd',
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Fal AI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.images || !data.images[0] || !data.images[0].url) {
      console.error('Invalid Fal AI response:', data);
      return NextResponse.json(
        { error: 'No image generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl: data.images[0].url,
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 