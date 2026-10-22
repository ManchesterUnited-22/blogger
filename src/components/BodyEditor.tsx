import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { Bold, ChevronDown, Italic, RemoveFormatting, Underline, X } from 'lucide-react';
import { IMAGE_LINE } from '@/lib/posts';
import {
  COLOR_PALETTE,
  DEFAULT_TEXT_COLOR,
  FONTS,
  FONT_SIZES,
  MAX_SIZE,
  MIN_SIZE,
  findFont,
  linesToEditorHtml,
  nodeToLines,
  rgbToHex,
} from '@/lib/richText';

type TextBlock = { id: string; type: 'text'; text: string };
type ImageBlock = { id: string; type: 'image'; url: string };
type Block = TextBlock | ImageBlock;

export type BodyEditorHandle = { insertImage: (url: string) => void };

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

let uid = 0;
const nid = () => `b${++uid}`;

/** Chuỗi nội dung -> các khối (chữ / ảnh) */
function parse(content: string): Block[] {
  const blocks: Block[] = [];
  let buf: string[] = [];
  const flush = () => {
    blocks.push({ id: nid(), type: 'text', text: buf.join('\n') });
    buf = [];
  };
  for (const line of content.split('\n')) {
    const m = line.trim().match(IMAGE_LINE);
    if (m) {
      flush();
      blocks.push({ id: nid(), type: 'image', url: m[2] });
    } else {
      buf.push(line);
    }
  }
  flush();
  return blocks;
}

/** Các khối -> chuỗi nội dung (cùng định dạng cũ: dòng ![](url) cho ảnh) */
function serialize(blocks: Block[]): string {
  return blocks
    .filter((b) => b.type === 'image' || b.text.trim() !== '')
    .map((b) => (b.type === 'image' ? `![](${b.url})` : b.text))
    .join('\n');
}

/* ------------------------------------------------------------------ */
/* Ô chữ có thể định dạng (contentEditable)                           */
/* ------------------------------------------------------------------ */

function RichBlock({
  id,
  initial,
  placeholder,
  minHeightClass,
  register,
  onInput,
}: {
  id: string;
  initial: string;
  placeholder?: string;
  minHeightClass: string;
  register: (id: string, el: HTMLDivElement | null) => void;
  onInput: (id: string, el: HTMLDivElement) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(() => initial.trim() === '');

  // Chỉ nạp nội dung một lần; sau đó trình duyệt tự quản lý (tránh nhảy con trỏ)
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = linesToEditorHtml(initial);
    document.execCommand('defaultParagraphSeparator', false, 'div');
    register(id, el);
    return () => register(id, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // Dán chữ thuần để không kéo theo định dạng/mã lạ từ nơi khác
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain').replace(/\r/g, '');
    text.split('\n').forEach((line, i) => {
      if (i > 0) document.execCommand('insertParagraph');
      if (line) document.execCommand('insertText', false, line);
    });
  };

  return (
    <div className="relative">
      {empty && placeholder && (
        <div className="pointer-events-none absolute left-2 top-1.5 select-none text-gray-400">{placeholder}</div>
      )}
      <div
        ref={ref}
        data-rich-block={id}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        onInput={(e) => {
          const el = e.currentTarget;
          setEmpty((el.textContent ?? '') === '');
          onInput(id, el);
        }}
        onPaste={handlePaste}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            document.execCommand('insertParagraph');
          }
        }}
        className={`w-full whitespace-pre-wrap break-words px-2 py-1.5 text-lg leading-relaxed text-gray-700 outline-none ${minHeightClass}`}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Thanh công cụ giống Word                                           */
/* ------------------------------------------------------------------ */

type FormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontName: string | null;
  size: number;
  color: string;
};

const DEFAULT_STATE: FormatState = {
  bold: false,
  italic: false,
  underline: false,
  fontName: null,
  size: 18,
  color: DEFAULT_TEXT_COLOR,
};

const BodyEditor = forwardRef<BodyEditorHandle, Props>(function BodyEditor(
  { value, onChange, placeholder },
  ref,
) {
  const [blocks, setBlocks] = useState<Block[]>(() => parse(value));
  const blocksRef = useRef<Block[]>(blocks);
  blocksRef.current = blocks;
  const lastValue = useRef(value);

  const rootRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<string, HTMLDivElement>());
  // Vùng chọn / con trỏ gần nhất trong ô soạn thảo (để thanh công cụ và nút "Chèn ảnh" dùng lại)
  const saved = useRef<{ id: string; range: Range } | null>(null);

  const [fmt, setFmt] = useState<FormatState>(DEFAULT_STATE);
  const [open, setOpen] = useState<'font' | 'size' | 'color' | null>(null);
  const [sizeText, setSizeText] = useState('18');

  // Nội dung bị đổi từ bên ngoài (bấm sửa bài, hủy, đăng xong...) -> nạp lại
  useEffect(() => {
    if (value !== lastValue.current) {
      lastValue.current = value;
      setBlocks(parse(value));
      saved.current = null;
    }
  }, [value]);

  const commit = (next: Block[]) => {
    blocksRef.current = next;
    setBlocks(next);
    const s = serialize(next);
    lastValue.current = s;
    onChange(s);
  };

  const register = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) els.current.set(id, el);
    else els.current.delete(id);
  }, []);

  /** Đọc lại nội dung ô chữ từ DOM -> lưu vào state */
  const syncBlock = (id: string, el: HTMLDivElement) => {
    const text = nodeToLines(el);
    commit(blocksRef.current.map((b) => (b.id === id && b.type === 'text' ? { ...b, text } : b)));
  };

  /* ---- Theo dõi vùng chọn để cập nhật thanh công cụ ---- */
  useEffect(() => {
    const onSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const startEl =
        range.startContainer.nodeType === Node.TEXT_NODE
          ? range.startContainer.parentElement
          : (range.startContainer as HTMLElement);
      const blockEl = startEl?.closest?.('[data-rich-block]') as HTMLElement | null;
      if (!blockEl || !rootRef.current?.contains(blockEl)) return;

      saved.current = { id: blockEl.dataset.richBlock as string, range: range.cloneRange() };

      const cs = window.getComputedStyle(startEl as Element);
      const size = Math.round(parseFloat(cs.fontSize)) || 18;
      setFmt({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        fontName: findFont(cs.fontFamily)?.name ?? null,
        size,
        color: rgbToHex(cs.color) ?? DEFAULT_TEXT_COLOR,
      });
      setSizeText(String(size));
    };
    document.addEventListener('selectionchange', onSelection);
    return () => document.removeEventListener('selectionchange', onSelection);
  }, []);

  // Đóng danh sách khi bấm ra ngoài thanh công cụ
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!toolbarRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  /** Trả vùng chọn đã lưu về đúng ô chữ, rồi chạy lệnh định dạng */
  const withSelection = (fn: (blockEl: HTMLDivElement, range: Range) => void) => {
    const s = saved.current;
    const el = s && els.current.get(s.id);
    if (!s || !el) return;
    el.focus({ preventScroll: true });
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(s.range);
    document.execCommand('styleWithCSS', false, 'true');
    fn(el, s.range);
    syncBlock(s.id, el);
    // giữ lại vùng chọn mới để bấm tiếp các nút khác
    const cur = window.getSelection();
    if (cur && cur.rangeCount) saved.current = { id: s.id, range: cur.getRangeAt(0).cloneRange() };
  };

  const toggle = (cmd: 'bold' | 'italic' | 'underline') => withSelection(() => document.execCommand(cmd));

  const applyFont = (name: string) => {
    setOpen(null);
    withSelection(() => document.execCommand('fontName', false, name));
  };

  const applyColor = (hex: string) => {
    setOpen(null);
    withSelection(() => document.execCommand('foreColor', false, hex));
  };

  const applySize = (raw: number) => {
    const px = Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.round(raw)));
    if (!Number.isFinite(px)) return;
    setOpen(null);
    setSizeText(String(px));
    withSelection((el, range) => {
      if (range.collapsed) return; // giống Word: chọn (bôi đen) chữ rồi mới đổi cỡ
      // Mẹo: execCommand chỉ có 7 cỡ -> dùng cỡ 7 làm dấu rồi đổi thành px mong muốn
      document.execCommand('fontSize', false, '7');
      el.querySelectorAll<HTMLElement>('span[style*="xxx-large"], font[size="7"]').forEach((m) => {
        m.removeAttribute('size');
        m.style.fontSize = `${px}px`;
        // xóa cỡ cũ nằm lồng bên trong để cỡ mới có hiệu lực
        m.querySelectorAll<HTMLElement>('[style*="font-size"]').forEach((inner) => {
          inner.style.fontSize = '';
        });
      });
    });
  };

  const clearFormat = () => withSelection(() => document.execCommand('removeFormat'));

  /* ---- Chèn ảnh tại vị trí con trỏ ---- */
  const insertImage = (url: string) => {
    const cur = blocksRef.current;
    const img: ImageBlock = { id: nid(), type: 'image', url };
    const s = saved.current;
    const idx = s ? cur.findIndex((b) => b.id === s.id && b.type === 'text') : -1;
    const el = s && els.current.get(s.id);

    if (!s || idx === -1 || !el || !el.contains(s.range.startContainer)) {
      // Chưa có vị trí con trỏ -> chèn xuống cuối bài
      commit([...cur, img, { id: nid(), type: 'text', text: '' }]);
      return;
    }
    // Tách ô chữ thành 2 phần: trước và sau con trỏ (giữ nguyên định dạng)
    const before = document.createElement('div');
    const r1 = document.createRange();
    r1.setStart(el, 0);
    r1.setEnd(s.range.startContainer, s.range.startOffset);
    before.appendChild(r1.cloneContents());

    const after = document.createElement('div');
    const r2 = document.createRange();
    r2.setStart(s.range.endContainer, s.range.endOffset);
    r2.setEnd(el, el.childNodes.length);
    after.appendChild(r2.cloneContents());

    commit([
      ...cur.slice(0, idx),
      { id: nid(), type: 'text', text: nodeToLines(before) },
      img,
      { id: nid(), type: 'text', text: nodeToLines(after) },
      ...cur.slice(idx + 1),
    ]);
    saved.current = null;
  };

  useImperativeHandle(ref, () => ({ insertImage }), []);

  const removeImage = (id: string) => {
    let next = blocksRef.current.filter((b) => b.id !== id);
    if (!next.some((b) => b.type === 'text')) next = [{ id: nid(), type: 'text', text: '' }];
    commit(next);
  };

  const onlyOne = blocks.length === 1;

  /* ---- Giao diện ---- */
  // Giữ vùng chọn khi bấm nút: chặn mặc định của mousedown (trừ ô nhập số)
  const keepSel = (e: React.MouseEvent) => e.preventDefault();

  const btn = (active: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-200 ${
      active ? 'bg-teal-100 text-teal-700' : ''
    }`;

  const popup =
    'absolute left-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg';

  return (
    <div
      ref={rootRef}
      className="min-h-[12rem] rounded-xl border border-gray-200 bg-white focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100"
    >
      {/* Thanh công cụ */}
      <div
        ref={toolbarRef}
        className="sticky top-16 z-20 flex flex-wrap items-center gap-1 rounded-t-xl border-b border-gray-200 bg-gray-50 px-2 py-1.5"
      >
        {/* Phông chữ */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={keepSel}
            onClick={() => setOpen(open === 'font' ? null : 'font')}
            title="Phông chữ"
            className="flex h-8 w-40 items-center justify-between rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-800 hover:border-gray-300"
          >
            <span className="truncate" style={{ fontFamily: findFont(fmt.fontName)?.stack }}>
              {fmt.fontName ?? 'Mặc định'}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
          </button>
          {open === 'font' && (
            <div className={`${popup} w-52`}>
              {FONTS.map((f) => (
                <button
                  key={f.name}
                  type="button"
                  onMouseDown={keepSel}
                  onClick={() => applyFont(f.name)}
                  style={{ fontFamily: f.stack }}
                  className={`block w-full px-3 py-1.5 text-left text-base hover:bg-teal-50 ${
                    fmt.fontName === f.name ? 'bg-teal-50 text-teal-700' : 'text-gray-800'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cỡ chữ */}
        <div className="relative">
          <div className="flex h-8 w-20 items-center rounded-md border border-gray-200 bg-white hover:border-gray-300">
            <input
              value={sizeText}
              inputMode="numeric"
              title="Cỡ chữ (bôi đen chữ rồi chọn)"
              aria-label="Cỡ chữ"
              onChange={(e) => setSizeText(e.target.value.replace(/\D/g, '').slice(0, 3))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applySize(Number(sizeText));
                }
              }}
              onBlur={() => setSizeText(String(fmt.size))}
              className="h-full w-full min-w-0 rounded-md bg-transparent px-2 text-sm text-gray-800 outline-none"
            />
            <button
              type="button"
              onMouseDown={keepSel}
              onClick={() => setOpen(open === 'size' ? null : 'size')}
              aria-label="Danh sách cỡ chữ"
              className="flex h-full w-7 shrink-0 items-center justify-center text-gray-400 hover:text-gray-700"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          {open === 'size' && (
            <div className={`${popup} w-20`}>
              {FONT_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={keepSel}
                  onClick={() => applySize(s)}
                  className={`block w-full px-3 py-1 text-left text-sm hover:bg-teal-50 ${
                    fmt.size === s ? 'bg-teal-50 text-teal-700' : 'text-gray-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="mx-1 h-5 w-px bg-gray-300" />

        <button type="button" onMouseDown={keepSel} onClick={() => toggle('bold')} title="In đậm (Ctrl+B)" aria-label="In đậm" className={btn(fmt.bold)}>
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" onMouseDown={keepSel} onClick={() => toggle('italic')} title="In nghiêng (Ctrl+I)" aria-label="In nghiêng" className={btn(fmt.italic)}>
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" onMouseDown={keepSel} onClick={() => toggle('underline')} title="Gạch chân (Ctrl+U)" aria-label="Gạch chân" className={btn(fmt.underline)}>
          <Underline className="h-4 w-4" />
        </button>

        {/* Màu chữ */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={keepSel}
            onClick={() => setOpen(open === 'color' ? null : 'color')}
            title="Màu chữ"
            aria-label="Màu chữ"
            className="flex h-8 items-center gap-0.5 rounded-md px-1.5 text-gray-700 hover:bg-gray-200"
          >
            <span className="flex flex-col items-center leading-none">
              <span className="text-base font-bold">A</span>
              <span className="mt-0.5 h-1 w-4 rounded-sm" style={{ backgroundColor: fmt.color }} />
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>
          {open === 'color' && (
            <div className={`${popup} w-56 p-2`}>
              <button
                type="button"
                onMouseDown={keepSel}
                onClick={() => applyColor(DEFAULT_TEXT_COLOR)}
                className="mb-2 flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                <span className="h-4 w-4 rounded border border-gray-300" style={{ backgroundColor: DEFAULT_TEXT_COLOR }} />
                Màu mặc định
              </button>
              <div className="grid grid-cols-6 gap-1.5">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={keepSel}
                    onClick={() => applyColor(c)}
                    aria-label={c}
                    title={c}
                    style={{ backgroundColor: c }}
                    className={`h-6 w-6 rounded border hover:scale-110 ${
                      c === '#ffffff' ? 'border-gray-300' : 'border-transparent'
                    } ${fmt.color === c ? 'ring-2 ring-teal-500 ring-offset-1' : ''}`}
                  />
                ))}
              </div>
              <label className="mt-2 flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-100">
                <input
                  type="color"
                  value={fmt.color}
                  onChange={(e) => applyColor(e.target.value)}
                  className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0"
                />
                Màu khác…
              </label>
            </div>
          )}
        </div>

        <span className="mx-1 h-5 w-px bg-gray-300" />

        <button type="button" onMouseDown={keepSel} onClick={clearFormat} title="Xóa định dạng" aria-label="Xóa định dạng" className={btn(false)}>
          <RemoveFormatting className="h-4 w-4" />
        </button>
      </div>

      {/* Nội dung */}
      <div className="space-y-2 p-2">
        {blocks.map((b, i) =>
          b.type === 'text' ? (
            <RichBlock
              key={b.id}
              id={b.id}
              initial={b.text}
              register={register}
              onInput={syncBlock}
              placeholder={onlyOne ? placeholder : i === 0 ? placeholder : undefined}
              minHeightClass={onlyOne ? 'min-h-[10rem]' : i === blocks.length - 1 ? 'min-h-[4rem]' : 'min-h-[2.25rem]'}
            />
          ) : (
            <div key={b.id} className="relative overflow-hidden rounded-xl bg-gray-50">
              <img src={b.url} alt="" className="mx-auto max-h-96 w-full object-contain" />
              <button
                type="button"
                onClick={() => removeImage(b.id)}
                aria-label="Xóa ảnh"
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