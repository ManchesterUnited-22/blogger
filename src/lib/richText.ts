/**
 * Định dạng chữ trong bài viết (phông, cỡ chữ, màu, đậm, nghiêng, gạch chân).
 *
 * Mỗi dòng chữ của bài được lưu dưới dạng HTML "sạch" chỉ gồm:
 *   <b> <i> <u> và <span style="font-family:..;font-size:..px;color:#rrggbb">
 * Dòng ảnh (![](url)) và bài cũ (chữ thường, không thẻ) vẫn hoạt động như trước.
 */

export const DEFAULT_TEXT_COLOR = '#374151';

export type FontOption = { name: string; stack: string };

export const FONTS: FontOption[] = [
  // Phông có sẵn trong máy
  { name: 'Arial', stack: 'Arial, Helvetica, sans-serif' },
  { name: 'Times New Roman', stack: '"Times New Roman", Times, serif' },
  { name: 'Georgia', stack: 'Georgia, serif' },
  { name: 'Verdana', stack: 'Verdana, Geneva, sans-serif' },
  { name: 'Tahoma', stack: 'Tahoma, Geneva, sans-serif' },
  { name: 'Trebuchet MS', stack: '"Trebuchet MS", Helvetica, sans-serif' },
  { name: 'Courier New', stack: '"Courier New", Courier, monospace' },
  { name: 'Comic Sans MS', stack: '"Comic Sans MS", "Comic Sans", cursive' },
  // Phông Google Fonts (có hỗ trợ tiếng Việt, được tải trong index.html)
  { name: 'Roboto', stack: 'Roboto, Arial, sans-serif' },
  { name: 'Open Sans', stack: '"Open Sans", Arial, sans-serif' },
  { name: 'Montserrat', stack: 'Montserrat, Arial, sans-serif' },
  { name: 'Nunito', stack: 'Nunito, Arial, sans-serif' },
  { name: 'Quicksand', stack: 'Quicksand, Arial, sans-serif' },
  { name: 'Be Vietnam Pro', stack: '"Be Vietnam Pro", Arial, sans-serif' },
  { name: 'Lexend', stack: 'Lexend, Arial, sans-serif' },
  { name: 'Oswald', stack: 'Oswald, Impact, sans-serif' },
  { name: 'Anton', stack: 'Anton, Impact, sans-serif' },
  { name: 'Lora', stack: 'Lora, Georgia, serif' },
  { name: 'Merriweather', stack: 'Merriweather, Georgia, serif' },
  { name: 'Noto Serif', stack: '"Noto Serif", Georgia, serif' },
  { name: 'Playfair Display', stack: '"Playfair Display", "Times New Roman", serif' },
  { name: 'Dancing Script', stack: '"Dancing Script", cursive' },
  { name: 'Pacifico', stack: 'Pacifico, cursive' },
  { name: 'Lobster', stack: 'Lobster, cursive' },
  { name: 'Patrick Hand', stack: '"Patrick Hand", "Comic Sans MS", cursive' },
];

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 48, 60, 72];
export const MIN_SIZE = 8;
export const MAX_SIZE = 96;

export const COLOR_PALETTE = [
  '#000000', '#434343', '#666666', '#999999', '#cccccc', '#ffffff',
  '#e11d48', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#92400e',
  '#7f1d1d', '#9a3412', '#854d0e', '#166534', '#115e59', '#155e75',
  '#1e3a8a', '#3730a3', '#5b21b6', '#86198f', '#9d174d', '#78350f',
];

const FONT_BY_NAME = new Map(FONTS.map((f) => [f.name.toLowerCase(), f]));

export function findFont(raw: string | null | undefined): FontOption | null {
  if (!raw) return null;
  const first = raw.split(',')[0].trim().replace(/^["']|["']$/g, '').toLowerCase();
  return FONT_BY_NAME.get(first) ?? null;
}

export function rgbToHex(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  if (/^#[0-9a-f]{3}$/.test(v)) return '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
  const m = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!m) return null;
  return (
    '#' +
    [m[1], m[2], m[3]]
      .map((n) => Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function parsePx(value: string | null | undefined): number | null {
  if (!value) return null;
  const m = value.trim().match(/^(\d+(?:\.\d+)?)px$/);
  if (!m) return null;
  const n = Math.round(Number(m[1]));
  return n >= MIN_SIZE && n <= MAX_SIZE ? n : null;
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

type Fmt = { bold: boolean; italic: boolean; underline: boolean; font: FontOption | null; size: number | null; color: string | null };

/** Đọc định dạng của một phần tử (thẻ hoặc style trực tiếp). Chỉ nhận giá trị nằm trong danh sách cho phép. */
function readFormat(el: HTMLElement): Fmt {
  const tag = el.tagName;
  const st = el.style;
  const weight = st.fontWeight;
  const deco = `${st.textDecorationLine} ${st.textDecoration}`;
  const fmt: Fmt = {
    bold: tag === 'B' || tag === 'STRONG' || weight === 'bold' || (/^\d+$/.test(weight) && Number(weight) >= 600),
    italic: tag === 'I' || tag === 'EM' || st.fontStyle === 'italic',
    underline: tag === 'U' || deco.includes('underline'),
    font: findFont(st.fontFamily),
    size: parsePx(st.fontSize),
    color: rgbToHex(st.color),
  };
  if (tag === 'FONT') {
    fmt.font = fmt.font ?? findFont(el.getAttribute('face'));
    fmt.color = fmt.color ?? rgbToHex(el.getAttribute('color'));
  }
  return fmt;
}

function wrapSerialized(inner: string, f: Fmt): string {
  if (!inner) return '';
  let out = inner;
  const css: string[] = [];
  if (f.font) css.push(`font-family:${f.font.name}`);
  if (f.size) css.push(`font-size:${f.size}px`);
  if (f.color) css.push(`color:${f.color}`);
  if (css.length) out = `<span style="${css.join(';')}">${out}</span>`;
  if (f.underline) out = `<u>${out}</u>`;
  if (f.italic) out = `<i>${out}</i>`;
  if (f.bold) out = `<b>${out}</b>`;
  return out;
}

function serializeInline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeHtml((node.nodeValue ?? '').replace(/\u00a0/g, ' ').replace(/[\r\n]+/g, ' '));
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const el = node as HTMLElement;
  if (el.tagName === 'BR') return '';
  let inner = '';
  el.childNodes.forEach((c) => {
    inner += serializeInline(c);
  });
  return wrapSerialized(inner, readFormat(el));
}

const BLOCK_TAGS = new Set(['DIV', 'P', 'LI', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE']);

export type Align = 'left' | 'center' | 'right' | 'justify';

function readAlign(el: HTMLElement): Align | null {
  const a = (el.style.textAlign || el.getAttribute('align') || '').toLowerCase();
  if (a === 'center' || a === 'right' || a === 'justify') return a;
  if (a === 'left' || a === 'start') return 'left';
  return null;
}

/** Căn lề được lưu bằng cách bọc cả dòng: <div style="text-align:center">...</div> (căn trái = không bọc). */
export function wrapAlign(inner: string, align: Align): string {
  return inner && align !== 'left' ? `<div style="text-align:${align}">${inner}</div>` : inner;
}

const ALIGN_LINE = /^<div style="text-align:(center|right|justify)">([\s\S]*)<\/div>$/;

/** Tách căn lề ra khỏi một dòng đã lưu. */
export function splitAlign(line: string): { align: Align; html: string } {
  const m = line.trim().match(ALIGN_LINE);
  return m ? { align: m[1] as Align, html: m[2] } : { align: 'left', html: line };
}

/** DOM của ô soạn thảo -> các dòng HTML sạch (mỗi đoạn văn một dòng, kèm căn lề) nối bằng \n. */
export function nodeToLines(root: Node): string {
  const lines: string[] = [];
  let cur = '';
  const push = (html: string, a: Align) => lines.push(wrapAlign(html, a));
  const rootAlign: Align =
    root.nodeType === Node.ELEMENT_NODE ? readAlign(root as HTMLElement) ?? 'left' : 'left';

  const walk = (parent: Node, inherited: Align) => {
    parent.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        if (BLOCK_TAGS.has(el.tagName)) {
          if (cur) {
            push(cur, inherited);
            cur = '';
          }
          const a = readAlign(el) ?? inherited;
          // khối con chứa khối khác -> đi sâu hơn; ngược lại là một dòng
          if (Array.from(el.children).some((c) => BLOCK_TAGS.has(c.tagName))) {
            walk(el, a);
            if (cur) {
              push(cur, a);
              cur = '';
            }
          } else {
            push(serializeInline(el), a);
          }
          return;
        }
        if (el.tagName === 'BR') {
          push(cur, inherited);
          cur = '';
          return;
        }
      }
      cur += serializeInline(child);
    });
  };
  walk(root, rootAlign);
  if (cur) push(cur, rootAlign);
  // BR cuối cùng chỉ là ký hiệu giữ chỗ của trình duyệt
  while (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines.join('\n');
}

/** Chuỗi lưu trữ (có thể là bài cũ chữ thường) -> HTML an toàn để nạp vào ô soạn thảo. */
export function linesToEditorHtml(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const { align, html } = splitAlign(line);
      const style = align === 'left' ? '' : ` style="text-align:${align}"`;
      return `<div${style}>${html === '' ? '<br>' : sanitizeLine(html)}</div>`;
    })
    .join('');
}

/** Làm sạch HTML của một dòng: chỉ giữ b/i/u/span và các style trong danh sách cho phép. */
export function sanitizeLine(html: string): string {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  let out = '';
  doc.body.childNodes.forEach((c) => {
    out += serializeInline(c);
  });
  return out;
}

/** Dòng đã định dạng -> chữ thuần (dùng cho đoạn trích và tìm kiếm). */
export function lineToText(html: string): string {
  if (!html.includes('<') && !html.includes('&')) return html;
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  return doc.body.textContent ?? '';
}