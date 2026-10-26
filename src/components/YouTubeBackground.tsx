import { useEffect, useRef } from 'react';

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  destroy: () => void;
  getPlayerState: () => number;
};
type YTEvent = { target: YTPlayer; data: number };
type YTApi = {
  Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Chỉ nạp thư viện YouTube một lần
let apiPromise: Promise<YTApi> | null = null;
function loadYouTubeApi(): Promise<YTApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(window.YT as YTApi);
      };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    });
  }
  return apiPromise;
}

type Props = {
  videoId: string;
  /** Gọi khi video thực sự bắt đầu chạy (để Hero cho video hiện dần lên trên ảnh) */
  onPlaying?: () => void;
};

export default function YouTubeBackground({ videoId, onPlaying }: Props) {
  const holder = useRef<HTMLDivElement>(null);
  const onPlayingRef = useRef(onPlaying);
  // Hero đang nằm trong màn hình hay không. Ra khỏi màn hình thì tạm dừng video
  const inView = useRef(true);

  useEffect(() => {
    onPlayingRef.current = onPlaying;
  });

  useEffect(() => {
    let player: YTPlayer | undefined;
    let cancelled = false;

    const kick = () => {
      if (!player || document.hidden || !inView.current) return;
      try {
        player.mute();
        player.playVideo();
      } catch {
        /* player chưa sẵn sàng */
      }
    };

    loadYouTubeApi().then((YT) => {
      if (cancelled || !holder.current) return;
      const mount = document.createElement('div');
      holder.current.appendChild(mount);
      player = new YT.Player(mount, {
        videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: videoId,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          disablekb: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (e: YTEvent) => {
            e.target.mute();
            if (inView.current) e.target.playVideo();
          },
          onStateChange: (e: YTEvent) => {
            // data === 1: video đã chạy -> báo cho Hero cho video hiện lên
            if (e.data === 1) onPlayingRef.current?.();
            // Đang tạm dừng vì ra khỏi màn hình thì không tự phát lại
            if (!inView.current) return;
            // Bị dừng / hết video / chưa bắt đầu thì phát lại ngay
            if (e.data === 0 || e.data === 2 || e.data === 5) e.target.playVideo();
          },
        },
      });
    });

    // Hero ra khỏi màn hình thì dừng video, quay lại thì chạy tiếp
    const io = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      if (!player) return;
      try {
        if (entry.isIntersecting) player.playVideo();
        else player.pauseVideo();
      } catch {
        /* player chưa sẵn sàng */
      }
    });
    if (holder.current) io.observe(holder.current);

    // Cứ 2 giây kiểm tra một lần, nếu không đang phát thì bật lại
    const timer = setInterval(() => {
      if (player && player.getPlayerState?.() !== 1) kick();
    }, 2000);

    // Quay lại tab hoặc chạm/cuộn lần đầu (trình duyệt chặn tự phát thì cứu ở đây)
    const events = ['pointerdown', 'touchstart', 'keydown', 'scroll'] as const;
    events.forEach((ev) => window.addEventListener(ev, kick, { passive: true }));
    document.addEventListener('visibilitychange', kick);

    return () => {
      cancelled = true;
      clearInterval(timer);
      io.disconnect();
      events.forEach((ev) => window.removeEventListener(ev, kick));
      document.removeEventListener('visibilitychange', kick);
      player?.destroy();
    };
  }, [videoId]);

    return (
    <div
      ref={holder}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [container-type:size] [&>iframe]:absolute [&>iframe]:left-1/2 [&>iframe]:top-1/2 [&>iframe]:h-[max(100cqh,56.25cqw)] [&>iframe]:w-[max(100cqw,177.78cqh)] [&>iframe]:-translate-x-1/2 [&>iframe]:-translate-y-1/2 [&>iframe]:scale-100 lg:[&>iframe]:scale-110"
    />
  );
}