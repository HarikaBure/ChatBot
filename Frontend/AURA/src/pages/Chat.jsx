import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import Header from "../components/Header";

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // Track all messages
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (response.ok) {
        const botMessage = {
          sender: "bot",
          text: data.response,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        console.error("Error:", data.message || data.error);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start">
        <div className="w-full max-w-2xl mt-20 bg-gray-800 rounded-xl shadow-2xl flex flex-col h-[550px] mt-[8%] overflow-hidden">

          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-teal-700 to-emerald-700 flex items-center gap-3 shadow-md">
            <div className="bg-black/30 backdrop-blur-sm rounded-full p-2 ">
              <Bot className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">AURA</h2>
              <p className="text-sm text-white/80">Your Emotional Movie Guide</p>
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-900 scrollbar-thin scrollbar-thumb-teal-700">
            {/* Welcome Message */}
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="bg-teal-700 p-2 rounded-full text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-700 text-white p-3 rounded-2xl max-w-md shadow-md">
                Hi! I'm <strong>AURA</strong>, your emotion-aware movie companion.
                I can understand how you're feeling and recommend the perfect movies for your mood.
                How are you feeling today?
              </div>
            </div>

            {/* Dynamic Messages */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 animate-fade-in ${
                  msg.sender === "user" ? "justify-end" : ""
                }`}
              >
                {msg.sender === "user" ? (
                  <>
                    <div className="bg-teal-600 text-white p-3 rounded-2xl max-w-md shadow-md">
                      {msg.text}
                    </div>
                    <div className="bg-teal-500 p-2 rounded-full text-white">
                      <User className="w-4 h-4" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-teal-700 p-2 rounded-full text-white">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-700 text-white p-3 rounded-2xl max-w-md shadow-md">
                      {msg.text}
                    </div>
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-gray-800 border-t border-gray-700 flex items-center gap-2 backdrop-blur-md">
            <input
              type="text"
              className="flex-1 p-3 rounded-full bg-gray-700/70 text-white outline-none placeholder-gray-400 backdrop-blur-md focus:ring-2 focus:ring-teal-500 transition"
              placeholder="Share how you're feeling..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={handleSend}
              className="bg-teal-600 p-3 rounded-full hover:bg-teal-500 transition shadow-md"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
