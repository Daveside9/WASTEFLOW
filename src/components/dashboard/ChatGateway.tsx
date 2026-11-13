import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { X, Send, MessageSquare, Circle } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id:        string
  senderId:  string
  senderName:string
  senderRole:string
  text:      string
  timestamp: string
}

interface Props {
  listingId:    string
  listingTitle: string   // e.g. "Plastic — 120 kg"
  otherUserId:  string
  otherName:    string
  otherRole:    string
  onClose:      () => void
}

const CHAT_KEY = (listingId: string) => `wflow_chat_${listingId}`

function uid() { return Math.random().toString(36).slice(2, 10) }

// ─── Chat Gateway ─────────────────────────────────────────────────────────────

export default function ChatGateway({
  listingId, listingTitle, otherName, otherRole, onClose,
}: Props) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try { return JSON.parse(localStorage.getItem(CHAT_KEY(listingId)) ?? '[]') } catch { return [] }
  })
  const [input,   setInput]   = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Persist messages
  useEffect(() => {
    localStorage.setItem(CHAT_KEY(listingId), JSON.stringify(messages))
  }, [messages, listingId])

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !user) return
    setSending(true)

    const msg: ChatMessage = {
      id:         uid(),
      senderId:   user.id,
      senderName: user.fullName,
      senderRole: user.role,
      text:       input.trim(),
      timestamp:  new Date().toISOString(),
    }
    setMessages(prev => [...prev, msg])
    setInput('')

    // Simulate a reply from the other party after a short delay (demo mode)
    // In production this would be a WebSocket or polling API call
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))
    const autoReplies: Record<string, string[]> = {
      weigher: [
        "Got it, I'll schedule a time to come weigh this.",
        'Can you confirm the exact location again?',
        'I can be there tomorrow morning.',
        'What time works best for you?',
        "I'll bring my certified scale.",
      ],
      seller: [
        'The waste is bagged and ready.',
        'I can meet anytime between 8am and 5pm.',
        'The location is marked on the listing map.',
        'Please let me know when you are on the way.',
        'Everything is sorted on my end.',
      ],
    }
    const pool  = autoReplies[otherRole] ?? autoReplies.weigher
    const reply: ChatMessage = {
      id:         uid(),
      senderId:   'other',
      senderName: otherName,
      senderRole: otherRole,
      text:       pool[Math.floor(Math.random() * pool.length)],
      timestamp:  new Date().toISOString(),
    }
    setMessages(prev => [...prev, reply])
    setSending(false)
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })

  // Group messages by date
  const grouped: { date: string; msgs: ChatMessage[] }[] = []
  messages.forEach(msg => {
    const d = formatDate(msg.timestamp)
    const last = grouped[grouped.length - 1]
    if (last && last.date === d) {
      last.msgs.push(msg)
    } else {
      grouped.push({ date: d, msgs: [msg] })
    }
  })

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center sm:justify-end
                    sm:p-6 pb-0"
         style={{ zIndex: 2000 }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm sm:hidden" onClick={onClose} />

      {/* Chat window */}
      <div className="relative w-full sm:w-[380px] rounded-t-2xl sm:rounded-2xl border border-white/[0.10]
                      flex flex-col shadow-2xl"
           style={{ background: '#0B2233', height: '85vh', maxHeight: 600 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.07] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={15} className="text-teal-light" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[13.5px] font-bold text-white truncate">{otherName}</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal/20 text-teal-light capitalize flex-shrink-0">
                  {otherRole}
                </span>
              </div>
              <p className="text-[11px] text-white/35 truncate">Re: {listingTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-[10.5px] text-green-400">
              <Circle size={6} className="fill-green-400" /> Online
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white cursor-pointer ml-1">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal/10 flex items-center justify-center">
                <MessageSquare size={22} className="text-teal/50" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white/40">Start the conversation</p>
                <p className="text-[12px] text-white/25 mt-0.5">
                  Message {otherName} about this listing
                </p>
              </div>
            </div>
          )}

          {grouped.map(({ date, msgs }) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10.5px] text-white/25 font-medium">{date}</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {msgs.map((msg, i) => {
                const isMe = msg.senderId === user?.id
                const showName = !isMe && (i === 0 || msgs[i - 1]?.senderId !== msg.senderId)
                return (
                  <div key={msg.id} className={`flex flex-col mb-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    {showName && (
                      <p className="text-[10.5px] text-white/30 mb-1 ml-1">{msg.senderName}</p>
                    )}
                    <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed
                                     ${isMe
                                       ? 'bg-teal text-white rounded-br-sm'
                                       : 'bg-white/[0.07] text-white/85 rounded-bl-sm'}`}>
                      {msg.text}
                    </div>
                    <p className={`text-[10px] text-white/20 mt-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                )
              })}
            </div>
          ))}

          {/* Typing indicator */}
          {sending && (
            <div className="flex items-start gap-2 mt-1">
              <div className="bg-white/[0.07] px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={send}
              className="flex items-center gap-2.5 px-4 py-3 border-t border-white/[0.07] flex-shrink-0">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Message ${otherName}…`}
            className="flex-1 bg-white/[0.06] border border-white/[0.09] rounded-xl px-3.5 py-2.5
                       text-[13.5px] text-white placeholder:text-white/25 outline-none
                       focus:border-teal transition-colors"
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-xl bg-teal hover:bg-teal-dark disabled:opacity-40
                       flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
          >
            <Send size={15} className="text-white" />
          </button>
        </form>

        {/* Demo notice */}
        <div className="px-4 pb-3 flex-shrink-0">
          <p className="text-[10px] text-white/20 text-center">
            💬 Demo mode — messages saved locally · Real-time sync available with backend
          </p>
        </div>
      </div>
    </div>
  )
}
