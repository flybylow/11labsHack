import { useState, useCallback, useRef, useEffect } from 'react'
import { useConversation } from '@elevenlabs/react'
import './PawnShopConversation.css'

// ElevenLabs Configuration
// Get yours at: https://elevenlabs.io/app/conversational-ai
const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || ''

const isAgentConfigured = AGENT_ID && AGENT_ID !== 'YOUR_AGENT_ID_HERE' && AGENT_ID.length > 10

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  character?: 'Host' | 'Tony' | 'Emma' | 'Frank'
  timestamp: Date
}

// Character info for display
const CHARACTER_INFO = {
  Host: { emoji: '🎩', title: 'Host', color: '#f8f8f7' },
  Tony: { emoji: '🔧', title: 'Technical Tony', color: '#60a5fa' },
  Emma: { emoji: '📜', title: 'Historical Emma', color: '#f472b6' },
  Frank: { emoji: '💰', title: 'Financial Frank', color: '#4ade80' },
}

export function PawnShopConversation() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)

  // Parse character from XML tags in agent response
  const parseCharacter = (content: string): { character: Message['character'], cleanContent: string } => {
    let character: Message['character'] = 'Host'
    let cleanContent = content

    if (content.includes('<Tony>')) {
      character = 'Tony'
      cleanContent = content.replace(/<Tony>|<\/Tony>/g, '')
    } else if (content.includes('<Emma>')) {
      character = 'Emma'
      cleanContent = content.replace(/<Emma>|<\/Emma>/g, '')
    } else if (content.includes('<Frank>')) {
      character = 'Frank'
      cleanContent = content.replace(/<Frank>|<\/Frank>/g, '')
    }

    return { character, cleanContent: cleanContent.trim() }
  }

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs')
      setError(null)
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs')
    },
    onMessage: (message) => {
      console.log('[ElevenLabs Message]', message)

      if (message.source === 'ai' && message.message) {
        const { character, cleanContent } = parseCharacter(message.message)
        
        setMessages(prev => [...prev, {
          id: `agent-${Date.now()}`,
          role: 'agent',
          content: cleanContent,
          character,
          timestamp: new Date()
        }])
      }

      if (message.source === 'user' && message.message) {
        setMessages(prev => [...prev, {
          id: `user-${Date.now()}`,
          role: 'user',
          content: message.message,
          timestamp: new Date()
        }])
      }
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error)
      const errorMsg = typeof error === 'string' ? error : (error as Error)?.message || 'Connection error'
      setError(errorMsg)
    },
  })

  const { status, isSpeaking } = conversation

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [messages])

  // Start conversation
  const handleStart = async () => {
    try {
      setError(null)
      
      // Check if agent is configured
      if (!isAgentConfigured) {
        setError('Agent ID not configured. See docs/ELEVENLABS_SETUP.md')
        return
      }
      
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Start session with agent ID
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await conversation.startSession({
        agentId: AGENT_ID,
      } as any)
    } catch (err) {
      console.error('Failed to start:', err)
      
      // Provide helpful error messages
      if (err instanceof CloseEvent || (err as any)?.type === 'close') {
        setError('Connection failed. Check your Agent ID in the code.')
      } else if (err instanceof Error) {
        if (err.message.includes('Permission denied') || err.message.includes('NotAllowedError')) {
          setError('Microphone access denied. Please allow microphone access.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Failed to connect. Check Agent ID configuration.')
      }
    }
  }

  // End conversation
  const handleEnd = async () => {
    await conversation.endSession()
  }

  // Send text message
  const handleSendText = useCallback(() => {
    if (!inputValue.trim() || status !== 'connected') return

    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }])

    conversation.sendUserMessage(inputValue)
    setInputValue('')
  }, [inputValue, status, conversation])

  // Handle typing activity
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (status === 'connected') {
      conversation.sendUserActivity()
    }
  }

  // Get current speaker info
  const currentSpeaker = messages.length > 0 && messages[messages.length - 1].role === 'agent'
    ? messages[messages.length - 1].character
    : null

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

  return (
    <div className={`bottom-voice-bar ${isExpanded ? 'expanded' : ''}`}>
      {/* Expanded Transcript */}
      {isExpanded && (
        <div className="transcript-panel">
          <div className="transcript-header">
            <span>Conversation</span>
            <button onClick={() => setMessages([])}>Clear</button>
          </div>
          <div className="transcript-messages" ref={transcriptRef}>
            {messages.length === 0 ? (
              <div className="empty-transcript">
                <p>Ask the experts about the 1960s Danish chair</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`msg ${msg.role}`}>
                  {msg.character && (
                    <span className="msg-char" style={{ color: CHARACTER_INFO[msg.character].color }}>
                      {CHARACTER_INFO[msg.character].emoji} {msg.character}
                    </span>
                  )}
                  <p>{msg.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="bar-content">
        {/* Expert Avatars */}
        <div className="experts">
          {Object.entries(CHARACTER_INFO).map(([key, info]) => (
            <div 
              key={key} 
              className={`expert ${isSpeaking && currentSpeaker === key ? 'speaking' : ''} ${status === 'connected' ? 'active' : ''}`}
              title={info.title}
            >
              <span className="expert-emoji">{info.emoji}</span>
              <span className="expert-name">{key}</span>
            </div>
          ))}
        </div>

        {/* Status & Current Message */}
        <div className="center-section" onClick={() => setIsExpanded(!isExpanded)}>
          {error ? (
            <div className="status-error">⚠️ {error}</div>
          ) : status === 'connected' ? (
            <div className="current-message">
              {isSpeaking && currentSpeaker ? (
                <span className="speaking-indicator">
                  <span className="speaker-badge" style={{ color: CHARACTER_INFO[currentSpeaker].color }}>
                    {CHARACTER_INFO[currentSpeaker].emoji} {currentSpeaker}
                  </span>
                  <span className="speaking-text">speaking...</span>
                </span>
              ) : lastMessage ? (
                <span className="last-message">
                  {lastMessage.role === 'agent' && lastMessage.character && (
                    <span style={{ color: CHARACTER_INFO[lastMessage.character].color }}>
                      {CHARACTER_INFO[lastMessage.character].emoji}
                    </span>
                  )}
                  {lastMessage.content.length > 60 
                    ? lastMessage.content.substring(0, 60) + '...' 
                    : lastMessage.content}
                </span>
              ) : (
                <span className="listening">🎤 Listening... Speak or type below</span>
              )}
            </div>
          ) : (
            <div className="disconnected-hint">
              {isAgentConfigured 
                ? 'Click Start to talk with our experts about the chair'
                : '⚙️ Configure your ElevenLabs Agent ID to enable voice AI'}
            </div>
          )}
          <button className="expand-btn">{isExpanded ? '▼' : '▲'}</button>
        </div>

      {/* Controls */}
      <div className="controls">
        {status === 'connected' && (
          <div className="input-group">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              placeholder="Type a question..."
            />
            <button className="send-btn" onClick={handleSendText} disabled={!inputValue.trim()}>
              ↑
            </button>
          </div>
        )}
        
        {status === 'disconnected' ? (
          isAgentConfigured ? (
            <button className="connect-btn" onClick={handleStart}>
              🎤 Start
            </button>
          ) : (
            <button className="setup-btn" onClick={() => setError('Set AGENT_ID in PawnShopConversation.tsx')}>
              ⚙️ Setup Required
            </button>
          )
        ) : (
          <button className="disconnect-btn" onClick={handleEnd}>
            ⏹ End
          </button>
        )}
      </div>
      </div>
    </div>
  )
}

export default PawnShopConversation
