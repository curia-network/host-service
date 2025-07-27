'use client';

import React, { useEffect } from 'react';
import { SessionService } from './SessionService';

export const SessionServiceProvider: React.FC = () => {
  useEffect(() => {
    console.log('[SessionServiceProvider] Getting shared session service');
    
    // 🚀 FIX: Use singleton to prevent double initialization in React Strict Mode
    const sessionService = SessionService.getSharedInstance();
    sessionService.initialize();
    
    return () => {
      // 🚀 FIX: Reference counting cleanup
      SessionService.releaseSharedInstance();
    };
  }, []);

  return (
    <div id="session-service-active" style={{ display: 'none' }}>
      Session Service Active
    </div>
  );
}; 