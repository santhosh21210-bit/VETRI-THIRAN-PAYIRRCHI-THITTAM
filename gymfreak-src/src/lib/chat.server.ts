import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

function systemPrompt(profile: unknown): string {
  const base =
    "You are GymFreak Coach, an expert AI fitness and nutrition coach inside the GymFreak app. " +
    "Give concise, motivating, practical advice on training, nutrition, recovery and habit building. " +
    "Use short paragraphs and bullet points. Never give medical diagnoses; suggest seeing a professional for injuries or health concerns.";
  if (!profile) return base;
  return `${base}\n\nThe user's profile: ${JSON.stringify(profile)}. Tailor every answer to this profile.`;
}

export async function handleChat(request: Request) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return Response.json({ error: "AI is not configured yet. Please try again later." }, { status: 500 });
  }

  let body: { messages?: UIMessage[]; profile?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No messages provided." }, { status: 400 });
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: provider.responses(MODEL),
    system: systemPrompt(body.profile),
    messages: modelMessages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({ originalMessages: messages, sendReasoning: false }),
    runIdFetch,
  );
}
