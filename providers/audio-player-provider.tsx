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
import { toast } from "sonner";
import type { MusicTrack } from "@/types";

export type PlayMode = "sequential" | "shuffle" | "loop-one";

type PlaybackContext =
  | "play"
  | "play-delayed-retry"
  | "media-error-retry"
  | "media-error"
  | "resume"
  | "loop-restart";

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

const MEDIA_ERROR_LABELS: Record<number, string> = {
  1: "aborted",
  2: "network",
  3: "decode",
  4: "not-supported",
};

const NETWORK_STATE_LABELS: Record<number, string> = {
  0: "empty",
  1: "idle",
  2: "loading",
  3: "no-source",
};

const READY_STATE_LABELS: Record<number, string> = {
  0: "nothing",
  1: "metadata",
  2: "current-data",
  3: "future-data",
  4: "enough-data",
};

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

function describePlaybackFailure(
  track: MusicTrack | null,
  audio: HTMLAudioElement,
  context: PlaybackContext,
  error?: unknown,
) {
  const domErrorName =
    error instanceof DOMException
      ? error.name
      : error instanceof Error
        ? error.name
        : null;
  const domErrorMessage =
    error instanceof Error && error.message ? error.message : null;
  const mediaErrorCode = audio.error?.code ?? null;
  const mediaErrorLabel = mediaErrorCode
    ? MEDIA_ERROR_LABELS[mediaErrorCode] || `code-${mediaErrorCode}`
    : null;

  let description =
    "Terjadi kendala saat memuat audio. Coba ulangi beberapa saat lagi.";

  if (domErrorName === "NotAllowedError") {
    description =
      "Browser memblokir pemutaran audio. Coba tekan play sekali lagi dan pastikan mode senyap atau pembatas autoplay tidak aktif.";
  } else if (domErrorName === "NotSupportedError" || mediaErrorCode === 4) {
    description =
      "Format audio tidak didukung atau file audio tidak ditemukan di server. Pastikan file sudah diupload melalui panel admin.";
  } else if (mediaErrorCode === 2) {
    description =
      "Audio gagal dimuat dari server. Kemungkinan koneksi tidak stabil atau file tidak bisa diakses.";
  } else if (mediaErrorCode === 3) {
    description =
      "Audio berhasil dimuat tetapi gagal didekode. File mungkin rusak atau formatnya bermasalah.";
  }

  const debugParts = [
    domErrorName ? `error=${domErrorName}` : null,
    domErrorMessage ? `message=${domErrorMessage}` : null,
    mediaErrorLabel ? `media=${mediaErrorLabel}` : null,
    `ready=${READY_STATE_LABELS[audio.readyState] || audio.readyState}`,
    `network=${NETWORK_STATE_LABELS[audio.networkState] || audio.networkState}`,
    `context=${context}`,
  ].filter(Boolean);

  return {
    title: track
      ? `Audio "${track.title}" tidak bisa diputar`
      : "Audio tidak bisa diputar",
    description: `${description} Detail: ${debugParts.join(" | ")}`,
    debug: {
      trackId: track?.id ?? null,
      trackTitle: track?.title ?? null,
      trackUrl: track?.url ?? null,
      currentSrc: audio.currentSrc || null,
      domErrorName,
      domErrorMessage,
      mediaErrorCode,
      mediaErrorLabel,
      networkState: audio.networkState,
      readyState: audio.readyState,
      context,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    },
  };
}

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
  const currentTrackRef = useRef<MusicTrack | null>(currentTrack);
  const lastPlaybackErrorKeyRef = useRef<string | null>(null);

  useEffect(() => {
    playModeRef.current = playMode;
  }, [playMode]);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

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

  const reportPlaybackFailure = useCallback(
    (
      audio: HTMLAudioElement,
      track: MusicTrack | null,
      context: PlaybackContext,
      error?: unknown,
    ) => {
      if (audioRef.current !== audio) return;

      const domErrorName =
        error instanceof DOMException
          ? error.name
          : error instanceof Error
            ? error.name
            : null;

      // This is expected when the user changes tracks before playback settles.
      if (domErrorName === "AbortError") return;

      const mediaErrorCode = audio.error?.code ?? null;
      const errorKey = [
        track?.id ?? "unknown",
        audio.currentSrc || track?.url || "no-src",
        mediaErrorCode ?? "no-media-error",
      ].join("|");

      if (lastPlaybackErrorKeyRef.current === errorKey) return;
      lastPlaybackErrorKeyRef.current = errorKey;

      setIsPlaying(false);
      stopProgressTracking();

      const failure = describePlaybackFailure(track, audio, context, error);
      console.error("[audio-player] Playback failed", failure.debug);
      toast.error(failure.title, {
        description: failure.description,
        duration: 8000,
      });
    },
    [stopProgressTracking],
  );

  const attemptPlayback = useCallback(
    async (
      audio: HTMLAudioElement,
      track: MusicTrack | null,
      context: PlaybackContext,
      reportFailure: boolean,
    ) => {
      try {
        await audio.play();
        if (audioRef.current !== audio) return false;
        lastPlaybackErrorKeyRef.current = null;
        setIsPlaying(true);
        startProgressTracking();
        return true;
      } catch (error) {
        if (audioRef.current !== audio) return false;
        setIsPlaying(false);
        if (reportFailure) {
          reportPlaybackFailure(audio, track, context, error);
        }
        return false;
      }
    },
    [reportPlaybackFailure, startProgressTracking],
  );

  const play = useCallback(
    (track: MusicTrack) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
        audioRef.current = null;
      }

      stopProgressTracking();
      lastPlaybackErrorKeyRef.current = null;

      const audio = new Audio();
      audioRef.current = audio;

      setCurrentTrack(track);
      setProgress(0);
      setDuration(0);

      audio.preload = "metadata";
      audio.setAttribute("playsinline", "true");

      audio.addEventListener("loadedmetadata", () => {
        if (audioRef.current !== audio) return;
        setDuration(audio.duration);
      });

      audio.addEventListener("durationchange", () => {
        if (audioRef.current !== audio) return;
        if (audio.duration && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
      });

      audio.addEventListener("ended", () => {
        const mode = playModeRef.current;
        const allTracks = tracksRef.current;

        if (mode === "loop-one") {
          audio.currentTime = 0;
          void attemptPlayback(audio, track, "loop-restart", true);
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

        const idx = allTracks.findIndex((t) => t.id === track.id);
        if (idx < allTracks.length - 1) {
          setTimeout(() => play(allTracks[idx + 1]), 100);
        } else {
          setIsPlaying(false);
          stopProgressTracking();
        }
      });

      let retried = false;
      audio.addEventListener("error", () => {
        if (audioRef.current !== audio) return;

        if (!retried) {
          retried = true;
          audio.load();
          void attemptPlayback(audio, track, "media-error-retry", false);
          return;
        }

        reportPlaybackFailure(audio, track, "media-error");
      });

      audio.addEventListener("stalled", () => {
        if (audioRef.current !== audio) return;
        console.warn("[audio-player] Playback stalled", {
          trackId: track.id,
          trackTitle: track.title,
          trackUrl: track.url,
          currentSrc: audio.currentSrc || null,
          networkState: audio.networkState,
          readyState: audio.readyState,
        });
      });

      audio.src = track.url;
      audio.load();

      void attemptPlayback(audio, track, "play", false).then((started) => {
        if (started || audioRef.current !== audio) return;

        setTimeout(() => {
          if (audioRef.current !== audio) return;
          void attemptPlayback(audio, track, "play-delayed-retry", true);
        }, 100);
      });
    },
    [attemptPlayback, reportPlaybackFailure, startProgressTracking, stopProgressTracking],
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    stopProgressTracking();
  }, [stopProgressTracking]);

  const resume = useCallback(() => {
    if (audioRef.current) {
      void attemptPlayback(
        audioRef.current,
        currentTrackRef.current,
        "resume",
        true,
      );
    }
  }, [attemptPlayback]);

  const next = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;

    if (playMode === "shuffle") {
      let randomIdx: number;
      do {
        randomIdx = Math.floor(Math.random() * tracks.length);
      } while (tracks.length > 1 && tracks[randomIdx].id === currentTrack.id);
      play(tracks[randomIdx]);
      return;
    }

    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % tracks.length;
    play(tracks[nextIdx]);
  }, [currentTrack, tracks, play, playMode]);

  const previous = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;

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

    lastPlaybackErrorKeyRef.current = null;
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
