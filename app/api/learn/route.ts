import { NextRequest, NextResponse } from "next/server";
import { ROADMAP } from "@/lib/roadmap";

// Simple in-memory cache so re-opening the same day in one server lifetime doesn't
// re-spend a Groq call. Fine for a single-user tracker; resets on cold start.
const cache = new Map<number, { resources: Resource[]; explanation: string }>();

type Resource = { title: string; url: string; type: string };

export async function POST(req: NextRequest) {
  try {
    const { day } = await req.json();
    if (!day || typeof day !== "number") {
      return NextResponse.json({ error: "day is required" }, { status: 400 });
    }

    const roadmapDay = ROADMAP.find((d) => d.day === day);
    if (!roadmapDay) {
      return NextResponse.json({ error: "Unknown day" }, { status: 404 });
    }

    const cached = cache.get(day);
    if (cached) return NextResponse.json(cached);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured. Add it to .env.local to enable this feature." },
        { status: 500 }
      );
    }

    const prompt = `You are helping a learner on Day ${roadmapDay.day} of a 30-day AI engineer roadmap.
Topic: "${roadmapDay.topic}"
Task for today: "${roadmapDay.miniTask}"

Reply with ONLY valid JSON, no markdown fences, matching this exact shape:
{
  "explanation": "<250-400 word plain-English explanation of the topic and how it connects to the task, written for someone learning it for the first time>",
  "resources": [
    { "title": "<resource name>", "url": "<a real, well-known, working URL>", "type": "<docs|tutorial|video|article>" }
  ]
}
Give 4-6 resources: prefer official docs, freeCodeCamp, MDN, Real Python, YouTube channels (freeCodeCamp.org, Corey Schafer, StatQuest, Andrej Karpathy, 3Blue1Brown), or well-known Medium/dev.to articles — whatever best fits this specific topic. Only use real URLs you are confident exist.`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: "You output only strict JSON, never markdown or prose outside the JSON object." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq API error:", groqRes.status, errText);
      return NextResponse.json({ error: "Failed to fetch learning content from Groq" }, { status: 502 });
    }

    const groqData = await groqRes.json();
    const content = groqData.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Empty response from Groq" }, { status: 502 });
    }

    let parsed: { explanation: string; resources: Resource[] };
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse Groq JSON:", content);
      return NextResponse.json({ error: "Malformed response from Groq" }, { status: 502 });
    }

    const result = {
      explanation: parsed.explanation || "",
      resources: Array.isArray(parsed.resources) ? parsed.resources : [],
    };
    cache.set(day, result);
    return NextResponse.json(result);
  } catch (e) {
    console.error("POST /api/learn failed:", e);
    return NextResponse.json({ error: "Failed to generate learning content" }, { status: 500 });
  }
}
