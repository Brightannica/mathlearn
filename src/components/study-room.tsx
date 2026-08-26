"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Users, MessageSquare, Send, Mic, MicOff, Video, VideoOff, PhoneOff,
  Crown, Hand, Code2, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getProblems, Problem } from "@/lib/problems";
import { markProblemSolved } from "@/lib/local-state";

type Participant = {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isHandRaised: boolean;
  joinedAt: number;
};

type ChatMessage = {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  timestamp: number;
  type: "message" | "system" | "code";
  code?: string;
};

const ROOMS_KEY = "mathitout-study-rooms-v1";
const CURRENT_USER_KEY = "mathitout-current-user-v1";

function loadRooms(): Record<string, { participants: Participant[]; messages: ChatMessage[]; currentProblem?: string; createdAt: number; problemSlug?: string }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(ROOMS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveRooms(rooms: ReturnType<typeof loadRooms>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  } catch {}
}

function getOrCreateUser(): string {
  if (typeof window === "undefined") return "user-" + Date.now();
  let id = localStorage.getItem(CURRENT_USER_KEY);
  if (!id) {
    id = "user-" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(CURRENT_USER_KEY, id);
  }
  return id;
}

function getUserName(): string {
  if (typeof window === "undefined") return "Anonymous";
  return localStorage.getItem("mathitout-user-name") || "You";
}

export function StudyRoom({ roomId, onLeave }: { roomId: string; onLeave: () => void }) {
  const problems = getProblems();
  const { toast } = useToast();
  const [rooms, setRooms] = useState(loadRooms());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const userId = useRef(getOrCreateUser());
  const userName = useRef(getUserName());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const room = rooms[roomId];

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = loadRooms();
      setRooms(updated);
      const r = updated[roomId];
      if (r) {
        setMessages(r.messages);
        setParticipants(r.participants);
        if (r.problemSlug && !activeProblem) {
          const p = problems.find((p) => p.slug === r.problemSlug);
          if (p) {
            setActiveProblem(p);
            setCode(p.starterCode);
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [roomId, problems, activeProblem]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !room) return;
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      participantId: userId.current,
      participantName: userName.current,
      text: newMessage.trim(),
      timestamp: Date.now(),
      type: "message",
    };
    const updated = loadRooms();
    if (updated[roomId]) {
      updated[roomId].messages = [...updated[roomId].messages, msg];
      saveRooms(updated);
      setMessages(updated[roomId].messages);
      setNewMessage("");
    }
  }, [newMessage, room, roomId]);

  const submitCode = useCallback(() => {
    if (!activeProblem || !room) return;
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      participantId: userId.current,
      participantName: userName.current,
      text: `submitted solution for ${activeProblem.title}`,
      timestamp: Date.now(),
      type: "code",
      code,
    };
    const updated = loadRooms();
    if (updated[roomId]) {
      updated[roomId].messages = [...updated[roomId].messages, msg];
      saveRooms(updated);
      setMessages(updated[roomId].messages);
      markProblemSolved(activeProblem.slug, activeProblem.xp, 1);
      toast({ title: "submitted!", description: `+${activeProblem.xp} XP` });
    }
  }, [activeProblem, code, room, roomId, toast]);

  const raiseHand = useCallback(() => {
    if (!room) return;
    const updated = loadRooms();
    if (updated[roomId]) {
      updated[roomId].participants = updated[roomId].participants.map((p) =>
        p.id === userId.current ? { ...p, isHandRaised: !p.isHandRaised } : p
      );
      saveRooms(updated);
    }
  }, [room, roomId]);

  if (!room) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400">room not found</p>
        <Button onClick={onLeave} variant="outline" className="mt-4 border-zinc-800">leave</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// study room</div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            {roomId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            {participants.length} participant{participants.length !== 1 ? "s" : ""} · live coding session
          </p>
        </div>
        <Button onClick={onLeave} variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
          <PhoneOff className="h-4 w-4 mr-2" /> leave
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          {/* Participants */}
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">participants</h3>
              <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">
                {participants.length}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "border p-3 flex items-center gap-2",
                    p.id === userId.current ? "border-[#c4f000]/40 bg-[#c4f000]/5" : "border-zinc-800/60"
                  )}
                >
                  <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                    {p.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate flex items-center gap-1">
                      {p.name}
                      {p.isHost && <Crown className="h-3 w-3 text-yellow-500" />}
                    </div>
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                      {p.isMuted ? <MicOff className="h-2.5 w-2.5" /> : <Mic className="h-2.5 w-2.5" />}
                      {p.isVideoOn ? <Video className="h-2.5 w-2.5" /> : <VideoOff className="h-2.5 w-2.5" />}
                      {p.isHandRaised && <Hand className="h-2.5 w-2.5 text-amber-400" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active problem */}
          {activeProblem && (
            <div className="border border-zinc-800/60 bg-[#0d0d0d]">
              <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// active problem</div>
                  <h3 className="font-semibold text-sm mt-0.5">{activeProblem.title}</h3>
                </div>
                <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider",
                  activeProblem.difficulty === "easy" ? "text-emerald-400 border-emerald-400/30" :
                  activeProblem.difficulty === "medium" ? "text-amber-400 border-amber-400/30" :
                  "text-rose-400 border-rose-400/30"
                )}>
                  {activeProblem.difficulty}
                </Badge>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-zinc-300">{activeProblem.description}</p>
                <div className="border border-zinc-800 bg-[#0a0a0a] p-3 font-mono text-sm text-zinc-100">
                  {activeProblem.examples[0]?.input}
                </div>
                <Button
                  onClick={() => setShowCode(!showCode)}
                  variant="outline"
                  size="sm"
                  className="border-zinc-800 hover:border-[#c4f000] hover:text-[#c4f000]"
                >
                  <Code2 className="h-3.5 w-3.5 mr-1.5" /> {showCode ? "hide" : "open"} code editor
                </Button>
                {showCode && (
                  <div className="space-y-2">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-zinc-800 text-zinc-100 font-mono text-xs p-3 resize-none focus:border-[#c4f000] focus:outline-none"
                      rows={8}
                    />
                    <Button onClick={submitCode} className="bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold">
                      submit to room
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="border border-zinc-800/60 bg-[#0d0d0d] flex flex-col h-[600px]">
          <div className="p-3 border-b border-zinc-800/60 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-zinc-500" />
            <span className="font-semibold text-sm">chat</span>
            <Badge variant="outline" className="ml-auto border-zinc-700 text-zinc-400 text-[10px]">
              {messages.length}
            </Badge>
          </div>

          <ScrollArea className="flex-1 p-3">
            <div className="space-y-2">
              {messages.map((m) => (
                <div key={m.id} className={cn(
                  "text-xs",
                  m.type === "system" ? "text-zinc-600 italic" :
                  m.type === "code" ? "border-l-2 border-[#c4f000] pl-2" : ""
                )}>
                  {m.type === "message" && (
                    <>
                      <span className="text-zinc-500 font-mono text-[10px]">
                        {m.participantName}
                      </span>
                      <p className="text-zinc-300 mt-0.5">{m.text}</p>
                    </>
                  )}
                  {m.type === "code" && (
                    <>
                      <span className="text-[#c4f000] font-mono text-[10px]">
                        {m.participantName} · code
                      </span>
                      <p className="text-zinc-300 mt-0.5">{m.text}</p>
                    </>
                  )}
                  {m.type === "system" && <p>{m.text}</p>}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-zinc-800/60 p-3">
            <div className="flex items-center gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="type a message..."
                className="flex-1 bg-[#0a0a0a] border-zinc-800 text-zinc-100 text-xs placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
              />
              <Button
                onClick={sendMessage}
                size="icon"
                className="h-9 w-9 bg-[#c4f000] text-black hover:bg-[#b3d800]"
                disabled={!newMessage.trim()}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Button
                onClick={raiseHand}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 text-xs",
                  participants.find((p) => p.id === userId.current)?.isHandRaised ? "text-amber-400" : "text-zinc-500"
                )}
              >
                <Hand className="h-3 w-3 mr-1" /> raise hand
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
