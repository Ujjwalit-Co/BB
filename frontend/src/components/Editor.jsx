import React, { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';

export default function Editor({ code, onChange, language = 'javascript', readOnly = false }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

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
        language === 'html' ? html() : language === 'css' ? css() : javascript({ jsx: true }),
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

  return <div className={`h-full w-full overflow-hidden transition-colors ${isDark ? 'bg-[#0d0d0d]' : 'bg-[#f3f3f1]'}`} ref={editorRef} />;
}

