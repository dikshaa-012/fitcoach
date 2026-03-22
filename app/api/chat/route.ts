import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SYSTEM_PROMPT = `You are FitCoach AI, a knowledgeable, friendly fitness assistant. 
You help users with workout questions, nutrition basics, exercise science, recovery, and motivation.
Keep answers concise (2–4 paragraphs max) unless a detailed breakdown is genuinely needed.
Be encouraging but factual. When you don't know something, say so.`

export async function GET() {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { message, history } = await req.json()

  await supabase.from('chat_messages').insert([{ role: 'user', content: message }])

  const contextMessages = (history || [])
    .slice(-10)
    .map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  contextMessages.push({ role: 'user', parts: [{ text: message }] })

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: contextMessages,
      }),
    }
  )

  const data = await geminiRes.json()

  // LOG THIS — check your terminal running npm run dev
  console.log('Gemini status:', geminiRes.status)
  console.log('Gemini response:', JSON.stringify(data, null, 2))

  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process that.'

  await supabase.from('chat_messages').insert([{ role: 'assistant', content: reply }])

  return NextResponse.json({ reply })
}

export async function DELETE() {
  await supabase.from('chat_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  return NextResponse.json({ success: true })
}