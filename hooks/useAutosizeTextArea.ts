import { useEffect } from 'react';

export function useAutosizeTextArea(
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>,
  value: string
) {
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      // Reset height to auto to get the correct scrollHeight
      textArea.style.height = 'auto';
      // Set height to scrollHeight to fit content
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  }, [value, textAreaRef]);
}
