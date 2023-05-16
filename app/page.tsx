"use client";

import { Repeater } from "@repeaterjs/repeater"
import { EventSourceMessage, FetchEventSourceInit, fetchEventSource } from "@microsoft/fetch-event-source"

import { SpeechRecognitionDisplay } from "./voice"

interface Message {
  role: "user" | "assistant" | "system"
  content: string | null
  id: number
}

let OPENAI_API_KEY = "fake"

async function openai<T>(path: string, data: T) {
  const response = await fetch(
    `https://api.openai.com/${path}`, openaiRequestInit(data))

  return await response.json()
}

function openaiRequestInit<T>(data: T) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(data),
  }
}

function fetchEventStream(
  input: RequestInfo, init?: FetchEventSourceInit
): AsyncIterableIterator<EventSourceMessage> {
  return new Repeater(async (push, stop) => {
    await fetchEventSource(input, {
      ...init,
      onmessage: (event) => {
        push(event)
      },
      onerror: (event) => {
        stop(event)
      },
    })
  })
}

async function chat(messages: Message[]): Promise<Message> {
  const result = await openai("v1/chat/completions", {
    model: "gpt-4",
    messages: messages.map((message) => ({
      content: message.content,
      role: message.role,
    }))
  })

  return {
    ...result["choices"][0]["message"],
    id: messages.length,
  }
}

async function* chatWithStreamingAnswer(
  messages: Message[]
): AsyncGenerator<string> {
  const eventStream = fetchEventStream(
    "https://api.openai.com/v1/chat/completions",
    openaiRequestInit({
      model: "gpt-4",
      messages: messages.map(({ content, role }) => ({ content, role })),
      stream: true,
    }));

  for await (const event of eventStream) {
    const content = parseEventDataContent(event.data);
    if (content === "[DONE]") break;
    if (content) yield content;
  }

  console.log("done");
}

function parseEventDataContent(data: string): string | undefined {
  if (data === "[DONE]") return data;

  const parsedData = JSON.parse(data);
  return parsedData.choices[0]?.delta?.content;
}

// const defaultMessages = [
//   {
//     role: "system",
//     content: "You are an assistant.",
//     id: 0,
//   },
// ]

// const extensions = [
//   markdown({
//     base: markdownLanguage,
//   }),
// ]

export default function Page() {
  return (
    <div className="p-2 mx-auto">
      <SpeechRecognitionDisplay />
    </div>
  )
}