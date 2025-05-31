import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { falAiKey, prompt, usingDefaultKeys } = await request.json();

    // Use environment variable as fallback
    const effectiveKey = falAiKey || process.env.NEXT_PUBLIC_FAL_API_KEY;

    if (!effectiveKey || !prompt) {
      return NextResponse.json(
        { error: 'Fal AI key and prompt are required' },
        { status: 400 }
      );
    }

    // Log when using default keys (for monitoring purposes)
    if (usingDefaultKeys) {
      console.log('Using default Fal AI API key');
    }

    console.log('Generating image with prompt:', prompt);

    // Using Fal AI's FLUX model for image generation
    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${effectiveKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
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