// app/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import { isMobile } from 'react-device-detect';


interface Idea {
  id: string;
  content: string;
  createdAt: Date;
}

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

const BurnBookApp: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [isSealed, setIsSealed] = useState<boolean>(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [sealedIdeas, setSealedIdeas] = useState<Idea[]>([]);
  const [draggedIdea, setDraggedIdea] = useState<Idea | null>(null);
  const [isHoveringBurn, setIsHoveringBurn] = useState<boolean>(false);
  const [isDropping, setIsDropping] = useState(false);
  // New state for touch functionality
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [currentTouchedIdea, setCurrentTouchedIdea] = useState<Idea | null>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isSealed) {
      setContent(e.target.value);
      if (timer === null) {
        setTimer(TIMER_DURATION);
      }
    }
  };

  // Add this new component for mobile touch handling
  const TouchHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
      const preventDefault = (e: TouchEvent) => {
        e.preventDefault();
      };

      document.addEventListener('touchmove', preventDefault, { passive: false });
      return () => {
        document.removeEventListener('touchmove', preventDefault);
      };
    }, []);

    return <>{children}</>;
  };

  const handleSeal = useCallback(() => {
    setIsSealed(true);
    setTimer(null);
    toast.info("Your idea has been sealed!");
    const newIdea: Idea = {
      id: Date.now().toString(),
      content,
      createdAt: new Date(),
    };
    setSealedIdeas((prevIdeas) => [newIdea, ...prevIdeas]);
    setContent('');
    setIsSealed(false);
  }, [content]);

  // Existing drag handlers
  const handleDragStart = (idea: Idea) => {
    setDraggedIdea(idea);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHoveringBurn(true);
  };

  const handleDragLeave = () => {
    setIsHoveringBurn(false);
  };

  // New touch handlers
  const handleTouchStart = (e: React.TouchEvent, idea: Idea) => {
    setTouchStartY(e.touches[0].clientY);
    setCurrentTouchedIdea(idea);
  };

  // Modify your handleTouchMove function:
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY && currentTouchedIdea) {
      const touchY = e.touches[0].clientY;
      const deltaY = touchY - touchStartY;
      const burnZone = document.getElementById('burn-zone');

      if (burnZone) {
        const burnZoneRect = burnZone.getBoundingClientRect();
        if (touchY > burnZoneRect.top) {
          setIsHoveringBurn(true);
        } else {
          setIsHoveringBurn(false);
        }
      }
    }
  };

  // Modify your handleTouchEnd function:
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY && currentTouchedIdea) {
      const touchY = e.changedTouches[0].clientY;
      const burnZone = document.getElementById('burn-zone');

      if (burnZone) {
        const burnZoneRect = burnZone.getBoundingClientRect();
        if (touchY > burnZoneRect.top) {
          setIsDropping(true);
          setTimeout(() => {
            setIsDropping(false);
            setSealedIdeas((prev) =>
              prev.filter((idea) => idea.id !== currentTouchedIdea.id)
            );
            toast.error("🔥 Page burned forever!", {
              style: { background: '#ffeded' }
            });
          }, 1500);
        }
      }
    }

    setTouchStartY(null);
    setCurrentTouchedIdea(null);
    setIsHoveringBurn(false);
  };

  const handleDrop = () => {
    if (!draggedIdea) return;

    setIsDropping(true);
    setTimeout(() => {
      setIsDropping(false);
      setSealedIdeas((prev) => prev.filter((idea) => idea.id !== draggedIdea.id));
      toast.error("🔥 Page burned forever!", {
        style: { background: '#ffeded' }
      });
    }, 1500);

    setDraggedIdea(null);
    setIsHoveringBurn(false);
  };

  // Updated IdeaCard component with touch handlers
  const IdeaCard: React.FC<{ idea: Idea }> = ({ idea }) => {
    const [isDragging, setIsDragging] = useState(false);

    return (
      <div
        draggable={!isMobile}
        onDragStart={() => {
          setIsDragging(true);
          handleDragStart(idea);
        }}
        onDragEnd={() => setIsDragging(false)}
        onTouchStart={(e) => handleTouchStart(e, idea)}
        onTouchMove={(e) => {
          e.stopPropagation();
          handleTouchMove(e);
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          handleTouchEnd(e);
        }}
        className={`
          bg-white/80 
          backdrop-blur-sm 
          shadow-md 
          rounded-xl 
          p-4 
          mb-4 
          ${!isMobile ? 'cursor-move' : ''}
          hover:shadow-lg 
          transition-all 
          duration-200 
          border 
          border-gray-100
          hover:bg-white/90
          touch-manipulation
          ${isDragging ? 'opacity-50' : ''}
          ${currentTouchedIdea?.id === idea.id ? 'scale-105' : ''}
          active:scale-95
        `}
      >
        <p className="text-gray-800">{idea.content}</p>
        <p className="text-sm text-gray-500 mt-2">
          {format(idea.createdAt, "MMM d, yyyy HH:mm")}
        </p>
      </div>
    );
  };

  // Mobile helper component
  const MobileHelper: React.FC = () => (
    <div className="text-center text-sm text-gray-500 mt-2 md:hidden">
      Drag pages downward to burn them
    </div>
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => (prevTimer !== null ? prevTimer - 1 : null));
      }, 1000);
    } else if (timer === 0) {
      handleSeal();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, handleSeal]);

  return (
    <TouchHandler>
      <div className="container mx-auto py-8 px-4 flex flex-col items-center min-h-screen relative">
      

      <div className="w-full max-w-md mb-8">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 p-6 rounded-xl shadow-lg">
          {timer !== null && (
            <div className="mb-4 text-center text-gray-600">
              Time remaining: {timer} seconds
            </div>
          )}
          <div className="w-full mx-auto">
            <textarea
              className="w-full p-3 mb-4 border border-gray-200 rounded-lg resize-none
              min-h-[8rem] max-h-[8rem]
              text-base leading-relaxed
              overflow-y-auto
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200"
              value={content}
              onChange={handleContentChange}
              readOnly={isSealed}
              placeholder="Write your idea here..."
              maxLength={255}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#CBD5E0 #EDF2F7'
              }}
            />
          </div>
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg
            font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSeal}
            disabled={isSealed || content.length === 0}
          >
            Tear out this Page
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col items-center space-y-6">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Torn out Pages</h2>
          <div className="max-h-[40vh] overflow-y-auto mb-4 pr-2 pb-32">
            {sealedIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </div>

        <div
          id="burn-zone"
          className={`
            w-full max-w-md
            ${isMobile ? 'fixed bottom-0 left-0 right-0 z-50' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={`
            h-[25vh] 
            p-6
            border-2 
            border-dashed 
            rounded-xl
            flex 
            flex-col
            items-center 
            justify-center
            transition-all
            duration-300
            backdrop-blur-sm
            ${isDropping
              ? 'border-red-600 bg-red-100/80'
              : isHoveringBurn
                ? 'border-red-500 bg-red-50/80'
                : 'border-red-300 bg-white/40'
            }
            ${isMobile ? 'rounded-b-none' : ''}
          `}>
            <FlameIcon isHovering={isHoveringBurn} isDropping={isDropping} />
            <p className={`
              text-gray-600
              mt-4 
              transition-opacity 
              duration-300
              ${isDropping ? 'opacity-0' : 'opacity-100'}
            `}>
              {isMobile ? 'Drag pages here to burn them' : 'Drop pages here to burn them forever'}
            </p>
          </div>
          <MobileHelper />
        </div>
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
    </TouchHandler>
  );
}; // Close the BurnBookApp component

const TIMER_DURATION = 30; // 30 seconds

export default BurnBookApp;