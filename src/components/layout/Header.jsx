import React from 'react';
import { CheckCircle2, Loader2, LogOut, Bell, UserCircle2 } from 'lucide-react';
import { COLORS, FONT_BODY, FONT_MONO } from '../../styles/theme';
import { signOutUser } from '../../auth';

export function Header({ active, saveState, userEmail }) {
  const sync = saveState === 'saving' ? 'SYNCING' : saveState === 'error' ? 'SYNC FAILED' : saveState === 'saved' ? 'SYNCED' : 'READY';
  return <header className="csl-header">
    <div className="csl-header-mobile-brand"><span>GARAGE</span> <b>LOG</b></div>
    <div className="csl-header-context"><span>GARAGE /</span><strong>{active ? active.plate : 'NO VEHICLE'}</strong></div>
    <div className="csl-header-right">
      <div className={`csl-sync ${saveState==='error'?'bad':''}`}>{sync}{saveState==='saving'&&<Loader2 size={12} className="csl-spin"/>}{saveState==='saved'&&<CheckCircle2 size={12} color={COLORS.green}/>}</div>
      <button className="csl-header-icon" aria-label="Notifications"><Bell size={18}/><i/></button>
      <button className="csl-user-chip" onClick={() => signOutUser()} title={userEmail ? `Sign out (${userEmail})` : 'Sign out'}><UserCircle2 size={20}/><span>Sign out</span><LogOut size={13}/></button>
    </div>
  </header>;
}
