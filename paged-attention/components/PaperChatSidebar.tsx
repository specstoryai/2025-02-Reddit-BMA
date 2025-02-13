'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Loader2 } from 'lucide-react'

export function PaperChatSidebar() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Add AI response
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Error in chat:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. Please try again.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <aside className="fixed right-0 top-0 h-screen w-96 border-l border-gray-200 bg-white p-4 shadow-lg flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Paper Chat</h2>
        <p className="text-sm text-gray-500">Ask questions about the research paper</p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-auto mb-4">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <Card key={i} className={`p-3 ${message.role === 'assistant' ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <div className="text-sm font-medium mb-1">
                {message.role === 'assistant' ? 'AI' : 'You'}
              </div>
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the paper..."
          className="w-full p-2 border border-gray-200 rounded-md resize-none h-24"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Thinking...
            </>
          ) : (
            'Send'
          )}
        </Button>
      </form>
    </aside>
  )
} 