"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, ArrowRight, Crown, Clock, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudyRoom } from "@/components/study-room";
import { getProblems } from "@/lib/problems";

const ROOMS_KEY = "mathitout-study-rooms-v1";
const USER_KEY = "mathitout-current-user-v1";

function loadRooms() {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(ROOMS_KEY) || "{}"); } catch { return {}; }
}
function saveRooms(rooms: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms)); } catch {}
}
function getUserId() {
  if (typeof window === "undefined") return "user-anon";
  let id = localStorage.getItem(USER_KEY);
  if (!id) {
    id = "user-" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(USER_KEY, id);
  }
  return id;
}
function getUserName() {
  if (typeof window === "undefined") return "Anonymous";
  return localStorage.getItem("mathitout-user-name") || "Anonymous";
}

const QUICK_TOPICS = [
  "Algebra I help",
  "Geometry proofs",
  "Calculus derivatives",
  "SAT prep",
  "Algebra II",
  "Trig identities",
];

export default function StudyGroupsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const problems = getProblems();
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Record<string, { participants: { id: string; name: string; isHost?: boolean }[]; createdAt: number; problemSlug?: string }>>(loadRooms());
  const [newRoomName, setNewRoomName] = useState("");
  const [selectedProblem, setSelectedProblem] = useState<string>("");
  const [tick, setTick] = useState(0);
  const [userName, setUserName] = useState(getUserName);

  useEffect(() => {
    setRooms(loadRooms());
    const interval = setInterval(() => {
      setRooms(loadRooms());
      setTick((t) => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const createRoom = useCallback(() => {
    if (!newRoomName.trim()) {
      toast({ title: "enter a room name", variant: "destructive" });
      return;
    }
    const id = `room-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const all = loadRooms();
    const newRoom = {
      participants: [{ id: getUserId(), name: userName, isHost: true, isMuted: false, isVideoOn: false, isHandRaised: false, joinedAt: Date.now() }],
      messages: [{
        id: `sys-${Date.now()}`,
        participantId: "system",
        participantName: "system",
        text: `${userName} created the room`,
        timestamp: Date.now(),
        type: "system" as const,
      }],
      createdAt: Date.now(),
      problemSlug: selectedProblem || undefined,
    };
    all[id] = newRoom;
    saveRooms(all);
    setRooms(all);
    setActiveRoom(id);
    setNewRoomName("");
    toast({ title: "room created", description: "invite friends with the room link" });
  }, [newRoomName, selectedProblem, userName, toast]);

  const joinRoom = useCallback((roomId: string) => {
    const all = loadRooms();
    const r = all[roomId];
    if (!r) return;
    const userId = getUserId();
    const existing = r.participants.find((p: { id: string }) => p.id === userId);
    if (!existing) {
      r.participants.push({ id: userId, name: userName, isHost: false, isMuted: false, isVideoOn: false, isHandRaised: false, joinedAt: Date.now() });
      r.messages.push({
        id: `sys-${Date.now()}`,
        participantId: "system",
        participantName: "system",
        text: `${userName} joined the room`,
        timestamp: Date.now(),
        type: "system" as const,
      });
      all[roomId] = r;
      saveRooms(all);
    }
    setActiveRoom(roomId);
  }, [userName]);

  const leaveRoom = useCallback(() => {
    setActiveRoom(null);
  }, []);

  if (activeRoom) {
    return <StudyRoom roomId={activeRoom} onLeave={leaveRoom} />;
  }

  const roomList = Object.entries(rooms).map(([id, r]) => ({
    id,
    ...r,
  })).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// live rooms</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-7 w-7" />
          group study
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">work through problems together. real-time chat, shared code, and live help.</p>
      </div>

      {/* Create room */}
      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-4 w-4 text-zinc-500" />
          <span className="font-semibold text-sm">start a new study room</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1.5 block">room name</label>
            <Input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="algebra help, SAT prep, etc."
              className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1.5 block">optional problem</label>
            <select
              value={selectedProblem}
              onChange={(e) => setSelectedProblem(e.target.value)}
              className="w-full h-10 bg-[#0a0a0a] border border-zinc-800 text-zinc-100 text-sm px-3 focus:border-[#c4f000] focus:outline-none"
            >
              <option value="">no problem (just chat)</option>
              {problems.map((p: { slug: string; title: string; difficulty: string }) => (
                <option key={p.slug} value={p.slug}>{p.title} ({p.difficulty})</option>
              ))}
            </select>
          </div>
          <Button onClick={createRoom} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold">
            <Plus className="h-4 w-4 mr-2" /> create room
          </Button>
        </div>
      </div>

      {/* Quick topics */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 mb-3">quick topics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {QUICK_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setNewRoomName(topic)}
              className="border border-zinc-800/60 bg-[#0d0d0d] px-3 py-2 text-xs text-zinc-400 hover:border-[#c4f000] hover:text-[#c4f000] transition-colors text-left"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Active rooms */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-400">active rooms</h2>
          <span className="text-[10px] text-zinc-600 font-mono">{roomList.length} room{roomList.length !== 1 ? "s" : ""}</span>
        </div>
        {roomList.length === 0 ? (
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-12 text-center">
            <Users className="h-8 w-8 mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm">no active rooms. create one to get started.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {roomList.map((r) => {
              const problem = r.problemSlug ? problems.find((p) => p.slug === r.problemSlug) : null;
              return (
                <button
                  key={r.id}
                  onClick={() => joinRoom(r.id)}
                  className="text-left border border-zinc-800/60 bg-[#0d0d0d] p-4 hover:border-zinc-600 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-[#c4f000] transition-colors truncate">
                        {r.id.replace(/^room-\d+-/, "").replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h3>
                      <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {r.participants.length}
                        </span>
                      </div>
                    </div>
                    {r.participants.find((p: { isHost?: boolean }) => p.isHost) && (
                      <Crown className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                    )}
                  </div>
                  {problem && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                      <Code2 className="h-3 w-3" />
                      <span className="truncate">{problem.title}</span>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-1 text-xs text-zinc-500 group-hover:text-[#c4f000] transition-colors">
                    join <ArrowRight className="h-3 w-3" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
