import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, HeartPulse, Send, Mic } from 'lucide-react'
import { ChatBox } from '../components/messages/chat/ChatBox'
import { LetterList } from '../components/messages/letters/LetterList'
import { BuzzPad } from '../components/messages/buzz/BuzzPad'
import { BuzzReceiver } from '../components/messages/buzz/BuzzReceiver'
import { VoiceNoteList } from '../components/messages/voice/VoiceNoteList'

type Tab = 'Letters' | 'Chat' | 'Buzz' | 'Notes'

export function Messages() {
  const [activeTab, setActiveTab] = useState<Tab>('Letters')

  return (
    <div className="w-full flex flex-col relative opacity-95">
      {/* Base warm blush paper background */}
      <div className="absolute inset-0 bg-[#FFF5F7] -z-10" />

      {/* Header */}
      <div className="px-5 pt-safe pt-6 pb-4 shrink-0">
        <h1 className="text-3xl font-serif text-deepPlum font-medium tracking-tight mb-1">Messages</h1>
        <p className="text-deepPlum/60 text-sm font-sans italic mb-6">"little things we leave for each other"</p>

        {/* Main Tabs */}
        <div className="flex bg-blush/30 p-1.5 rounded-full shadow-inner gap-1">
          {(['Letters', 'Chat', 'Buzz', 'Notes'] as const).map(tab => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-medium transition-all ${
                  isActive 
                    ? 'bg-white text-dustyRose shadow-sm' 
                    : 'text-deepPlum/50 hover:text-deepPlum/70 hover:bg-white/40'
                }`}
              >
                {tab === 'Letters' && <Mail className="w-4 h-4" />}
                {tab === 'Chat' && <Send className="w-4 h-4" />}
                {tab === 'Buzz' && <HeartPulse className="w-4 h-4" />}
                {tab === 'Notes' && <Mic className="w-4 h-4" />}
                <span className="hidden sm:inline">{tab}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col"
          >
            {activeTab === 'Letters' && <LetterList />}
            {activeTab === 'Chat' && <ChatBox />}
            {activeTab === 'Buzz' && <BuzzPad />}
            {activeTab === 'Notes' && <VoiceNoteList />}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <BuzzReceiver />
    </div>
  )
}
