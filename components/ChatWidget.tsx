'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load persisted chat history
  const loadHistory = useCallback(async () => {
    if (historyLoaded) return
    const res = await fetch('/api/chat')
    if (res.ok) {
      const data = await res.json()
      setMessages(data)
    }
    setHistoryLoaded(true)
  }, [historyLoaded])

  useEffect(() => {
    if (open) {
      loadHistory()
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, loadHistory])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: trimmed,
        history: messages,
      }),
    })

    const data = await res.json()
    setLoading(false)

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: data.reply || 'Sorry, something went wrong.',
    }
    setMessages(prev => [...prev, botMsg])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearHistory = async () => {
    await fetch('/api/chat', { method: 'DELETE' })
    setMessages([])
  }

  const SUGGESTIONS = [
    'How many calories does 30 mins of cycling burn?',
    "What's a good beginner workout routine?",
    'I haven\'t worked out in 3 days, what should I do?',
  ]

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-brand-500 text-[#0a0a0f] shadow-lg hover:bg-brand-600 transition-all z-50 flex items-center justify-center text-2xl hover:scale-110 active:scale-95"
        style={{ boxShadow: '0 4px 30px rgba(34,197,94,0.4)' }}
        aria-label="Open fitness chatbot"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 w-[340px] sm:w-[400px] rounded-2xl overflow-hidden z-50 flex flex-col shadow-2xl animate-slide-up"
          style={{
            height: '520px',
            background: '#111118',
            border: '1px solid #1a1a24',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(34,197,94,0.1)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a24] bg-[#0a0a0f]">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <p className="text-sm font-semibold text-white">FitCoach AI</p>
                <p className="text-[10px] text-brand-400">Ask me anything fitness</p>
              </div>
            </div>
            <button
              onClick={clearHistory}
              className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors px-2 py-1 rounded hover:bg-[#1a1a24]"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && !loading && (
              <div className="space-y-3">
                <p className="text-center text-xs text-gray-600 pt-4">Your AI fitness coach. Ask me anything!</p>
                <div className="space-y-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(s); inputRef.current?.focus() }}
                      className="w-full text-left text-xs text-gray-400 bg-[#0a0a0f] border border-[#1a1a24] rounded-lg px-3 py-2 hover:border-brand-500/40 hover:text-gray-200 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-500 text-[#0a0a0f] font-medium rounded-br-sm'
                      : 'bg-[#1a1a24] text-gray-200 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a24] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#1a1a24] bg-[#0a0a0f] flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a fitness question..."
              className="input-field flex-1 text-sm py-2"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="btn-primary py-2 px-3 disabled:opacity-40 text-sm"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
