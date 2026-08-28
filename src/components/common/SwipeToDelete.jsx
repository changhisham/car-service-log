import React, { useRef, useState } from 'react';
import { COLORS } from '../../styles/theme';

const REVEAL_WIDTH = 76;

// Swiping left reveals a delete button underneath the row; it doesn't
// delete on release by itself. The revealed button calls the same
// onDelete callback the row's own trash icon uses, so both paths go
// through the same confirm-before-delete flow — nothing skips the
// confirmation dialog.
export function SwipeToDelete({ onDelete, children }) {
  const [dragX, setDragX] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const startX = useRef(null);
  const dragging = useRef(false);

  const handleStart = (clientX) => {
    startX.current = clientX;
    dragging.current = true;
  };
  const handleMove = (clientX) => {
    if (!dragging.current || startX.current === null) return;
    const delta = clientX - startX.current;
    const base = revealed ? -REVEAL_WIDTH : 0;
    const next = Math.max(-REVEAL_WIDTH, Math.min(0, base + delta));
    setDragX(next);
  };
  const handleEnd = () => {
    dragging.current = false;
    startX.current = null;
    if (dragX < -REVEAL_WIDTH / 2) { setDragX(-REVEAL_WIDTH); setRevealed(true); }
    else { setDragX(0); setRevealed(false); }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 14 }}>
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: REVEAL_WIDTH }}>
        <button
          onClick={() => { onDelete(); setDragX(0); setRevealed(false); }}
          aria-label="Delete"
          style={{
            width: '100%', height: '100%', border: 'none', background: COLORS.rust, color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 700
          }}
        >
          Delete
        </button>
      </div>
      <div
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging.current ? 'none' : 'transform 0.2s ease',
          touchAction: 'pan-y',
          background: COLORS.bg,
        }}
      >
        {children}
      </div>
    </div>
  );
}
