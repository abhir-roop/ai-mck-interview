import React from "react";
import { Keyboard, Send } from "lucide-react";

interface KeyboardInputProps {
  value: string;
  onChange: (val: string) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  disabled?: boolean;
  onSubmit?: () => void;
}

export const KeyboardInput: React.FC<KeyboardInputProps> = ({ value, onChange, textareaRef, disabled, onSubmit }) => {
  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-40 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type your answer here..."
        disabled={disabled}
      />
      <button
        type="button"
        className="absolute top-2 right-12 p-2 bg-gray-100 rounded hover:bg-gray-200"
        tabIndex={-1}
        aria-label="Focus keyboard"
        onClick={() => textareaRef?.current?.focus()}
      >
        <Keyboard className="w-5 h-5 text-gray-600" />
      </button>
      <button
        type="button"
        className="absolute top-2 right-2 p-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
        disabled={disabled || value.length < 30}
        onClick={onSubmit}
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};
