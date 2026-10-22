import { createElement, type ReactNode } from 'react';
import { findFont, parsePx, rgbToHex } from '@/lib/richText';

/** Hiển thị một dòng chữ đã định dạng thành các phần tử React (không dùng innerHTML). */
function renderNode(node: Node, key: string): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.nodeValue;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const el = node as HTMLElement;
  const kids = Array.from(el.childNodes).map((c, i) => renderNode(c, `${key}.${i}`));
  const tag = el.tagName;

  if (tag === 'B' || tag === 'STRONG') return createElement('strong', { key }, kids);
  if (tag === 'I' || tag === 'EM') return createElement('em', { key }, kids);
  if (tag === 'U') return createElement('u', { key }, kids);
  if (tag === 'SPAN') {
    const style: Record<string, string> = {};
    const font = findFont(el.style.fontFamily);
    const size = parsePx(el.style.fontSize);
    const color = rgbToHex(el.style.color);
    if (font) style.fontFamily = font.stack;
    if (size) style.fontSize = `${size}px`;
    if (color) style.color = color;
    return createElement('span', { key, style }, kids);
  }
  return kids; // thẻ lạ: bỏ thẻ, giữ chữ
}

export default function RichLine({ html }: { html: string }) {
  if (!html.includes('<') && !html.includes('&')) return <>{html}</>;
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  return <>{Array.from(doc.body.childNodes).map((c, i) => renderNode(c, String(i)))}</>;
}