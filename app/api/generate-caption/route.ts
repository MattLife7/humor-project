import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

function cleanCaption(text: string) {
  return text.trim().replace(/^["']|["']$/g, "");
}

function getStatusFromError(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const maybeError = error as {
    status?: number;
    rawResponse?: {
      status?: number;
    };
  };

  return (
    maybeError.status ??
    maybeError.rawResponse?.status ??
    null
  );
}

function getRetryAfter(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const maybeError = error as {
    rawResponse?: {
      headers?: {
        get?: (name: string) => string | null;
      };
    };
  };

  const value =
    maybeError.rawResponse?.headers?.get?.("retry-after");

  if (!value) {
    return null;
  }

  const seconds = Number(value);

  return Number.isFinite(seconds) ? seconds : null;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const { imageUrl, mimeType, context } =
      await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing image URL." },
        { status: 400 }
      );
    }

    const promptUsed = `
You write funny food roasts for a social app called Rate My Bite.

Look carefully at the uploaded food photo and write ONE short joke or roast
that is specifically about what is visible in the image.

Audience:
Chronically-online Columbia students in New York City.

Rules:
- The joke must relate specifically to the image.
- Be witty, observational, and concise.
- Prefer dry, internet-native humor over generic puns.
- Maximum 18 words.
- One sentence only.
- No hashtags.
- No quotation marks.
- No explanation.
- Do not mention being an AI.
- Keep it playful rather than cruel.
${context ? `Additional context from the user: ${context}` : ""}

Return only the final caption.
    `.trim();

    const result = await ai.interactions.create({
      model: "gemini-3.5-flash-lite",

      generation_config: {
        thinking_level: "low",
      },

      system_instruction:
        "Return only the final caption text.",

      input: [
        {
          type: "text",
          text: promptUsed,
        },
        {
          type: "image",
          uri: imageUrl,
          mime_type: mimeType || "image/jpeg",
        },
      ],
    });

    const caption = cleanCaption(
      result.output_text ||
        "This meal has seen better semesters."
    );

    return NextResponse.json({
      caption,
      promptUsed,
    });
  } catch (error) {
    console.error("Caption generation failed:", error);

    const status = getStatusFromError(error);
    const retryAfter = getRetryAfter(error);

    if (status === 503) {
      return NextResponse.json(
        {
          error:
            "The kitchen is slammed right now. Your meal is safe — give the roast another shot.",
          retryable: true,
          retryAfter,
        },
        { status: 503 }
      );
    }

    if (status === 429) {
      return NextResponse.json(
        {
          error:
            "Too many orders hit the kitchen at once. Your meal is safe — try the roast again in a moment.",
          retryable: true,
          retryAfter,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Something went wrong in the kitchen.",
        retryable: false,
      },
      { status: 500 }
    );
  }
}