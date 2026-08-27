import React, { useRef, useState } from 'react';
import { Camera, Loader2, X, Plus } from 'lucide-react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { compressImage } from '../../utils/image';

export function MultiPhotoPicker({ photos, onChange }) {
  const inputRef = useRef();
  const [busy, setBusy] = useState(false);
  const list = photos || [];

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const compressed = await Promise.all(Array.from(files).map(f => compressImage(f)));
      onChange([...list, ...compressed]);
    } finally {
      setBusy(false);
    }
  };

  const removeAt = (idx) => {
    onChange(list.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steel, marginBottom: 6, fontWeight: 600 }}>
        Photos / receipts {list.length > 0 && `(${list.length})`}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {list.map((photo, idx) => (
          <div key={idx} style={{ position: 'relative', width: 76, height: 76, borderRadius: 10, overflow: 'hidden' }}>
            <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => removeAt(idx)} style={{
              position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 6,
              background: 'rgba(10,11,13,0.75)', border: 'none', color: COLORS.paper, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}><X size={11} /></button>
          </div>
        ))}
        <button onClick={() => inputRef.current.click()} disabled={busy} style={{
          width: 76, height: 76, borderRadius: 10, border: `1px dashed ${COLORS.line}`, background: COLORS.bg,
          color: COLORS.steel, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 4, cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 10
        }}>
          {busy ? <Loader2 size={16} className="csl-spin" /> : (list.length > 0 ? <Plus size={16} /> : <Camera size={16} />)}
          {busy ? 'Processing…' : 'Add'}
        </button>
      </div>
    </div>
  );
}
