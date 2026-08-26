"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Music, SkipForward, SkipBack } from "lucide-react";
import { cn } from "@/lib/utils";

type Track = {
  id: string;
  name: string;
  description: string;
  generator: "brownian" | "sine" | "rain" | "binaural" | "white";
  params?: Record<string, number>;
};

const TRACKS: Track[] = [
  { id: "brown", name: "Brown Noise", description: "Deep focus. Masks distractions.", generator: "brownian" },
  { id: "rain", name: "Rain", description: "Steady rainfall. Calming.", generator: "rain" },
  { id: "binaural", name: "Focus Binaural", description: "10Hz alpha waves. Deep work.", generator: "binaural", params: { baseFreq: 200, beat: 10 } },
  { id: "ambient", name: "Ambient Drone", description: "Slow evolving tones. Background.", generator: "sine", params: { baseFreq: 110, modFreq: 0.1 } },
  { id: "white", name: "White Noise", description: "Full spectrum. Mask everything.", generator: "white" },
];

export function StudyMusic() {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [trackIndex, setTrackIndex] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ stop: () => void }[]>([]);
  const gainRef = useRef<GainNode | null>(null);

  const stopAll = useCallback(() => {
    nodesRef.current.forEach((n) => n.stop());
    nodesRef.current = [];
  }, []);

  const createBrownianNoise = (ctx: AudioContext, dest: AudioNode) => {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    noise.connect(dest);
    noise.start();
    return { stop: () => { try { noise.stop(); } catch {} } };
  };

  const createWhiteNoise = (ctx: AudioContext, dest: AudioNode) => {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    noise.connect(dest);
    noise.start();
    return { stop: () => { try { noise.stop(); } catch {} } };
  };

  const createRain = (ctx: AudioContext, dest: AudioNode) => {
    // Brown noise + filtered white noise for rain effect
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.005 * white) / 1.005;
      lastOut = output[i];
    }
    const rain = ctx.createBufferSource();
    rain.buffer = noiseBuffer;
    rain.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 600;

    const peakFilter = ctx.createBiquadFilter();
    peakFilter.type = "peaking";
    peakFilter.frequency.value = 2500;
    peakFilter.Q.value = 0.5;

    rain.connect(filter);
    filter.connect(peakFilter);
    peakFilter.connect(dest);
    rain.start();
    return { stop: () => { try { rain.stop(); } catch {} } };
  };

  const createBinaural = (ctx: AudioContext, dest: AudioNode, baseFreq: number, beat: number) => {
    const merger = ctx.createChannelMerger(2);
    const leftOsc = ctx.createOscillator();
    const rightOsc = ctx.createOscillator();
    leftOsc.frequency.value = baseFreq;
    rightOsc.frequency.value = baseFreq + beat;
    leftOsc.connect(merger, 0, 0);
    rightOsc.connect(merger, 0, 1);
    merger.connect(dest);
    leftOsc.start();
    rightOsc.start();
    return {
      stop: () => {
        try { leftOsc.stop(); rightOsc.stop(); } catch {}
      },
    };
  };

  const createAmbientDrone = (ctx: AudioContext, dest: AudioNode, baseFreq: number, modFreq: number) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.value = baseFreq;
    osc2.frequency.value = baseFreq * 1.5; // perfect fifth
    lfo.frequency.value = modFreq;
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    gain1.gain.value = 0.3;
    gain2.gain.value = 0.2;

    filter.type = "lowpass";
    filter.frequency.value = 800;

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(dest);

    osc1.start();
    osc2.start();
    lfo.start();
    return {
      stop: () => {
        try { osc1.stop(); osc2.stop(); lfo.stop(); } catch {}
      },
    };
  };

  const play = useCallback(async () => {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
      const gain = audioCtxRef.current.createGain();
      gain.connect(audioCtxRef.current.destination);
      gainRef.current = gain;
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") await ctx.resume();

    stopAll();

    const gain = gainRef.current!;
    const track = TRACKS[trackIndex];
    let node: { stop: () => void } | null = null;
    switch (track.generator) {
      case "brownian": node = createBrownianNoise(ctx, gain); break;
      case "white": node = createWhiteNoise(ctx, gain); break;
      case "rain": node = createRain(ctx, gain); break;
      case "binaural": node = createBinaural(ctx, gain, track.params?.baseFreq || 200, track.params?.beat || 10); break;
      case "sine": node = createAmbientDrone(ctx, gain, track.params?.baseFreq || 110, track.params?.modFreq || 0.1); break;
    }
    if (node) nodesRef.current = [node];

    gain.gain.value = muted ? 0 : volume;
    setPlaying(true);
  }, [trackIndex, volume, muted, stopAll]);

  const pause = useCallback(() => {
    stopAll();
    setPlaying(false);
  }, [stopAll]);

  const toggle = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, pause, play]);

  const nextTrack = useCallback(() => {
    pause();
    setTrackIndex((i) => (i + 1) % TRACKS.length);
    setTimeout(() => play(), 100);
  }, [pause, play]);

  const prevTrack = useCallback(() => {
    pause();
    setTrackIndex((i) => (i - 1 + TRACKS.length) % TRACKS.length);
    setTimeout(() => play(), 100);
  }, [pause, play]);

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = muted ? 0 : volume;
    }
  }, [volume, muted]);

  useEffect(() => {
    return () => {
      stopAll();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [stopAll]);

  const track = TRACKS[trackIndex];

  return (
    <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Music className="h-4 w-4 text-zinc-500" />
        <span className="font-semibold text-sm">study music</span>
      </div>

      <div className="border border-zinc-800/40 bg-[#0a0a0a] p-3 mb-3">
        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// now playing</div>
        <div className="font-semibold mt-1 text-sm">{track.name}</div>
        <div className="text-xs text-zinc-500 mt-0.5">{track.description}</div>
      </div>

      <div className="flex items-center justify-center gap-1 mb-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevTrack}
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
        >
          <SkipBack className="h-3.5 w-3.5" />
        </Button>
        <button
          onClick={toggle}
          className={cn(
            "w-12 h-12 flex items-center justify-center border transition-all",
            playing
              ? "border-[#c4f000] bg-[#c4f000]/10 text-[#c4f000]"
              : "border-zinc-700 text-zinc-300 hover:border-[#c4f000] hover:text-[#c4f000]"
          )}
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextTrack}
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
        >
          <SkipForward className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMuted((m) => !m)}
          className="h-7 w-7 text-zinc-500 hover:text-zinc-100"
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </Button>
        <Slider value={[volume]} min={0} max={1} step={0.01} onValueChange={(v) => { setVolume(v[0]); setMuted(false); }} className="flex-1" />
        <span className="text-[10px] text-zinc-500 font-mono w-8 text-right">{Math.round(volume * 100)}%</span>
      </div>

      <div className="mt-3 flex gap-1 flex-wrap">
        {TRACKS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => {
              pause();
              setTrackIndex(i);
              setTimeout(() => play(), 100);
            }}
            className={cn(
              "px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border transition-colors",
              i === trackIndex
                ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
            )}
          >
            {t.id}
          </button>
        ))}
      </div>
    </div>
  );
}
