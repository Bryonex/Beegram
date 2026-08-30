import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, CheckCheck, Mic, Play, Pause } from 'lucide-react'
import type { ChatMessage } from '../../../types/messages'
import { messageService } from '../../../services/messageService'
import { gardenService } from '../../../services/gardenService'
import { VoiceRecorder } from '../voice/VoiceRecorder'
import { useCurrentProfile } from '../../../hooks/useCurrentProfile'
import { useAudioPlayer } from '../../../hooks/useAudioPlayer'

// Simple helper component to play voice messages in chat
function ChatVoicePlayer({ msg }: { msg: ChatMessage }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const toggle = () => {
    if (!audioRef.current) return
    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play()
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="flex flex-col gap-2 mt-1 min-w-[180px]">
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="w-8 h-8 shrink-0 bg-white/20 text-current rounded-full flex items-center justify-center">
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>
        <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
          {/* Mock waveform visually */}
          <div className="h-full bg-current w-full opacity-50"></div>
        </div>
        <span className="text-[10px] font-mono opacity-80">{msg.duration_seconds}s</span>
      </div>
      <audio 
        ref={audioRef} 
        src={msg.audio_url} 
        onEnded={() => setIsPlaying(false)} 
        className="hidden" 
      />
    </div>
  )
}

export function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { profile } = useCurrentProfile()
  const { currentTrack, isMiniPlayerMinimized } = useAudioPlayer()
  const currentUserId = profile?.id
  const isMiniPlayerVisible = currentTrack && !isMiniPlayerMinimized

  const loadMessages = async () => {
    if (!profile?.relationship_id) return
    try {
      const data = await messageService.getChatMessages(profile.relationship_id)
      setMessages(data)
    } catch (error) {
      console.error('Failed to load messages:', error)
      showError("Couldn't load messages yet.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [profile?.relationship_id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const showError = (msg: string) => {
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(null), 3000)
  }

  const handleSend = async () => {
    if (!messageText.trim()) return
    if (!profile?.relationship_id || !currentUserId || !profile.partner_id) {
      showError("We couldn't find your relationship yet.")
      return
    }
    const content = messageText.trim()
    
    // Create optimistic message
    const tempId = Date.now().toString()
    const newMsg: ChatMessage = {
      id: tempId,
      relationship_id: profile.relationship_id,
      user_id: currentUserId,
      recipient_id: profile.partner_id,
      message_type: 'text',
      content: content,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, newMsg])
    setMessageText('')

    try {
      const sentMsg = await messageService.sendChatMessage({
        relationship_id: profile.relationship_id,
        user_id: currentUserId,
        recipient_id: profile.partner_id,
        message_type: 'text',
        content: content
      })
      // Unlock First Chat achievement
      gardenService.checkAndUnlockAchievement(
        profile.relationship_id,
        profile.id,
        'Tulip',
        'First Chat',
        'Messages'
      ).catch(console.error)
      
      setMessages(prev => prev.map(m => m.id === tempId ? sentMsg : m))
    } catch (e: any) {
      console.error('Send failed:', e)
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setMessageText(content)
      showError("Couldn't send that yet.")
    }
  }

  const handleSendVoice = async (blob: Blob, duration: number, mimeType: string) => {
    if (!profile?.relationship_id || !currentUserId || !profile.partner_id) {
      throw new Error("We couldn't find your relationship yet.")
    }
    const tempId = Date.now().toString()
    const url = URL.createObjectURL(blob)
    const newMsg: ChatMessage = {
      id: tempId,
      relationship_id: profile.relationship_id,
      user_id: currentUserId,
      recipient_id: profile.partner_id,
      content: '',
      message_type: 'voice',
      audio_url: url,
      duration_seconds: duration,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, newMsg])

      try {
        const storagePath = await messageService.uploadVoiceRecording(profile.relationship_id, currentUserId, blob, mimeType)
        const sentMsg = await messageService.sendChatMessage({
          relationship_id: profile.relationship_id,
          user_id: currentUserId,
          recipient_id: profile.partner_id,
          content: '',
          message_type: 'voice',
          audio_url: storagePath,
          duration_seconds: duration
        })
        
        gardenService.checkAndUnlockAchievement(
          profile.relationship_id,
          profile.id,
          'ForgetMeNot',
          'First Voice Note',
          'Messages'
        ).catch(console.error)
        
        setMessages(prev => prev.map(m => m.id === tempId ? sentMsg : m))
    } catch (e: any) {
      console.error('Failed to send voice message:', e)
      setMessages(prev => prev.filter(m => m.id !== tempId))
      showError("Couldn't send voice note yet.")
      throw e
    }
  }

  return (
    <div className="w-full flex flex-col flex-1 bg-[#f8f9fa] relative pt-2">
      {/* Messages Area */}
      <div className="flex-1 w-full px-4 pb-32 space-y-4">
        {loading ? (
          <div className="w-full py-12 flex justify-center">
             <div className="w-6 h-6 border-2 border-deepPlum/30 border-t-deepPlum rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="w-full py-16 flex flex-col items-center text-center">
            <p className="font-sans text-deepPlum/50 text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user_id === currentUserId
            return (
              <div key={msg.id} className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[80%] relative px-4 py-2.5 shadow-sm flex flex-col
                    ${isOwn 
                      ? 'bg-lavender-dark text-white rounded-[1.2rem] rounded-br-sm' 
                      : 'bg-white text-deepPlum rounded-[1.2rem] rounded-bl-sm border border-blush/20'
                    }
                  `}
                >
                  {msg.content && <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                  {msg.message_type === 'voice' && <ChatVoicePlayer msg={msg} />}
                  <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-white/70' : 'text-deepPlum/40'}`}>
                    <span className="text-[10px] uppercase font-medium tracking-wide">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isOwn && (
                      <span className="ml-0.5">
                        {(!msg.delivered_at && !msg.read_at) && <Check className="w-3 h-3" />}
                        {(msg.delivered_at && !msg.read_at) && <CheckCheck className="w-3 h-3" />}
                        {msg.read_at && <CheckCheck className="w-3 h-3 text-blue-300" />}
                      </span>
                    )}
                  </div>
                </motion.div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div
        className="fixed left-0 right-0 p-3 bg-white/90 backdrop-blur-md border-t border-blush/30 z-40 transition-all flex flex-col"
        style={{ bottom: isMiniPlayerVisible ? 'var(--beegram-composer-offset)' : 'var(--beegram-nav-offset)' }}
      >
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-10 left-0 right-0 text-center"
            >
              <div className="inline-block bg-red-500 text-white text-xs px-3 py-1.5 rounded-full shadow-md">
                {errorMsg}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-end gap-2 max-w-md mx-auto w-full">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 max-h-32 min-h-[44px] bg-warmPaper border border-blush/50 rounded-2xl px-4 py-3 text-[15px] text-deepPlum placeholder-deepPlum/40 focus:outline-none focus:border-lavender-soft focus:ring-1 focus:ring-lavender-soft resize-none shadow-sm"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <button 
            type="button"
            onClick={() => setIsRecording(true)}
            className="w-11 h-11 shrink-0 bg-lavender-soft/20 text-lavender-deep rounded-full flex items-center justify-center transition-colors mb-0.5"
          >
            <Mic className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="w-11 h-11 shrink-0 bg-lavender-dark text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-50 disabled:bg-lavender-mist transition-colors mb-0.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 ml-1" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isRecording && (
          <VoiceRecorder 
            onClose={() => setIsRecording(false)} 
            onSend={async (blob, duration, mimeType) => {
              await handleSendVoice(blob, duration, mimeType)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
