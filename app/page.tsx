// app/page.tsx
"use client";

import React, { useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';


interface Idea {
  id: string;
  content: string;
  createdAt: Date;
}

const ItemType = {
  IDEA: 'idea',
};

const FlameIcon: React.FC<{ isHovering: boolean; isDropping: boolean }> = ({ isHovering, isDropping }) => (
  <div className="relative w-24 h-24 mx-auto">
    <svg
      viewBox="0 0 100 100"
      className={`
        w-full 
        h-full 
        transform-gpu
        ${isDropping ? 'scale-150 animate-flame-intense' : isHovering ? 'scale-125 animate-flame-hover' : 'animate-flame-idle'}
      `}
    >
      {/* Base Flame */}
      <path
        className={`
          ${isDropping ? 'fill-red-600' : isHovering ? 'fill-red-500' : 'fill-red-400'}
          animate-flicker
        `}
        d="M50 10 C50 10 20 40 20 65 C20 90 40 95 50 95 C60 95 80 90 80 65 C80 40 50 10 50 10Z"
      >
        <animate
          attributeName="d"
          values="
            M50 10 C50 10 20 40 20 65 C20 90 40 95 50 95 C60 95 80 90 80 65 C80 40 50 10 50 10Z;
            M50 15 C50 15 25 45 25 65 C25 90 45 90 50 90 C55 90 75 90 75 65 C75 45 50 15 50 15Z;
            M50 10 C50 10 20 40 20 65 C20 90 40 95 50 95 C60 95 80 90 80 65 C80 40 50 10 50 10Z
          "
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
      {/* Inner Flame */}
      <path
        className={`
          ${isDropping ? 'fill-yellow-300' : isHovering ? 'fill-orange-500' : 'fill-orange-200'}
          animate-flicker-delay
        `}
        d="M50 25 C50 25 30 50 30 70 C30 85 45 90 50 90 C55 90 70 85 70 70 C70 50 50 25 50 25Z"
      >
        <animate
          attributeName="d"
          values="
            M50 25 C50 25 30 50 30 70 C30 85 45 90 50 90 C55 90 70 85 70 70 C70 50 50 25 50 25Z;
            M50 30 C50 30 35 55 35 70 C35 85 47 85 50 85 C53 85 65 85 65 70 C65 55 50 30 50 35Z;
            M50 25 C50 25 30 50 30 70 C30 85 45 90 50 90 C55 90 70 85 70 70 C70 50 50 25 50 25Z
          "
          dur="1.0s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  </div>
);

// Draggable Component
const IdeaCard: React.FC<{ idea: Idea, onRemove: (id: string) => void }> = ({ idea, onRemove }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.IDEA,
    item: { id: idea.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const elementRef = useRef<HTMLDivElement>(null);

  drag(elementRef);  // Attach drag to the ref

  return (
    <div
      ref={elementRef}  // Assign the ref here
      className={`bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-4 mb-4 
      hover:shadow-lg transition-all duration-200 border border-gray-100 
      hover:bg-white/90 touch-manipulation ${isDragging ? 'opacity-50' : ''}`}
    >
      <p className="text-gray-800">{idea.content}</p>
      <p className="text-sm text-gray-500 mt-2">{format(idea.createdAt, "MMM d, yyyy HH:mm")}</p>
    </div>
  );
};

// Droppable Fire Pit Component
const FirePit: React.FC<{ onDrop: (id: string) => void }> = ({ onDrop }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemType.IDEA,
    drop: (item: { id: string }) => onDrop(item.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const dropRef = useRef<HTMLDivElement>(null);

  // Attach the drop ref
  drop(dropRef);

  const isActive = isOver && canDrop;

  return (
    <div
      ref={dropRef}  // Assign the ref here
      className={`h-[25vh] p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center
      transition-all duration-300 backdrop-blur-sm 
      ${isActive ? 'border-red-600 bg-red-100/80' : 'border-red-300 bg-white/40'}`}
    >
      <FlameIcon isHovering={isActive} isDropping={false} />
      <p className="text-gray-600 mt-4 transition-opacity duration-300">
        Drop pages here to burn them forever
      </p>
    </div>
  );
};

// Main BurnBookApp Component
const BurnBookApp: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [sealedIdeas, setSealedIdeas] = useState<Idea[]>([]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSeal = () => {
    const newIdea: Idea = {
      id: Date.now().toString(),
      content,
      createdAt: new Date(),
    };
    setSealedIdeas((prevIdeas) => [newIdea, ...prevIdeas]);
    setContent('');
    toast.info("Your idea has been sealed!");
  };

  const handleDrop = (id: string) => {
    setSealedIdeas((prev) => prev.filter((idea) => idea.id !== id));
    toast.error("🔥 Page burned forever!", {
      style: { background: '#ffeded' },
    });
  };

  return (
    <DndProvider backend={typeof window !== 'undefined' && window.innerWidth > 1024 ? HTML5Backend : TouchBackend}>
      <div className="container mx-auto py-8 px-4 flex flex-col items-center min-h-screen relative">
        <div className="w-full max-w-md mb-8">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-100 p-6 rounded-xl shadow-lg">
            <div className="w-full mx-auto">
              <textarea
                className="w-full p-3 mb-4 border border-gray-200 rounded-lg resize-none min-h-[8rem] max-h-[8rem] 
                text-base leading-relaxed overflow-y-auto focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                transition-all duration-200"
                value={content}
                onChange={handleContentChange}
                placeholder="Write your idea here..."
                maxLength={255}
              />
            </div>
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
              onClick={handleSeal}
              disabled={content.length === 0}
            >
              Tear out this Page
            </button>
          </div>
        </div>

        <div className="w-full flex flex-col items-center space-y-6">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Torn out Pages</h2>
            <div className="max-h-[40vh] overflow-y-auto mb-4 pr-2">
              {sealedIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} onRemove={handleDrop} />
              ))}
            </div>
          </div>

          <FirePit onDrop={handleDrop} />
        </div>

        <ToastContainer
          position="bottom-center"
          theme="light"
          toastStyle={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            borderRadius: '0.75rem',
          }}
        />
      </div>
    </DndProvider>
  );
};

export default BurnBookApp;