"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, Search, Phone, Video, MoreVertical, ArrowLeft, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatUser = {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  status: "online" | "offline" | "in_game";
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
};

type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
};

const mockUsers: ChatUser[] = [
  { id: "1", name: "Emma W.", avatar: "", grade: "8", status: "online", lastMessage: "Hey! Did you finish the algebra quiz?", lastMessageTime: "2m ago", unread: 2 },
  { id: "2", name: "Liam C.", avatar: "", grade: "10", status: "in_game", lastMessage: "GG! That was a close one", lastMessageTime: "15m ago", unread: 0 },
  { id: "3", name: "Sofia M.", avatar: "", grade: "6", status: "online", lastMessage: "Can you help me with fractions?", lastMessageTime: "1h ago", unread: 1 },
  { id: "4", name: "Noah B.", avatar: "", grade: "9", status: "offline", lastMessage: "Thanks for the help!", lastMessageTime: "3h ago", unread: 0 },
  { id: "5", name: "Ava P.", avatar: "", grade: "7", status: "online", lastMessage: "Let's practice together tomorrow", lastMessageTime: "1d ago", unread: 0 },
];

const mockMessages: Message[] = [
  { id: "m1", senderId: "1", content: "Hey! Did you finish the algebra quiz?", timestamp: "10:30 AM", isOwn: false },
  { id: "m2", senderId: "me", content: "Yes! I got 92% on it. How about you?", timestamp: "10:32 AM", isOwn: true },
  { id: "m3", senderId: "1", content: "Nice! I got 85%. The last question was tricky.", timestamp: "10:33 AM", isOwn: false },
  { id: "m4", senderId: "me", content: "Yeah, the quadratic formula one? I almost got it wrong too.", timestamp: "10:35 AM", isOwn: true },
  { id: "m5", senderId: "1", content: "Exactly! Want to practice some more problems together?", timestamp: "10:36 AM", isOwn: false },
  { id: "m6", senderId: "me", content: "Sure! Let's do it. I'll create a study room.", timestamp: "10:38 AM", isOwn: true },
  { id: "m7", senderId: "1", content: "Hey! Did you finish the algebra quiz?", timestamp: "10:40 AM", isOwn: false },
];

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  in_game: "bg-purple-500",
};

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: `m${Date.now()}`,
      senderId: "me",
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="animate-in fade-in h-[calc(100vh-8rem)]">
      <div className="flex h-full gap-4">
        {/* Sidebar */}
        <div className={cn("w-full md:w-80 flex flex-col gap-4", selectedUser && "hidden md:flex")}>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" /> Messages
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Chat with friends and study partners</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedUser?.id === user.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => setSelectedUser(user)}
                >
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background", statusColors[user.status])} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">{user.name}</p>
                          <span className="text-xs text-muted-foreground">{user.lastMessageTime}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{user.lastMessage}</p>
                      </div>
                      {user.unread > 0 && (
                        <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {user.unread}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={cn("flex-1 flex flex-col", !selectedUser && "hidden md:flex")}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <Card className="mb-4">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setSelectedUser(null)}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{selectedUser.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background", statusColors[selectedUser.status])} />
                      </div>
                      <div>
                        <p className="font-semibold">{selectedUser.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                          {selectedUser.status === "in_game" ? "In Game" : "Online"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messages */}
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex", msg.isOwn ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[70%] rounded-lg px-4 py-2",
                        msg.isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={cn("text-xs mt-1", msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>{msg.timestamp}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="mt-4 flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold">Select a conversation</p>
                <p className="text-muted-foreground mt-1">Choose a friend to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
