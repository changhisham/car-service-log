import React from 'react';
import { COLORS } from '../../styles/theme';

function Block({ width, height, radius = 8, style }) {
  return <div className="csl-skeleton" style={{ width, height, borderRadius: radius, ...style }} />;
}

export function SkeletonLoader() {
  return (
    <div style={{ padding: '20px 18px' }} aria-busy="true" aria-label="Loading garage">
      <Block width={90} height={12} radius={4} style={{ marginBottom: 8 }} />
      <Block width={180} height={26} radius={6} style={{ marginBottom: 20 }} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Block width={100} height={34} radius={10} />
        <Block width={110} height={34} radius={10} />
      </div>
      <Block width="100%" height={220} radius={18} style={{ marginBottom: 16 }} />
      <Block width="100%" height={140} radius={18} style={{ marginBottom: 16 }} />
      <Block width="100%" height={90} radius={14} style={{ marginBottom: 10 }} />
      <Block width="100%" height={90} radius={14} />
    </div>
  );
}
