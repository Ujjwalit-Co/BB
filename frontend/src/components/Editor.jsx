import React, { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import { Sparkles } from 'lucide-react';
import useLabStore from '../store/useLabStore';

export default function Editor({ code, onChange, language = 'javascript', readOnly = false }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const { setAiInput, toggleRightSidebar, rightSidebarOpen } = useLabStore();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [selection, setSelection] = useState({ visible: false, x: 0, y: 0, text: '' });

  // Sync theme with document class
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;

    const themeBase = isDark ? vscodeDark : vscodeLight;
    const bgColor = isDark ? '#0d0d0d' : '#f3f3f1'; // Light grayish background
    const gutterColor = isDark ? '#0d0d0d' : '#ececeb';
    const textColor = isDark ? '#858585' : '#717171';
    const activeLine = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';

    const state = EditorState.create({
      doc: code,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion({
          activateOnTyping: true,
          override: [],
        }),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        language === 'python' ? python() : language === 'html' ? html() : language === 'css' ? css() : javascript({ jsx: true }),
        themeBase,
        EditorView.editable.of(!readOnly),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...completionKeymap,
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onChange) {
            onChange(update.state.doc.toString());
          }
          
          if (update.selectionSet) {
            const range = update.state.selection.main;
            if (range.empty) {
              setSelection(prev => ({ ...prev, visible: false }));
            } else {
              const text = update.state.doc.sliceString(range.from, range.to);
              const rect = update.view.coordsAtPos(range.to);
              if (rect) {
                setSelection({
                  visible: true,
                  x: rect.left,
                  y: rect.top - 35,
                  text
                });
              }
            }
          }
        }),
        EditorView.theme({
          '&': { height: '100%', fontSize: '13px', backgroundColor: bgColor },
          '.cm-gutters': { backgroundColor: gutterColor, color: textColor, border: 'none', minWidth: '40px' },
          '.cm-activeLineGutter': { backgroundColor: 'transparent', color: isDark ? '#858585' : '#454545' },
          '.cm-activeLine': { backgroundColor: activeLine },
          '.cm-content': { caretColor: '#3b82f6', padding: '10px 0', fontFamily: '"JetBrains Mono", monospace' },
          '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#3b82f6', borderLeftWidth: '2px' },
          '.cm-tooltip-autocomplete': {
            backgroundColor: isDark ? '#1e1e1e' : '#fff',
            border: `1px solid ${isDark ? '#333' : '#ddd'}`,
            borderRadius: '6px',
            boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
            fontFamily: '"JetBrains Mono", monospace',
          },
          '.cm-tooltip-autocomplete li[aria-selected]': {
            backgroundColor: '#6366f1',
          },
          // Scrollbar styling to match lab UI
          '.cm-scroller': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${isDark ? '#333' : '#e0e0e0'} transparent`,
            '&::-webkit-scrollbar': { width: '5px' },
            '&::-webkit-scrollbar-thumb': {
              background: isDark ? '#333' : '#e0e0e0',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
          },
        }),
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;
    return () => view.destroy();
  }, [readOnly, language, isDark]);

  useEffect(() => {
    if (viewRef.current && code !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: code },
      });
    }
  }, [code]);

  const handleSendToAi = (e) => {
    e.stopPropagation();
    setAiInput(`Explain this code:\n\n\`\`\`${language}\n${selection.text}\n\`\`\``);
    if (!rightSidebarOpen) toggleRightSidebar();
    setSelection(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className={`relative h-full w-full overflow-hidden transition-colors ${isDark ? 'bg-[#0d0d0d]' : 'bg-[#f3f3f1]'}`} ref={editorRef}>
      {selection.visible && (
        <button
          className="fixed z-50 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold shadow-xl shadow-indigo-600/30 animate-in fade-in zoom-in duration-200 hover:bg-indigo-500 hover:-translate-y-0.5 active:scale-95 transition-all"
          style={{ left: selection.x, top: selection.y }}
          onClick={handleSendToAi}
        >
          <Sparkles size={12} />
          <span>Ask AI</span>
        </button>
      )}
    </div>
  );
}
