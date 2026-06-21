import { NextResponse } from "next/server";
import { parseTextWithRegex } from "@/features/deals/model/parser";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Teks tidak valid" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback to regex
      const parsed = parseTextWithRegex(text);
      return NextResponse.json({ success: true, data: parsed, source: "regex" });
    }

    // Call Gemini REST API
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: "You are a professional transaction assistant. Analyze informal deal or chat text in Indonesian (and slang) and extract structured escrow deal details.",
                },
              ],
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `Analyze this deal chat/text and extract the parameters: "${text}"`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  dealType: {
                    type: "STRING",
                    enum: ["Service", "DigitalGoods"],
                  },
                  title: { type: "STRING" },
                  amount: { type: "STRING" },
                  deadlineDays: { type: "INTEGER" },
                  deliverable: { type: "STRING" },
                  revisionLimit: { type: "INTEGER" },
                },
                required: [
                  "dealType",
                  "title",
                  "amount",
                  "deadlineDays",
                  "deliverable",
                  "revisionLimit",
                ],
              },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const resData = await response.json();
      const contentText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!contentText) {
        throw new Error("No content received from Gemini");
      }

      const parsedGemini = JSON.parse(contentText);
      return NextResponse.json({
        success: true,
        data: {
          dealType: parsedGemini.dealType || "Service",
          title: parsedGemini.title || "Jasa Pengerjaan",
          amount: String(parsedGemini.amount || "0"),
          deadlineDays: Number(parsedGemini.deadlineDays ?? 3),
          deliverable: parsedGemini.deliverable || "Final file / Link Github",
          revisionLimit: Number(parsedGemini.revisionLimit ?? 0),
        },
        source: "gemini",
      });
    } catch (apiError) {
      console.error("Gemini parse failed, falling back to regex:", apiError);
      const parsed = parseTextWithRegex(text);
      return NextResponse.json({ success: true, data: parsed, source: "regex" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
