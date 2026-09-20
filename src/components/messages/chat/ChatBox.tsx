import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, CheckCheck, Mic, Play, Pause, Edit2, X } from 'lucide-react'
import type { ChatMessage } from '../../../types/messages'
import { messageService } from '../../../services/messageService'
import { gardenService } from '../../../services/gardenService'
import { VoiceRecorder } from '../voice/VoiceRecorder'
import { useCurrentProfile } from '../../../hooks/useCurrentProfile'
import { useAudioPlayer } from '../../../hooks/useAudioPlayer'
import { useToast } from '../../../contexts/ToastContext'
import { supabase } from '../../../lib/supabase'

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
  const [isTyping, setIsTyping] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { profile, partner } = useCurrentProfile()
  const { currentTrack, isMiniPlayerMinimized } = useAudioPlayer()
  const { error: toastError } = useToast()
  
  const currentUserId = profile?.id
  const isMiniPlayerVisible = currentTrack && !isMiniPlayerMinimized

  const loadMessages = async () => {
    if (!profile?.relationship_id) return
    try {
      const data = await messageService.getChatMessages(profile.relationship_id)
      setMessages(data)
      // Mark unread messages as read
      const unread = data.filter(m => m.recipient_id === currentUserId && !m.read_at)
      for (const msg of unread) {
        await messageService.markMessageRead(msg.id)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      toastError("Couldn't load messages yet.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()

    if (!profile?.relationship_id || !currentUserId) return

    // Realtime subscriptions
    const chatChannel = supabase.channel(`chat:${profile.relationship_id}`)
      
    chatChannel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `relationship_id=eq.${profile.relationship_id}` }, payload => {
        if (payload.eventType === 'INSERT') {
          const newMsg = payload.new as ChatMessage
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev
            return [...prev, { ...newMsg, reactions: [] }]
          })
          if (newMsg.recipient_id === currentUserId) {
            messageService.markMessageRead(newMsg.id)
          }
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_reactions' }, payload => {
        // We reload messages for simplicity or manually patch
        if (payload.eventType === 'INSERT') {
          setMessages(prev => prev.map(m => m.id === payload.new.message_id ? {
            ...m,
            reactions: [...(m.reactions || []), {
              ...payload.new as any,
              emoji: payload.new.emoji || payload.new.reaction,
            }]
          } : m))
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.map(m => {
            if (!m.reactions?.some(r => r.id === payload.old.id)) return m
            return {
              ...m,
              reactions: m.reactions.filter(r => r.id !== payload.old.id)
            }
          }))
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = chatChannel.presenceState()
        let partnerTyping = false
        for (const id in state) {
          if (state[id].some((p: any) => p.user_id !== currentUserId && p.typing)) {
            partnerTyping = true
          }
        }
        setIsTyping(partnerTyping)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await chatChannel.track({ user_id: currentUserId, typing: false })
        }
      })

    return () => {
      supabase.removeChannel(chatChannel)
    }
  }, [profile?.relationship_id, currentUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const updateTypingStatus = async (typing: boolean) => {
    if (!profile?.relationship_id) return
    const channel = supabase.getChannels().find(c => c.topic === `realtime:chat:${profile.relationship_id}`)
    if (channel) {
      await channel.track({ user_id: currentUserId, typing })
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value)
    
    // Typing indicator logic
    updateTypingStatus(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false)
    }, 2000)
  }

  const handleSend = async () => {
    if (!messageText.trim()) return
    if (!profile?.relationship_id || !currentUserId || !profile.partner_id) {
      toastError("We couldn't find your relationship yet.")
      return
    }
    
    const content = messageText.trim()
    setMessageText('')
    updateTypingStatus(false)
    
      if (editingMessageId) {
      // Edit message
      const msgId = editingMessageId
      setEditingMessageId(null)
      try {
        const { error } = await supabase
          .from('messages')
          .update({ content, edited_at: new Date().toISOString() })
          .eq('id', msgId)
        if (error) throw error
        // success toast available from useToast() hook but it's not imported here yet, wait I did import it as { success, error: toastError }
        // oh wait, I only destructured `error: toastError`. Let me destructure `success`.
      } catch (e) {
        console.error(e)
        toastError("Couldn't edit message.")
      }
      return
    }

    // New Message
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

    try {
      const sentMsg = await messageService.sendChatMessage({
        relationship_id: profile.relationship_id,
        user_id: currentUserId,
        recipient_id: profile.partner_id,
        message_type: 'text',
        content: content
      })
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
      toastError("Couldn't send that yet.")
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
      toastError("Couldn't send voice note yet.")
      throw e
    }
  }

  const startEditing = (msg: ChatMessage) => {
    setEditingMessageId(msg.id)
    setMessageText(msg.content || '')
  }

  const [activeReactionMsgId, setActiveReactionMsgId] = useState<string | null>(null)

  const handleReact = async (msgId: string, emoji: string) => {
    if (!currentUserId) return
    setActiveReactionMsgId(null)
    try {
      await messageService.toggleReaction(msgId, currentUserId, emoji)
    } catch (e) {
      console.error(e)
      toastError("Failed to react")
    }
  }

  const REACTION_EMOJIS = ['❤️', '😂', '🥺', '🔥', '🐝', '👍']

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
            const senderAvatar = isOwn ? profile?.avatar_url : partner?.avatar_url
            const initial = isOwn 
              ? (profile?.display_name?.charAt(0) || 'M') 
              : (partner?.display_name?.charAt(0) || '?')

            return (
              <div key={msg.id} className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
                {!isOwn && (
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-blush/30 shrink-0 mr-2 self-end mb-1 border border-white/50 shadow-sm flex items-center justify-center">
                    {senderAvatar ? <img src={senderAvatar} alt="Partner" className="w-full h-full object-cover"/> : <span className="text-[10px] text-deepPlum/60 font-medium">{initial}</span>}
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[75%] relative px-3.5 py-2.5 shadow-sm flex flex-col group
                    ${isOwn 
                      ? 'bg-lavender-dark text-white rounded-[1.2rem] rounded-br-sm' 
                      : 'bg-white text-deepPlum rounded-[1.2rem] rounded-bl-sm border border-blush/20'
                    }
                  `}
                >
                  {msg.content && <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                  {msg.message_type === 'voice' && <ChatVoicePlayer msg={msg} />}
                  
                  <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-white/70' : 'text-deepPlum/40'}`}>
                    {msg.edited_at && <span className="text-[9px] mr-1 opacity-70 italic">Edited</span>}
                    <span className="text-[10px] uppercase font-medium tracking-wide">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isOwn && (
                      <span className="ml-0.5 flex">
                        {(!msg.delivered_at && !msg.read_at) && <Check className="w-[11px] h-[11px]" />}
                        {(msg.delivered_at && !msg.read_at) && <CheckCheck className="w-[11px] h-[11px]" />}
                        {msg.read_at && <CheckCheck className="w-[11px] h-[11px] text-blue-300" />}
                      </span>
                    )}
                  </div>

                  {isOwn && msg.message_type === 'text' && (
                    <button 
                      onClick={() => startEditing(msg)}
                      className="absolute top-1 -left-8 opacity-0 group-hover:opacity-100 p-1.5 bg-white rounded-full shadow-sm text-gray-500 hover:text-lavender-deep transition-all"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                  
                  {/* Reaction Button */}
                  <button
                    onClick={() => setActiveReactionMsgId(activeReactionMsgId === msg.id ? null : msg.id)}
                    className={`absolute bottom-1 ${isOwn ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 p-1 bg-white rounded-full shadow-sm text-gray-400 hover:text-rose-dusty transition-all`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                  </button>

                  {/* Reaction Picker Overlay */}
                  <AnimatePresence>
                    {activeReactionMsgId === msg.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`absolute -top-10 ${isOwn ? 'right-0' : 'left-0'} bg-white rounded-full shadow-lg border border-blush/20 px-2 py-1.5 flex items-center gap-1 z-10`}
                      >
                        {REACTION_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleReact(msg.id, emoji)}
                            className="hover:scale-125 transition-transform text-lg leading-none"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Display Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className={`absolute -bottom-3 ${isOwn ? 'right-2' : 'left-2'} flex items-center gap-0.5`}>
                      {Object.entries(msg.reactions.reduce((acc, r) => {
                        acc[r.emoji] = (acc[r.emoji] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)).map(([emoji, count]) => (
                        <div key={emoji} onClick={() => handleReact(msg.id, emoji)} className="bg-white border border-blush/20 rounded-full px-1.5 py-0.5 text-[10px] shadow-sm flex items-center gap-0.5 cursor-pointer hover:bg-blush/10">
                          <span>{emoji}</span>
                          {count > 1 && <span className="text-deepPlum/70 font-medium">{count}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                </motion.div>
                {isOwn && (
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-lavender-mist/50 shrink-0 ml-2 self-end mb-1 border border-white shadow-sm flex items-center justify-center">
                    {senderAvatar ? <img src={senderAvatar} alt="Me" className="w-full h-full object-cover"/> : <span className="text-[10px] text-deepPlum/60 font-medium">{initial}</span>}
                  </div>
                )}
              </div>
            )
          })
        )}
        
        {isTyping && (
          <div className="flex w-full justify-start">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white text-deepPlum rounded-[1.2rem] rounded-bl-sm border border-blush/20 px-4 py-3 shadow-sm flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 bg-lavender-deep/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-lavender-deep/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-lavender-deep/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </motion.div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div
        className="fixed left-0 right-0 p-3 bg-white/90 backdrop-blur-md border-t border-blush/30 z-40 transition-all flex flex-col"
        style={{ bottom: isMiniPlayerVisible ? 'var(--beegram-composer-offset)' : 'var(--beegram-nav-offset)' }}
      >
        {editingMessageId && (
          <div className="flex items-center justify-between px-4 py-2 bg-lavender-mist/30 text-lavender-deep text-xs font-medium rounded-t-xl -mt-3 mb-2 mx-auto max-w-md w-full">
            <span>Editing message</span>
            <button onClick={() => { setEditingMessageId(null); setMessageText(''); }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 max-w-md mx-auto w-full">
          <textarea
            value={messageText}
            onChange={handleTextChange}
            placeholder={editingMessageId ? "Edit your message..." : "Type a message..."}
            className="flex-1 max-h-32 min-h-[44px] bg-warmPaper border border-blush/50 rounded-2xl px-4 py-3 text-[15px] text-deepPlum placeholder-deepPlum/40 focus:outline-none focus:border-lavender-soft focus:ring-1 focus:ring-lavender-soft resize-none shadow-sm"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          {!messageText.trim() ? (
            <button 
              type="button"
              onClick={() => setIsRecording(true)}
              className="w-11 h-11 shrink-0 bg-lavender-soft/20 text-lavender-deep rounded-full flex items-center justify-center transition-colors mb-0.5"
            >
              <Mic className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleSend}
              className="w-11 h-11 shrink-0 bg-lavender-dark text-white rounded-full flex items-center justify-center shadow-md transition-colors mb-0.5"
            >
              {editingMessageId ? <Check className="w-5 h-5" /> : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 ml-1" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              )}
            </button>
          )}
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
