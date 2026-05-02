import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import useAuthStore from "@/store/useAuthStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Trash2 } from "lucide-react";
import { axiosInstance } from "@/api/axiosInatance";

let socket = null;

function CourseChat({ courseId, roomId }) {
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [activeChannel, setActiveChannel] = useState("general"); // "general", "resources", "announcements"
  const bottomRef = useRef(null);

  // ── fetch past messages on mount or channel change ───────────────────────
  useEffect(() => {
    if (!roomId) return;

    async function fetchMessages() {
      try {
        setLoadingMessages(true);
        const res = await axiosInstance.get(`/rooms/${roomId}/messages?channel=${activeChannel}`);
        if (res.data?.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    }

    fetchMessages();
  }, [roomId, activeChannel]);

  // ── setup socket connection ───────────────────────────────────────────────
  useEffect(() => {
    if (!courseId || !roomId || !user?.id) return;

    // create socket only once
    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL, {
        transports: ["websocket"],
      });
    }

    socket.on("connect", () => {
      setIsConnected(true);
      // join the course room after connecting
      socket.emit("join-room", { courseId, userId: user?.id });
    });

    socket.on("joined-room", () => {
      setIsJoined(true);
    });

    // receive new messages broadcasted by server
    socket.on("receive-message", (message) => {
      // Only append if it's for the current channel
      if (message.channel === activeChannel) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // handle soft deleted messages
    socket.on("message-deleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isDeleted: true } : msg
        )
      );
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err.message);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setIsJoined(false);
    });

    return () => {
      // leave room and clean up listeners when component unmounts
      if (socket) {
        socket.emit("leave-room", { courseId });
        socket.off("connect");
        socket.off("joined-room");
        socket.off("receive-message");
        socket.off("message-deleted");
        socket.off("error");
        socket.off("disconnect");
      }
    };
  }, [courseId, roomId, user?.id, activeChannel]);

  // ── auto scroll to bottom on new messages ────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim() || !isJoined) return;

    socket.emit("send-message", {
      roomId,
      courseId,
      senderId: user?.id,
      senderName: user?.userName,
      senderRole: user?.role === "instructor" ? "instructor" : "student",
      content: input.trim(),
      attachments: [],
      messageType: "text",
      channel: activeChannel,
    });

    setInput("");
  }

  function handleDelete(messageId) {
    socket.emit("delete-message", {
      messageId,
      courseId,
      userId: user?.id,
    });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (loadingMessages && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Loading messages...
      </div>
    );
  }

  const isInstructor = user?.role === "instructor";
  const canSend = activeChannel !== "announcements" || isInstructor;

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* connection status & channels */}
      <div className="flex flex-col border-b border-border">
        <div className="px-4 py-2 border-b border-border flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected && isJoined ? "bg-green-500" : "bg-gray-500"
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {isConnected && isJoined ? "Connected to chat" : "Connecting..."}
          </span>
        </div>
        
        {/* Channel Tabs */}
        <div className="flex px-2 py-1 gap-1 overflow-x-auto no-scrollbar">
          {["general", "resources", "announcements"].map((ch) => (
            <Button
              key={ch}
              variant={activeChannel === ch ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveChannel(ch)}
              className="text-xs capitalize py-1 h-7 px-3"
            >
              {ch}
            </Button>
          ))}
        </div>
      </div>

      {/* messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 text-sm mt-8">
              No messages yet. Be the first to say something!
            </p>
          )}
          {messages.map((msg) => {
            const isOwn = msg.senderId === user?.id;
            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
              >
                {/* sender name */}
                <span className="text-xs text-gray-400 mb-1 px-1">
                  {isOwn ? "You" : msg.senderName}
                  {msg.senderRole === "instructor" && (
                    <span className="ml-1 text-yellow-400">(Instructor)</span>
                  )}
                </span>

                <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                  {/* bubble */}
                  <div
                    className={`max-w-[240px] px-3 py-2 rounded-lg text-sm break-words ${
                      msg.isDeleted
                        ? "bg-gray-700 text-gray-500 italic"
                        : isOwn
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-100"
                    }`}
                  >
                    {msg.isDeleted ? "This message was deleted" : msg.content}
                  </div>

                  {/* delete button — only for own non-deleted messages */}
                  {isOwn && !msg.isDeleted && (
                    <button
                      onClick={() => handleDelete(msg._id)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* timestamp */}
                <span className="text-xs text-gray-600 mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* input area */}
      {canSend ? (
        <div className="p-3 border-t border-border flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isJoined ? `Message #${activeChannel}...` : "Connecting..."}
            disabled={!isJoined}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!isJoined || !input.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="p-4 border-t border-border text-center text-xs text-muted-foreground bg-muted/20">
          Only instructors can send messages in this channel.
        </div>
      )}
    </div>
  );
}

export default CourseChat;
