import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { IMAGE_LINE, VIDEO_LINE } from '@/lib/posts';

type TextBlock = { id: string; type: 'text'; text: string };
type ImageBlock = { id: string; type: 'image'; url: string };
type VideoBlock = { id: string; type: 'video'; url: string };
type Block = TextBlock | ImageBlock | VideoBlock;

export type BodyEditorHandle = {
  insertImage: (url: string) => void;
  insertVideo: (url: string) => void;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

let uid = 0;
const nid = () => `b${++uid}`;

/** Chuỗi nội dung -> các khối (chữ / ảnh / video) */
function parse(content: string): Block[] {
  const blocks: Block[] = [];
  let buf: string[] = [];
  const flush = () => {
    blocks.push({ id: nid(), type: 'text', text: buf.join('\n') });
    buf = [];
  };
  for (const line of content.split('\n')) {
    const t = line.trim();
    const img = t.match(IMAGE_LINE);
    const vid = t.match(VIDEO_LINE);
    if (img) {
      flush();
      blocks.push({ id: nid(), type: 'image', url: img[2] });
    } else if (vid) {
      flush();
      blocks.push({ id: nid(), type: 'video', url: vid[1] });
    } else {
      buf.push(line);
    }
  }
  flush();
  return blocks;
}

/** Các khối -> chuỗi nội dung (ảnh: ![](url), video: @[video](url)) */
function serialize(blocks: Block[]): string {
  return blocks
    .filter((b) => b.type !== 'text' || b.text.trim() !== '')
    .map((b) => (b.type === 'image' ? `![](${b.url})` : b.type === 'video' ? `@[video](${b.url})` : b.text))
    .join('\n');
}

function AutoTextarea({
  value,
  onChange,
  onCaret,
  placeholder,
  minHeightClass,
}: {
  value: string;
  onChange: (v: string) => void;
  onCaret: (el: HTMLTextAreaElement) => void;
  placeholder?: string;
  minHeightClass: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Tự giãn chiều cao theo nội dung
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      maxLength={20000}
      onChange={(e) => onChange(e.target.value)}
      onSelect={(e) => onCaret(e.currentTarget)}
      onBlur={(e) => onCaret(e.currentTarget)}
      onKeyUp={(e) => onCaret(e.currentTarget)}
      onClick={(e) => onCaret(e.currentTarget)}
      className={`w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed text-gray-800 outline-none ${minHeightClass}`}
    />
  );
}

const BodyEditor = forwardRef<BodyEditorHandle, Props>(function BodyEditor(
  { value, onChange, placeholder },
  ref,
) {
  const [blocks, setBlocks] = useState<Block[]>(() => parse(value));
  const blocksRef = useRef<Block[]>(blocks);
  blocksRef.current = blocks;
  const lastValue = useRef(value);
  const caret = useRef<{ id: string; start: number; end: number } | null>(null);

  // Nội dung bị đổi từ bên ngoài (bấm sửa bài, hủy, đăng xong...) -> nạp lại
  useEffect(() => {
    if (value !== lastValue.current) {
      lastValue.current = value;
      setBlocks(parse(value));
      caret.current = null;
    }
  }, [value]);

  const commit = (next: Block[]) => {
    blocksRef.current = next;
    setBlocks(next);
    const s = serialize(next);
    lastValue.current = s;
    onChange(s);
  };

  const recordCaret = (id: string, el: HTMLTextAreaElement) => {
    caret.current = { id, start: el.selectionStart, end: el.selectionEnd };
  };

  // Chèn một khối (ảnh / video) tại vị trí con trỏ, hoặc xuống cuối bài nếu chưa có con trỏ
  const insertMedia = (media: ImageBlock | VideoBlock) => {
    const cur = blocksRef.current;
    const c = caret.current;
    const idx = c ? cur.findIndex((b) => b.id === c.id && b.type === 'text') : -1;

    if (!c || idx === -1) {
      commit([...cur, media, { id: nid(), type: 'text', text: '' }]);
      return;
    }
    const b = cur[idx] as TextBlock;
    commit([
      ...cur.slice(0, idx),
      { ...b, text: b.text.slice(0, c.start) },
      media,
      { id: nid(), type: 'text', text: b.text.slice(c.end) },
      ...cur.slice(idx + 1),
    ]);
    caret.current = null;
  };

  const insertImage = (url: string) => insertMedia({ id: nid(), type: 'image', url });
  const insertVideo = (url: string) => insertMedia({ id: nid(), type: 'video', url });

  useImperativeHandle(ref, () => ({ insertImage, insertVideo }), []);

  const setText = (id: string, text: string) =>
    commit(blocksRef.current.map((b) => (b.id === id && b.type === 'text' ? { ...b, text } : b)));

  const removeMedia = (id: string) => {
    let next = blocksRef.current.filter((b) => b.id !== id);
    if (!next.some((b) => b.type === 'text')) next = [{ id: nid(), type: 'text', text: '' }];
    commit(next);
  };

  const onlyOne = blocks.length === 1;

  return (
    <div className="min-h-[12rem] space-y-2 rounded-xl border border-gray-200 bg-white p-2 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100">
      {blocks.map((b, i) =>
        b.type === 'text' ? (
          <AutoTextarea
            key={b.id}
            value={b.text}
            onChange={(v) => setText(b.id, v)}
            onCaret={(el) => recordCaret(b.id, el)}
            placeholder={onlyOne ? placeholder : i === 0 ? placeholder : undefined}
            minHeightClass={onlyOne ? 'min-h-[10rem]' : i === blocks.length - 1 ? 'min-h-[4rem]' : 'min-h-[2.25rem]'}
          />
        ) : (
          <div key={b.id} className="relative overflow-hidden rounded-xl bg-gray-50">
            {b.type === 'image' ? (
              <img src={b.url} alt="" className="mx-auto max-h-96 w-full object-contain" />
            ) : (
              <video
                src={b.url}
                controls
                playsInline
                preload="metadata"
                className="mx-auto max-h-96 w-full bg-black object-contain"
              />
            )}
            <button
              type="button"
              onClick={() => removeMedia(b.id)}
              aria-label={b.type === 'image' ? 'Xóa ảnh' : 'Xóa video'}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-rose-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ),
      )}
    </div>
  );
});

export default BodyEditor;