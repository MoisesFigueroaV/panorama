import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()
  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system:
      "Eres un asistente de soporte para la plataforma de eventos. Ayuda a los usuarios y organizadores con sus consultas de manera amable y profesional.",
  })
  return result.toDataStreamResponse()
}
