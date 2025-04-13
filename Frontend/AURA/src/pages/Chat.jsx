import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, PlusCircle, Clock, Trash2, Edit2, Menu, X, ChevronLeft, MessageSquare } from "lucide-react";
import Header from "../components/Header";

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // Current conversation messages
  const [chatHistories, setChatHistories] = useState([]); // All chat histories
  const [activeChatId, setActiveChatId] = useState(null); // Currently active chat
  const [editingTitle, setEditingTitle] = useState(null); // Chat being edited (ID)
  const [newTitle, setNewTitle] = useState(""); // New title for chat being edited
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar state
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [isMobile, setIsMobile] = useState(false); // Mobile view detection

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check if on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch chat histories when component mounts
  useEffect(() => {
    fetchChatHistories();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input after selecting or creating a chat
  useEffect(() => {
    if (activeChatId) {
      inputRef.current?.focus();
    }
  }, [activeChatId]);

  const fetchChatHistories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/chat-histories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistories(data.chat_histories);
      } else {
        console.error("Failed to fetch chat histories");
      }
    } catch (err) {
      console.error("Error fetching chat histories:", err);
    }
  };

  const fetchChatHistory = async (chatId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:5000/chat-histories/${chatId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Convert messages to our format
        const formattedMessages = data.chat_history.messages.map(msg => ({
          sender: msg.role === 'user' ? 'user' : 'bot',
          text: msg.content
        }));

        setMessages(formattedMessages);
        setActiveChatId(chatId);

        // On mobile, close sidebar after selecting a chat
        if (isMobile) {
          setSidebarOpen(false);
        }
      } else {
        console.error("Failed to fetch chat history");
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/chat-histories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: 'include',
        body: JSON.stringify({ title: "New Chat" }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistories(prev => [data.chat_history, ...prev]);
        setActiveChatId(data.chat_history.id);
        setMessages([]);

        // On mobile, close sidebar after creating a new chat
        if (isMobile) {
          setSidebarOpen(false);
        }
      } else {
        console.error("Failed to create new chat");
      }
    } catch (err) {
      console.error("Error creating new chat:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateChatTitle = async (chatId) => {
    if (!newTitle.trim()) {
      setEditingTitle(null);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:5000/chat-histories/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle }),
      });

      if (response.ok) {
        setChatHistories(prev =>
          prev.map(chat =>
            chat.id === chatId ? { ...chat, title: newTitle } : chat
          )
        );
      } else {
        console.error("Failed to update chat title");
      }
    } catch (err) {
      console.error("Error updating chat title:", err);
    } finally {
      setEditingTitle(null);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation(); // Prevent triggering the chat selection

    if (!window.confirm("Are you sure you want to delete this chat?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:5000/chat-histories/${chatId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: 'include'
      });

      if (response.ok) {
        setChatHistories(prev => prev.filter(chat => chat.id !== chatId));
        if (activeChatId === chatId) {
          setActiveChatId(null);
          setMessages([]);
        }
      } else {
        console.error("Failed to delete chat");
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: 'include',
        body: JSON.stringify({
          message: message,
          chat_id: activeChatId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const botMessage = {
          sender: "bot",
          text: data.response,
        };
        setMessages((prev) => [...prev, botMessage]);

        // Update active chat ID (in case this was a new conversation)
        setActiveChatId(data.chat_id);

        // Refresh chat histories to update titles and last updated time
        fetchChatHistories();
      } else {
        console.error("Error:", data.message || data.error);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Fixed Header at the top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Main content with proper spacing from header */}
      <div className="flex flex-1 pt-16"> {/* pt-16 adds padding to accommodate the header */}
        {/* Mobile Sidebar Toggle */}
        {isMobile && !sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="fixed z-20 top-20 left-2 bg-gray-700 p-2 rounded-full shadow-lg"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            ${isMobile ? 'fixed z-10 top-16 bottom-0 w-72' : 'w-72 min-w-72'}
            bg-gray-800 overflow-y-auto flex flex-col transition-transform duration-300 shadow-lg h-[calc(100vh-4rem)]`}
        >
          {/* New Chat Button */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <button
              onClick={createNewChat}
              className="bg-teal-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-teal-500 transition w-full"
            >
              <PlusCircle size={18} />
              <span>New Chat</span>
            </button>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="bg-gray-700 p-2 rounded-full ml-2"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Chat History List */}
          <div className="flex-1 p-2 space-y-1 overflow-y-auto">
            {chatHistories.length === 0 ? (
              <div className="text-gray-400 text-center p-4">
                No chat history yet
              </div>
            ) : (
              chatHistories.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg cursor-pointer group relative flex items-center ${activeChatId === chat.id ? 'bg-gray-700' : 'hover:bg-gray-700/50'
                    }`}
                  onClick={() => fetchChatHistory(chat.id)}
                >
                  <MessageSquare size={16} className="text-gray-400 mr-3 shrink-0" />

                  {editingTitle === chat.id ? (
                    <div className="flex-1 flex">
                      <input
                        type="text"
                        className="flex-1 bg-gray-600 text-white rounded px-2 py-1 text-sm"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateChatTitle(chat.id);
                          } else if (e.key === 'Escape') {
                            setEditingTitle(null);
                          }
                        }}
                        autoFocus
                        onBlur={() => updateChatTitle(chat.id)}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 truncate text-sm text-white">
                        <div className="font-medium truncate">{chat.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{formatDate(chat.updated_at)}</div>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition ml-2">
                        <button
                          className="p-1 rounded hover:bg-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTitle(chat.id);
                            setNewTitle(chat.title);
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-gray-600 text-red-400"
                          onClick={(e) => deleteChat(chat.id, e)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Chat Interface */}
          <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center gap-3 shadow-md border-b border-gray-700">
              {isMobile && (
                <button onClick={toggleSidebar} className="p-1 rounded-full bg-gray-700 mr-2">
                  <Menu size={18} />
                </button>
              )}
              <div className="bg-teal-600/20 backdrop-blur-sm rounded-full p-2">
                <Bot className="text-teal-400 w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">
                  {activeChatId ? (
                    chatHistories.find(c => c.id === activeChatId)?.title || "Chat"
                  ) : "AURA"}
                </h2>
                <p className="text-sm text-white/60">Your AI Assistant</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-900 scrollbar-thin scrollbar-thumb-teal-700">
              {!activeChatId && messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-8">
                  <div className="bg-teal-600/20 rounded-full p-4 mb-4">
                    <Bot className="w-8 h-8 text-teal-400" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">How can I help you today?</h3>
                  <p className="text-gray-400 mb-8 max-w-md">
                    I can answer questions, provide information, help with tasks, or just chat!
                  </p>
                  <button
                    onClick={createNewChat}
                    className="bg-teal-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-teal-500 transition"
                  >
                    <PlusCircle size={18} />
                    <span>Start a new chat</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Welcome Message (only shown for new chats) */}
                  {messages.length === 0 && (
                    <div className="flex items-start gap-3 animate-fade-in">
                      <div className="flex-shrink-0 bg-teal-600/20 p-2 rounded-full text-teal-400">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="bg-gray-800 text-white p-4 rounded-2xl max-w-3xl shadow-md relative">
                        <p>
                          Hi! I'm <strong>AURA</strong>, your AI assistant. How can I help you today?
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Messages */}
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : ""
                        }`}
                    >
                      {msg.sender === "user" ? (
                        <>
                          <div className="bg-teal-600 text-white p-4 rounded-2xl max-w-3xl shadow-md">
                            {msg.text}
                          </div>
                          <div className="flex-shrink-0 bg-teal-500 p-2 rounded-full text-white">
                            <User className="w-5 h-5" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-shrink-0 bg-teal-600/20 p-2 rounded-full text-teal-400">
                            <Bot className="w-5 h-5" />
                          </div>
                          <div className="bg-gray-800 text-white p-4 rounded-2xl max-w-3xl shadow-md relative">
                            {/* Check if the bot's response is JSON or code */}
                            {isJson(msg.text) ? (
                              <pre className="bg-gray-700 p-3 rounded-lg text-sm overflow-x-auto">
                                <code>{JSON.stringify(JSON.parse(msg.text), null, 2)}</code>
                              </pre>
                            ) : msg.text.startsWith("```") && msg.text.endsWith("```") ? (
                              <pre className="bg-gray-700 p-3 rounded-lg text-sm overflow-x-auto">
                                <code>{msg.text.replace(/```/g, "")}</code>
                              </pre>
                            ) : (
                              msg.text.split("\n").map((line, i) => {
                                // Check for headings or bold text
                                if (line.startsWith("# ")) {
                                  return (
                                    <h1 key={i} className="text-lg font-bold mb-2">
                                      {line.replace("# ", "")}
                                    </h1>
                                  );
                                } else if (line.startsWith("## ")) {
                                  return (
                                    <h2 key={i} className="text-md font-semibold mb-2">
                                      {line.replace("## ", "")}
                                    </h2>
                                  );
                                } else if (line.startsWith("**") && line.endsWith("**")) {
                                  return (
                                    <p key={i} className="font-bold mb-1">
                                      {line.replace(/\*\*/g, "")}
                                    </p>
                                  );
                                } else {
                                  return (
                                    <p key={i} className="mb-1">
                                      {line}
                                    </p>
                                  );
                                }
                              })
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full p-4 pr-12 rounded-lg bg-gray-700 text-white outline-none placeholder-gray-400 focus:ring-2 focus:ring-teal-500 transition"
                  placeholder={activeChatId ? "Type your message..." : "Start a new chat..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!activeChatId) {
                        createNewChat().then(() => {
                          // We'll wait for the next render before sending
                          setTimeout(() => {
                            if (message.trim()) handleSend();
                          }, 100);
                        });
                      } else {
                        handleSend();
                      }
                    }
                  }}
                  disabled={loading}
                />
                <button
                  onClick={() => {
                    if (!activeChatId) {
                      createNewChat().then(() => {
                        // We'll wait for the next render before sending
                        setTimeout(() => {
                          if (message.trim()) handleSend();
                        }, 100);
                      });
                    } else {
                      handleSend();
                    }
                  }}
                  disabled={!message.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-600 p-2 rounded-full hover:bg-teal-500 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              {/* Help text */}
              <div className="mt-2 text-center text-xs text-gray-500">
                AURA can assist with questions, ideas, and information.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Helper function to check if a string is valid JSON */
function isJson(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

export default Chat;