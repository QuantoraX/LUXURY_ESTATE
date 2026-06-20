import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FaPaperPlane, FaUserCircle, FaBuilding, FaComments, FaCalendarAlt, FaTrash } from 'react-icons/fa'
import { chatApi, getImageUrl, userApi } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useCurrency } from '../../context/CurrencyContext'
import toast from 'react-hot-toast'

export default function Inbox() {
  const { user } = useAuth()
  const { formatPrice } = useCurrency()
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [startingChatWithAdmin, setStartingChatWithAdmin] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleChatWithAdmin = async () => {
    try {
      setStartingChatWithAdmin(true)
      const adminRes = await userApi.getAdmin()
      const adminId = adminRes?.data?._id || adminRes?.data?.id
      
      if (!adminId) {
        toast.error('Admin support accounts are currently offline.')
        return
      }

      const res = await chatApi.startConversation({
        recipientId: adminId
      })

      if (res?.success) {
        toast.success('Admin support chat loaded!')
        const freshRes = await chatApi.getConversations()
        const freshList = freshRes?.data || []
        setConversations(freshList)
        const targetChat = freshList.find(c => c._id === res.data._id)
        if (targetChat) {
          setActiveChat(targetChat)
        } else if (res.data) {
          setActiveChat(res.data)
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to start support conversation.')
    } finally {
      setStartingChatWithAdmin(false)
    }
  }
  
  const chatContainerRef = useRef(null)
  const pollingIntervalRef = useRef(null)

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm('Are you sure you want to delete this conversation? This will permanently delete all messages in this thread for both participants.')) {
      return
    }

    try {
      const res = await chatApi.deleteConversation(chatId)
      if (res?.success) {
        toast.success('Conversation deleted successfully')
        setActiveChat(null)
        setMessages([])
        loadConversations()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete conversation.')
    }
  }

  // Load user conversations on mount
  useEffect(() => {
    loadConversations()
    return () => stopPolling()
  }, [])

  // Poll for messages in the active conversation
  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat._id, false) // load initially without resetting screen states
      startPolling(activeChat._id)
    } else {
      stopPolling()
      setMessages([])
    }
    return () => stopPolling()
  }, [activeChat])

  // Scroll to bottom when messages array changes
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    try {
      setLoadingConversations(true)
      const res = await chatApi.getConversations()
      const list = res?.data || []
      setConversations(list)
      
      // If there's an active chat, synchronize its state with the fresh list
      if (activeChat) {
        const freshActive = list.find(c => c._id === activeChat._id)
        if (freshActive) setActiveChat(freshActive)
      }
    } catch (err) {
      console.error('Failed to load conversations:', err.message)
    } finally {
      setLoadingConversations(false)
    }
  }

  const loadMessages = async (chatId, showLoading = true) => {
    if (showLoading) setLoadingMessages(true)
    try {
      const res = await chatApi.getMessages(chatId)
      setMessages(res?.data || [])
    } catch (err) {
      console.error('Failed to load messages:', err.message)
    } finally {
      if (showLoading) setLoadingMessages(false)
    }
  }

  const startPolling = (chatId) => {
    stopPolling()
    pollingIntervalRef.current = setInterval(() => {
      loadMessages(chatId, false)
    }, 4000) // Poll every 4 seconds
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat) return

    try {
      setSending(true)
      const text = newMessage.trim()
      setNewMessage('') // Clear field instantly
      
      const res = await chatApi.sendMessage(activeChat._id, text)
      if (res?.success) {
        setMessages(prev => [...prev, res.data])
        // Refresh conversations preview
        loadConversations()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  const getRecipient = (conv) => {
    const currentUserId = user?._id || user?.id
    return conv.participants.find(p => p._id !== currentUserId) || {}
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-soft h-[600px] flex flex-col md:flex-row">
      {/* Conversations List Sidebar */}
      <div className="w-full md:w-80 border-r border-slate-100 flex flex-col h-1/2 md:h-full bg-slate-50/50">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
          <h3 className="font-serif font-bold text-luxury text-base flex items-center gap-1.5">
            <FaComments className="text-gold" /> Conversations
          </h3>
          {user?.role !== 'admin' && (
            <button
              type="button"
              onClick={handleChatWithAdmin}
              disabled={startingChatWithAdmin}
              className="text-[10px] font-bold text-gold border border-gold hover:bg-gold hover:text-white px-2.5 py-1.5 rounded-xl transition-all active:scale-95 disabled:bg-slate-100 cursor-pointer"
            >
              Contact Admin
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100 bg-white">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-xs bg-slate-50/50"
          />
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loadingConversations ? (
            <div className="flex justify-center items-center h-full py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold"></div>
            </div>
          ) : conversations.filter(conv => {
            const recipient = getRecipient(conv)
            return (recipient.name || '').toLowerCase().includes(searchTerm.toLowerCase())
          }).length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              {searchTerm ? 'No matching conversations found.' : 'No active conversations yet.'}
            </div>
          ) : (
            conversations
              .filter(conv => {
                const recipient = getRecipient(conv)
                return (recipient.name || '').toLowerCase().includes(searchTerm.toLowerCase())
              })
              .map((conv) => {
              const recipient = getRecipient(conv)
              const isActive = activeChat?._id === conv._id
              return (
                <div
                  key={conv._id}
                  onClick={() => {
                    setActiveChat(conv)
                    // Instantly reset unread count locally for responsive UI
                    setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c))
                  }}
                  className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                    isActive ? 'bg-gold/10 border-l-4 border-gold' : 'hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {recipient.avatar ? (
                      <img src={getImageUrl(recipient.avatar)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FaUserCircle className="text-slate-400 text-2xl" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-xs font-bold text-luxury truncate">{recipient.name}</h4>
                      <span className="text-[9px] text-slate-400">
                        {new Date(conv.lastMessageAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-gold uppercase tracking-wider scale-95 origin-left">
                      {recipient.role}
                    </p>
                    <div className="flex justify-between items-center gap-2 mt-1">
                      <p className="text-slate-500 text-[11px] truncate leading-normal font-normal flex-1">
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-gold text-white font-bold text-[9px] flex items-center justify-center shrink-0 animate-pulse">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Message Window Area */}
      <div className="flex-1 flex flex-col h-1/2 md:h-full bg-white">
        {activeChat ? (
          <>
            {/* Conversation Header */}
            {(() => {
              const recipient = getRecipient(activeChat)
              const property = activeChat.property
              return (
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border border-slate-300">
                      {recipient.avatar ? (
                        <img src={getImageUrl(recipient.avatar)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FaUserCircle className="text-slate-400 text-2xl" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-luxury leading-tight">{recipient.name}</h4>
                      <p className="text-[9px] font-bold text-gold uppercase tracking-widest mt-0.5">{recipient.role}</p>
                    </div>
                  </div>

                  {/* Connected Property context badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Connected Property context badge */}
                    {property && (
                      <Link
                        to={`/property/${property._id || property.id}`}
                        className="flex items-center gap-2 border border-slate-200/60 bg-white p-1.5 pr-3 rounded-2xl max-w-[180px] sm:max-w-[240px] hover:border-gold transition-colors shrink-0"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                          <img
                            src={getImageUrl(property.images?.[0] || property.image)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-luxury truncate leading-tight">{property.title}</p>
                          <p className="text-[9px] text-gold font-bold uppercase mt-0.5 leading-none">
                            {formatPrice(property.price)}
                          </p>
                        </div>
                      </Link>
                    )}

                    {/* Delete Chat Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteChat(activeChat._id)}
                      className="p-2.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/50 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                      title="Delete Conversation"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* Messages Scroll Area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/20">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold"></div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender === (user?._id || user?.id)
                  return (
                    <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                          isOwn
                            ? 'bg-luxury text-white rounded-tr-none'
                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <div
                          className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 font-normal ${
                            isOwn ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isOwn && (
                            <span className="text-[10px] select-none font-bold ml-1" title={msg.isRead ? 'Read' : 'Sent'}>
                              {msg.isRead ? (
                                <span className="text-amber-400">✓✓</span>
                              ) : (
                                <span className="text-slate-300">✓</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Input send Message Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold transition-colors text-xs disabled:bg-slate-50"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="bg-gold hover:bg-yellow-600 disabled:bg-slate-200 text-white rounded-xl p-2.5 transition-all shadow-sm active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <FaPaperPlane className="text-xs" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center text-gold shadow-sm">
              <FaComments className="text-2xl" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="font-serif font-bold text-luxury text-base">Select a conversation</h3>
              <p className="text-slate-400 text-xs leading-normal">
                Choose a thread from the list on the left to start communicating with clients or agents in real-time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
