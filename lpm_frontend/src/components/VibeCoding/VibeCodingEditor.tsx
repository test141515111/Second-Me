'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface VibeCodingEditorProps {
  initialCode?: string;
  language?: string;
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
  theme?: 'light' | 'dark' | 'system';
  height?: string;
  width?: string;
}

const VibeCodingEditor: React.FC<VibeCodingEditorProps> = ({
  initialCode = '',
  language = 'javascript',
  onCodeChange,
  readOnly = false,
  theme: propTheme,
  height = '400px',
  width = '100%'
}) => {
  const [code, setCode] = useState(initialCode);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme: systemTheme } = useTheme();

  // Determine the effective theme
  const effectiveTheme = propTheme || systemTheme || 'light';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dynamically import Monaco Editor
      import('monaco-editor').then(monaco => {
        monacoRef.current = monaco;
        setEditorLoaded(true);
      });
    }
  }, []);

  useEffect(() => {
    if (editorLoaded && containerRef.current && !editorRef.current) {
      // Initialize Monaco Editor
      editorRef.current = monacoRef.current.editor.create(containerRef.current, {
        value: code,
        language,
        theme: effectiveTheme === 'dark' ? 'vs-dark' : 'vs',
        automaticLayout: true,
        minimap: {
          enabled: true
        },
        scrollBeyondLastLine: false,
        readOnly,
        fontSize: 14,
        lineNumbers: 'on',
        wordWrap: 'on',
        renderLineHighlight: 'all',
        scrollbar: {
          useShadows: false,
          verticalHasArrows: true,
          horizontalHasArrows: true,
          vertical: 'visible',
          horizontal: 'visible',
          verticalScrollbarSize: 12,
          horizontalScrollbarSize: 12
        }
      });

      // Add event listener for code changes
      editorRef.current.onDidChangeModelContent(() => {
        const newCode = editorRef.current.getValue();
        setCode(newCode);
        if (onCodeChange) {
          onCodeChange(newCode);
        }
      });
    }

    return () => {
      // Cleanup
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, [editorLoaded, language, readOnly, code, onCodeChange, effectiveTheme]);

  // Update editor theme when theme changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      monacoRef.current.editor.setTheme(effectiveTheme === 'dark' ? 'vs-dark' : 'vs');
    }
  }, [effectiveTheme]);

  // Update editor content when initialCode changes
  useEffect(() => {
    if (editorRef.current && initialCode !== code) {
      editorRef.current.setValue(initialCode);
    }
  }, [initialCode]);

  return (
    <div 
      className="vibe-coding-editor border border-gray-300 rounded-md overflow-hidden"
      style={{ height, width }}
    >
      {!editorLoaded && (
        <div className="flex items-center justify-center h-full w-full bg-gray-100 dark:bg-gray-800">
          <span className="text-gray-500 dark:text-gray-400">Loading editor...</span>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="h-full w-full"
        style={{ display: editorLoaded ? 'block' : 'none' }}
      />
    </div>
  );
};

export default VibeCodingEditor;
