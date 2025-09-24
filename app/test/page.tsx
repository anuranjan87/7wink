"use client";
import { useState, useRef } from "react";
import { X, Minus, Square } from "lucide-react";

export default function WindowModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Position state
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const dragRef = useRef<HTMLDivElement | null>(null);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return; // disable drag if maximized
    const modal = dragRef.current;
    if (!modal) return;
    offset.current = {
      x: e.clientX - modal.getBoundingClientRect().left,
      y: e.clientY - modal.getBoundingClientRect().top,
    };

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex">
      <div
  ref={dragRef}
  className={`
    absolute bg-white shadow-xl border rounded-md
    ${isMaximized ? "w-[90%] h-[90%] left-[5%] top-[5%] transition-all duration-200" 
                  : "w-[500px] h-[300px]"}
    ${isMinimized ? "h-[40px]" : ""}
  `}
  style={!isMaximized ? { left: position.x, top: position.y } : {}}
>

        {/* Header */}
        <div
          className="flex justify-end items-center gap-2 bg-gray-100 px-2 py-1 border-b cursor-move"
          onMouseDown={handleMouseDown}
        >
          {/* Minimize */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-gray-200 p-1 rounded"
          >
            <Minus size={16} />
          </button>

          {/* Maximize / Restore */}
          <button
            onClick={() => {
              setIsMaximized(!isMaximized);
              setIsMinimized(false);
              if (!isMaximized) {
                setPosition({ x: 100, y: 100 }); // reset when restoring
              }
            }}
            className="hover:bg-gray-200 p-1 rounded"
          >
            <Square size={16} />
          </button>

          {/* Close */}
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-red-500 hover:text-white p-1 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-4 overflow-auto h-[calc(100%-40px)]">
            <h2 className="text-lg font-semibold">Draggable Window Modal</h2>
            <p className="mt-2 text-gray-700">
              👉 You can drag this modal by the header, just like a desktop app.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
