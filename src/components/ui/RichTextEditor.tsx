import { useRef, useEffect, useState } from 'react';
import {
  Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon, Quote, Pilcrow, Undo2, Redo2, Code2,
} from 'lucide-react';

interface Props {
  value:    string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?:   number;
}

type Mode = 'rich' | 'html';

/**
 * Lightweight rich-text editor with a toolbar and an HTML toggle.
 * Built on contentEditable + document.execCommand — no external deps.
 */
export default function RichTextEditor({ value, onChange, placeholder, minHeight = 320 }: Props) {
  const [mode, setMode]       = useState<Mode>('rich');
  const [isEmpty, setIsEmpty] = useState(!value);
  const editorRef = useRef<HTMLDivElement>(null);

  // Keep the contentEditable in sync when value changes from the outside
  // (e.g. initial load from the API). We only overwrite when it differs
  // from the current DOM content to avoid caret jumps while typing.
  useEffect(() => {
    if (mode !== 'rich') return;
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
    setIsEmpty(!el.textContent?.trim());
  }, [value, mode]);

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    editorRef.current?.focus();
    handleInput();
  };

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    setIsEmpty(!el.textContent?.trim());
    onChange(el.innerHTML);
  };

  const handleHeading = (tag: 'h2' | 'h3' | 'p' | 'blockquote') => {
    exec('formatBlock', tag);
  };

  const handleLink = () => {
    const url = window.prompt('Enter URL (https://...)');
    if (!url) return;
    exec('createLink', url);
  };

  const handleImage = () => {
    const url = window.prompt('Enter image URL (https://...)');
    if (!url) return;
    exec('insertImage', url);
  };

  const btn = "flex h-8 min-w-8 items-center justify-center gap-1 rounded-lg px-2 text-[12px] font-semibold text-[#5f6368] hover:bg-white hover:text-[#202124] transition-colors";
  const sep = <div className="mx-1 h-5 w-px bg-[#e8eaed]" />;

  return (
    <div className="rounded-xl border border-[#e8eaed] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#e8eaed] bg-[#f8fafc] px-2 py-1.5">
        {mode === 'rich' ? (
          <>
            <button type="button" onClick={() => exec('bold')}      className={btn} title="Bold"><Bold size={14} /></button>
            <button type="button" onClick={() => exec('italic')}    className={btn} title="Italic"><Italic size={14} /></button>
            <button type="button" onClick={() => exec('underline')} className={btn} title="Underline"><Underline size={14} /></button>
            {sep}
            <button type="button" onClick={() => handleHeading('h2')} className={btn} title="Heading 2"><Heading2 size={14} /></button>
            <button type="button" onClick={() => handleHeading('h3')} className={btn} title="Heading 3"><Heading3 size={14} /></button>
            <button type="button" onClick={() => handleHeading('p')}  className={btn} title="Paragraph"><Pilcrow size={14} /></button>
            <button type="button" onClick={() => handleHeading('blockquote')} className={btn} title="Quote"><Quote size={14} /></button>
            {sep}
            <button type="button" onClick={() => exec('insertUnorderedList')} className={btn} title="Bulleted list"><List size={14} /></button>
            <button type="button" onClick={() => exec('insertOrderedList')}   className={btn} title="Numbered list"><ListOrdered size={14} /></button>
            {sep}
            <button type="button" onClick={handleLink}  className={btn} title="Insert link"><LinkIcon size={14} /></button>
            <button type="button" onClick={handleImage} className={btn} title="Insert image"><ImageIcon size={14} /></button>
            {sep}
            <button type="button" onClick={() => exec('undo')} className={btn} title="Undo"><Undo2 size={14} /></button>
            <button type="button" onClick={() => exec('redo')} className={btn} title="Redo"><Redo2 size={14} /></button>
          </>
        ) : (
          <span className="px-1 text-[11px] font-bold uppercase tracking-wide text-[#5f6368]">HTML source</span>
        )}

        <div className="ml-auto">
          <button type="button" onClick={() => setMode(m => m === 'rich' ? 'html' : 'rich')}
            className={`${btn} ${mode === 'html' ? 'bg-blue-50 text-blue-700' : ''}`}
            title={mode === 'html' ? 'Switch to rich editor' : 'Edit HTML source'}>
            <Code2 size={14} /> {mode === 'html' ? 'Visual' : 'HTML'}
          </button>
        </div>
      </div>

      {/* Body */}
      {mode === 'rich' ? (
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            suppressContentEditableWarning
            className="
              px-4 py-3 text-[14px] leading-relaxed text-[#202124] focus:outline-none
              [&_h2]:text-[20px] [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2
              [&_h3]:text-[16px] [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1.5
              [&_p]:mb-2
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-2
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-2
              [&_li]:mb-0.5
              [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#5f6368] [&_blockquote]:my-2
              [&_a]:text-blue-600 [&_a]:underline
              [&_img]:rounded-lg [&_img]:my-2 [&_img]:max-w-full
              [&_strong]:font-bold
            "
            style={{ minHeight }}
          />
          {isEmpty && placeholder && (
            <p className="pointer-events-none absolute left-4 top-3 text-[14px] text-[#c4c9d0]">
              {placeholder}
            </p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="<p>Write your HTML here...</p>"
          style={{ minHeight }}
          className="w-full resize-y bg-white px-4 py-3 font-mono text-[12px] text-[#202124] placeholder:text-[#c4c9d0] focus:outline-none"
        />
      )}
    </div>
  );
}
