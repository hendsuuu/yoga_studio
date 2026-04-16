"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { MusicTrack } from "@/types";

export type PlayMode = "sequential" | "shuffle" | "loop-one";

interface AudioPlayerContextType {
  tracks: MusicTrack[];
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  playMode: PlayMode;
  play: (track: MusicTrack) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  stop: () => void;
  setTracks: (tracks: MusicTrack[]) => void;
  setPlayMode: (mode: PlayMode) => void;
  cyclePlayMode: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType>({
  tracks: [],
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  playMode: "sequential",
  play: () => {},
  pause: () => {},
  resume: () => {},
  next: () => {},
  previous: () => {},
  seek: () => {},
  stop: () => {},
  setTracks: () => {},
  setPlayMode: () => {},
  cyclePlayMode: () => {},
});

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playMode, setPlayMode] = useState<PlayMode>("sequential");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const playModeRef = useRef<PlayMode>(playMode);
  const tracksRef = useRef<MusicTrack[]>(tracks);

  // Keep refs in sync
  useEffect(() => {
    playModeRef.current = playMode;
  }, [playMode]);
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  const stopProgressTracking = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const startProgressTracking = useCallback(() => {
    stopProgressTracking();
    function tick() {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime);
      }
      animFrameRef.current = requestAnimationFrame(tick);
    }
    animFrameRef.current = requestAnimationFrame(tick);
  }, [stopProgressTracking]);

  const play = useCallback(
    (track: MusicTrack) => {
      // Cleanup previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
        audioRef.current = null;
      }
      stopProgressTracking();

      const audio = new Audio();
      audioRef.current = audio;

      // Set state immediately for UI responsiveness
      setCurrentTrack(track);
      setProgress(0);
      setDuration(0);

      // Cross-browser compatibility: preload metadata first (required by iOS Safari)
      audio.preload = "metadata";
      // Prevent iOS from requiring full download before playing
      audio.setAttribute("playsinline", "true");

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });

      // Fallback for duration on devices that don't fire loadedmetadata reliably
      audio.addEventListener("durationchange", () => {
        if (audio.duration && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
      });

      audio.addEventListener("ended", () => {
        const mode = playModeRef.current;
        const allTracks = tracksRef.current;

        if (mode === "loop-one") {
          audio.currentTime = 0;
          audio.play().catch(() => setIsPlaying(false));
          return;
        }

        if (mode === "shuffle") {
          if (allTracks.length <= 1) return;
          let randomIdx: number;
          do {
            randomIdx = Math.floor(Math.random() * allTracks.length);
          } while (allTracks[randomIdx].id === track.id);
          setTimeout(() => play(allTracks[randomIdx]), 100);
          return;
        }

        // Sequential: play next or stop at end
        const idx = allTracks.findIndex((t) => t.id === track.id);
        if (idx < allTracks.length - 1) {
          setTimeout(() => play(allTracks[idx + 1]), 100);
        } else {
          setIsPlaying(false);
          stopProgressTracking();
        }
      });

      // Retry once on network error before giving up
      let retried = false;
      audio.addEventListener("error", () => {
        if (!retried) {
          retried = true;
          audio.load();
          audio.play().catch(() => {
            setIsPlaying(false);
            stopProgressTracking();
          });
          return;
        }
        setIsPlaying(false);
        stopProgressTracking();
      });

      // Set source and play — keeps user gesture context for autoplay policy
      audio.src = track.url;
      audio.load();
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          startProgressTracking();
        })
        .catch(() => {
          // Some browsers need a small delay after load
          setTimeout(() => {
            audio
              .play()
              .then(() => {
                setIsPlaying(true);
                startProgressTracking();
              })
              .catch(() => {
                setIsPlaying(false);
              });
          }, 100);
        });
    },
    [stopProgressTracking, startProgressTracking],
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    stopProgressTracking();
  }, [stopProgressTracking]);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          startProgressTracking();
        })
        .catch(() => {});
    }
  }, [startProgressTracking]);

  const next = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;
    if (playMode === "shuffle") {
      let randomIdx: number;
      do {
        randomIdx = Math.floor(Math.random() * tracks.length);
      } while (tracks.length > 1 && tracks[randomIdx].id === currentTrack.id);
      play(tracks[randomIdx]);
    } else {
      const idx = tracks.findIndex((t) => t.id === currentTrack.id);
      const nextIdx = (idx + 1) % tracks.length;
      play(tracks[nextIdx]);
    }
  }, [currentTrack, tracks, play, playMode]);

  const previous = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;
    // If more than 3 seconds in, restart current track
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      return;
    }
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = idx <= 0 ? tracks.length - 1 : idx - 1;
    play(tracks[prevIdx]);
  }, [currentTrack, tracks, play]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
      audioRef.current = null;
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    stopProgressTracking();
  }, [stopProgressTracking]);

  const cyclePlayMode = useCallback(() => {
    setPlayMode((prev) => {
      if (prev === "sequential") return "shuffle";
      if (prev === "shuffle") return "loop-one";
      return "sequential";
    });
  }, []);

  useEffect(() => {
    return () => {
      stopProgressTracking();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [stopProgressTracking]);

  return (
    <AudioPlayerContext.Provider
      value={{
        tracks,
        currentTrack,
        isPlaying,
        progress,
        duration,
        playMode,
        play,
        pause,
        resume,
        next,
        previous,
        seek,
        stop,
        setTracks,
        setPlayMode,
        cyclePlayMode,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}
