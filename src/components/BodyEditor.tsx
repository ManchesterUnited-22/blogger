import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Italic, Underline, X } from 'lucide-react';
import { IMAGE_LINE, VIDEO_LINE } from '@/lib/posts';
import VideoEmbed from '@/components/VideoEmbed';
import {
  COLOR_PALETTE,
  DEFAULT_TEXT_COLOR,
  FONTS,
  FONT_SIZES,
  findFont,
  linesToEditorHtml,
  nodeToLines,
  type Align,
} from '@/lib/richText';

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

/** Các khối -> chuỗi nội dung (ảnh: ![](url), video: @[video](url), chữ: HTML sạch từng dòng) */
function serialize(blocks: Block[]): string {
  return blocks
    .filter((b) => b.type !== 'text' || b.text.trim() !== '')
    .map((b) => (b.type === 'image' ? `![](${b.url})` : b.type === 'video' ? `@[video](${b.url})` : b.text))
    .join('\n');
}

/** execCommand('fontSize') chỉ có cỡ 1-7 -> đổi thẻ <font size=7> thành span cỡ px thật. */
function normalizeSize(root: HTMLElement, px: number) {
  root.querySelectorAll('font[size="7"]').forEach((f) => {
    const el = f as HTMLElement;
    el.removeAttribute('size');
    el.style.fontSize = `${px}px`;
  });
  root.querySelectorAll<HTMLElement>('[style*="xxx-large"]').forEach((el) => {
    el.style.fontSize = `${px}px`;
  });
}

/** Trạng thái định dạng tại vị trí con trỏ (để tô sáng nút trên thanh công cụ). */
function readFmt(): { b: boolean; i: boolean; u: boolean; al: Align } {
  const q = (c: string) => {
    try {
      return document.queryCommandState(c);
    } catch {
      return false;
    }
  };
  return {
    b: q('bold'),
    i: q('italic'),
    u: q('underline'),
    al: q('justifyCenter') ? 'center' : q('justifyRight') ? 'right' : q('justifyFull') ? 'justify' : 'left',
  };
}

const ALIGN_BUTTONS = [
  { cmd: 'justifyLeft', al: 'left', label: 'Căn trái', Icon: AlignLeft },
  { cmd: 'justifyCenter', al: 'center', label: 'Căn giữa', Icon: AlignCenter },
  { cmd: 'justifyRight', al: 'right', label: 'Căn phải', Icon: AlignRight },
  { cmd: 'justifyFull', al: 'justify', label: 'Căn đều hai bên', Icon: AlignJustify },
] as const;

function RichTextBlock({
  initial,
  placeholder,
  minHeightClass,
  register,
  onInput,
}: {
  initial: string;
  placeholder?: string;
  minHeightClass: string;
  register: (el: HTMLDivElement | null) => void;
  onInput: (el: HTMLDivElement) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Chỉ nạp nội dung một lần khi khối được tạo. Sau đó trình duyệt tự quản lý nội dung.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = linesToEditorHtml(initial);
    el.dataset.empty = String(!el.textContent);
    register(el);
    return () => register(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      data-placeholder={placeholder ?? ''}
      onInput={(e) => {
        const el = e.currentTarget;
        el.dataset.empty = String(!el.textContent);
        onInput(el);
      }}
      onPaste={(e) => {
        // Dán dưới dạng chữ thuần để không mang định dạng lạ từ nơi khác
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      }}
      className={`relative w-full whitespace-pre-wrap break-words bg-transparent px-2 py-1.5 text-sm leading-relaxed text-gray-800 outline-none data-[empty=true]:before:pointer-events-none data-[empty=true]:before:absolute data-[empty=true]:before:text-gray-400 data-[empty=true]:before:content-[attr(data-placeholder)] ${minHeightClass}`}
    />
  );
}

const toolBtn =
  'flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100';
const toolSelect =
  'h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none hover:border-gray-200 focus:border-teal-400';

const BodyEditor = forwardRef<BodyEditorHandle, Props>(function BodyEditor(
  { value, onChange, placeholder },
  ref,
) {
  const [blocks, setBlocks] = useState<Block[]>(() => parse(value));
  const blocksRef = useRef<Block[]>(blocks);
  blocksRef.current = blocks;
  const lastValue = useRef(value);

  const rootRef = useRef<HTMLDivElement>(null);
  const blockEls = useRef(new Map<string, HTMLDivElement>());
  // Vị trí con trỏ / vùng chọn gần nhất trong các khối chữ
  const caret = useRef<{ id: string; range: Range } | null>(null);
  const pendingSize = useRef(16);

  const [fmt, setFmt] = useState<{ b: boolean; i: boolean; u: boolean; al: Align }>({
    b: false,
    i: false,
    u: false,
    al: 'left',
  });
  const [colorOpen, setColorOpen] = useState(false);
  const [color, setColor] = useState(DEFAULT_TEXT_COLOR);
  // Phông và cỡ chữ tại vị trí con trỏ (hiện trên ô chọn như Word)
  const [curFont, setCurFont] = useState('');
  const [curSize, setCurSize] = useState(0);

  // Nội dung bị đổi từ bên ngoài (bấm sửa bài, hủy, đăng xong...) -> nạp lại
  useEffect(() => {
    if (value !== lastValue.current) {
      lastValue.current = value;
      setBlocks(parse(value));
      caret.current = null;
    }
  }, [value]);

  // Ghi nhớ vùng chọn trong khung chữ, để bấm thanh công cụ vẫn áp dụng đúng chỗ
  useEffect(() => {
    const onSel = () => {
      const sel = window.getSelection();
      const root = rootRef.current;
      if (!sel || sel.rangeCount === 0 || !root) return;
      const node = sel.anchorNode;
      if (!node || !root.contains(node)) return;
      for (const [id, el] of blockEls.current) {
        if (el.contains(node)) {
          caret.current = { id, range: sel.getRangeAt(0).cloneRange() };
          setFmt(readFmt());
          readCurrent(sel.getRangeAt(0));
          return;
        }
      }
    };
    // Đọc phông + cỡ chữ đang áp dụng tại vị trí con trỏ
    const readCurrent = (range: Range) => {
      const n = range.startContainer;
      const el = n.nodeType === Node.ELEMENT_NODE ? (n as Element) : n.parentElement;
      if (!el) return;
      const cs = getComputedStyle(el);
      let name = '';
      try {
        name = findFont(document.queryCommandValue('fontName'))?.name ?? '';
      } catch {
        /* bỏ qua */
      }
      setCurFont(name || findFont(cs.fontFamily)?.name || '');
      setCurSize(Math.round(parseFloat(cs.fontSize)) || 0);
    };
    document.addEventListener('selectionchange', onSel);
    return () => document.removeEventListener('selectionchange', onSel);
  }, []);

  const commit = (next: Block[]) => {
    blocksRef.current = next;
    setBlocks(next);
    const s = serialize(next);
    lastValue.current = s;
    onChange(s);
  };

  const setText = (id: string, text: string) =>
    commit(blocksRef.current.map((b) => (b.id === id && b.type === 'text' ? { ...b, text } : b)));

  /** Đọc lại nội dung khối chữ từ màn hình rồi lưu vào state. */
  const sync = (id: string) => {
    const el = blockEls.current.get(id);
    if (!el) return;
    el.dataset.empty = String(!el.textContent);
    setText(id, nodeToLines(el));
  };

  /** Đưa vùng chọn đã nhớ trở lại ô soạn thảo. Trả về id khối, hoặc null nếu chưa có. */
  const restore = (): string | null => {
    const c = caret.current;
    if (!c) return null;
    const el = blockEls.current.get(c.id);
    if (!el || !el.isConnected) return null;
    el.focus();
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(c.range);
    return c.id;
  };

  const run = (fn: (el: HTMLDivElement) => void) => {
    const id = restore();
    if (!id) return;
    const el = blockEls.current.get(id);
    if (!el) return;
    fn(el);
    sync(id);
    const sel = window.getSelection();
    if (sel && sel.rangeCount) caret.current = { id, range: sel.getRangeAt(0).cloneRange() };
    setFmt(readFmt());
  };

  const toggle = (cmd: 'bold' | 'italic' | 'underline') =>
    run(() => {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand(cmd);
    });

  const applyAlign = (cmd: string) =>
    run(() => {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand(cmd);
    });

  const applyFont = (name: string, stack: string) => {
    setCurFont(name);
    run(() => {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontName', false, stack);
    });
  };

  const applySize = (px: number) => {
    pendingSize.current = px;
    setCurSize(px);
    run((el) => {
      document.execCommand('styleWithCSS', false, 'false');
      document.execCommand('fontSize', false, '7');
      normalizeSize(el, px);
    });
  };

  const applyColor = (hex: string) => {
    setColor(hex);
    setColorOpen(false);
    run(() => {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('foreColor', false, hex);
    });
  };

  // Chèn một khối (ảnh / video) tại vị trí con trỏ, hoặc xuống cuối bài nếu chưa có con trỏ
  const insertMedia = (media: ImageBlock | VideoBlock) => {
    const cur = blocksRef.current;
    const c = caret.current;
    const idx = c ? cur.findIndex((b) => b.id === c.id && b.type === 'text') : -1;
    const el = c ? blockEls.current.get(c.id) : undefined;

    if (!c || idx === -1 || !el || !el.contains(c.range.startContainer) || !el.contains(c.range.endContainer)) {
      commit([...cur, media, { id: nid(), type: 'text', text: '' }]);
      return;
    }

    // Cắt nội dung khối chữ làm hai nửa: trước và sau con trỏ
    const pre = document.createRange();
    pre.selectNodeContents(el);
    pre.setEnd(c.range.startContainer, c.range.startOffset);
    const post = document.createRange();
    post.selectNodeContents(el);
    post.setStart(c.range.endContainer, c.range.endOffset);
    const before = nodeToLines(pre.cloneContents());
    const after = nodeToLines(post.cloneContents());

    commit([
      ...cur.slice(0, idx),
      { id: nid(), type: 'text', text: before },
      media,
      { id: nid(), type: 'text', text: after },
      ...cur.slice(idx + 1),
    ]);
    caret.current = null;
  };

  const insertImage = (url: string) => insertMedia({ id: nid(), type: 'image', url });
  const insertVideo = (url: string) => insertMedia({ id: nid(), type: 'video', url });

  useImperativeHandle(ref, () => ({ insertImage, insertVideo }), []);

  const removeMedia = (id: string) => {
    let next = blocksRef.current.filter((b) => b.id !== id);
    if (!next.some((b) => b.type === 'text')) next = [{ id: nid(), type: 'text', text: '' }];
    commit(next);
  };

  const onlyOne = blocks.length === 1;
  const keepFocus = (e: ReactMouseEvent) => e.preventDefault();

  return (
    <div
      ref={rootRef}
      className="min-h-[12rem] rounded-xl border border-gray-200 bg-white p-2 transition-colors focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-100"
    >
      {/* Thanh công cụ định dạng chữ */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5 border-b border-gray-100 pb-2">
        <select
          value={curFont}
          onChange={(e) => {
            const f = FONTS.find((x) => x.name === e.target.value);
            if (f) applyFont(f.name, f.stack);
          }}
          className={`${toolSelect} w-40`}
          style={curFont ? { fontFamily: FONTS.find((x) => x.name === curFont)?.stack } : undefined}
          aria-label="Phông chữ"
        >
          <option value="" disabled>
            Phông mặc định
          </option>
          {FONTS.map((f) => (
            <option key={f.name} value={f.name} style={{ fontFamily: f.stack }}>
              {f.name}
            </option>
          ))}
        </select>

        <select
          value={FONT_SIZES.includes(curSize) ? curSize : ''}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (n) applySize(n);
          }}
          className={toolSelect}
          aria-label="Cỡ chữ"
        >
          <option value="" disabled>
            Cỡ chữ
          </option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          type="button"
          onMouseDown={keepFocus}
          onClick={() => toggle('bold')}
          aria-label="In đậm"
          title="In đậm"
          className={`${toolBtn} ${fmt.b ? 'bg-teal-100 text-teal-700' : ''}`}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={keepFocus}
          onClick={() => toggle('italic')}
          aria-label="In nghiêng"
          title="In nghiêng"
          className={`${toolBtn} ${fmt.i ? 'bg-teal-100 text-teal-700' : ''}`}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={keepFocus}
          onClick={() => toggle('underline')}
          aria-label="Gạch chân"
          title="Gạch chân"
          className={`${toolBtn} ${fmt.u ? 'bg-teal-100 text-teal-700' : ''}`}
        >
          <Underline className="h-4 w-4" />
        </button>

        <span className="mx-0.5 h-5 w-px bg-gray-200" />

        {/* Căn lề */}
        {ALIGN_BUTTONS.map(({ cmd, al, label, Icon }) => (
          <button
            key={cmd}
            type="button"
            onMouseDown={keepFocus}
            onClick={() => applyAlign(cmd)}
            aria-label={label}
            title={label}
            className={`${toolBtn} ${fmt.al === al ? 'bg-teal-100 text-teal-700' : ''}`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}

        {/* Màu chữ */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={keepFocus}
            onClick={() => setColorOpen((o) => !o)}
            aria-label="Màu chữ"
            title="Màu chữ"
            className={`${toolBtn} flex-col gap-0.5`}
          >
            <span className="text-sm font-extrabold leading-none">A</span>
            <span className="h-1 w-4 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
          </button>
          {colorOpen && (
            <div
              onMouseDown={keepFocus}
              className="absolute left-0 top-full z-20 mt-1 grid w-44 grid-cols-6 gap-1.5 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
            >
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => applyColor(c)}
                  aria-label={`Màu ${c}`}
                  className="h-6 w-6 rounded-full border border-gray-200 transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {blocks.map((b, i) =>
          b.type === 'text' ? (
            <RichTextBlock
              key={b.id}
              initial={b.text}
              register={(el) => {
                if (el) blockEls.current.set(b.id, el);
                else blockEls.current.delete(b.id);
              }}
              onInput={(el) => {
                normalizeSize(el, pendingSize.current);
                sync(b.id);
              }}
              placeholder={onlyOne ? placeholder : i === 0 ? placeholder : undefined}
              minHeightClass={onlyOne ? 'min-h-[10rem]' : i === blocks.length - 1 ? 'min-h-[4rem]' : 'min-h-[2.25rem]'}
            />
          ) : (
            <div key={b.id} className="relative overflow-hidden rounded-xl bg-gray-50">
              {b.type === 'image' ? (
                <img src={b.url} alt="" className="mx-auto max-h-96 w-full object-contain" />
              ) : (
                <VideoEmbed url={b.url} />
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
    </div>
  );
});

export default BodyEditor;