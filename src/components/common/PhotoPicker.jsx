import React, { useRef, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { compressImage } from '../../utils/image';

export function PhotoPicker({ photo, onPick, onClear }) {
  const inputRef = useRef();
  const [busy, setBusy] = useState(false);
  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await compressImage(file);
      onPick(dataUrl);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steel, marginBottom: 6, fontWeight: 600 }}>Photo / receipt</div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])} />
      {photo ? (
        <div style={{ position: 'relative', width: 120, height: 90, borderRadius: 10, overflow: 'hidden' }}>
          <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button onClick={onClear} style={{
            position: 'absolute', top: 5, right: 5, width: 24, height: 24, borderRadius: 7,
            background: 'rgba(10,11,13,0.75)', border: 'none', color: COLORS.paper, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}><X size={13} /></button>
        </div>
      ) : (
        <button onClick={() => inputRef.current.click()} disabled={busy} style={{
          width: 120, height: 90, borderRadius: 10, border: `1px dashed ${COLORS.line}`, background: COLORS.bg,
          color: COLORS.steel, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 6, cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 11
        }}>
          {busy ? <Loader2 size={18} className="csl-spin" /> : <Camera size={18} />}
          {busy ? 'Processing…' : 'Add photo'}
        </button>
      )}
    </div>
  );
}
