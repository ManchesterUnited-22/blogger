import { playableVideoUrl, videoPosterUrl, youtubeId } from '@/lib/posts';

export default function VideoEmbed({ url }: { url: string }) {
  const id = youtubeId(url);
  if (id) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
          title="Video YouTube"
          className="h-full w-full"
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }
  return (
    <video
      src={playableVideoUrl(url)}
      poster={videoPosterUrl(url)}
      controls
      playsInline
      preload="metadata"
      className="max-h-[32rem] w-full rounded-2xl bg-black"
    />
  );
}