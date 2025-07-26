'use client';

import React, { useEffect } from 'react';
import { SessionService } from './SessionService';

export const SessionServiceProvider: React.FC = () => {
  useEffect(() => {
    console.log('[SessionServiceProvider] Initializing session service');
    
    const sessionService = new SessionService();
    sessionService.initialize();
    
    return () => {
      sessionService.destroy();
    };
  }, []);

  return (
    <div id="session-service-active" style={{ display: 'none' }}>
      Session Service Active
    </div>
  );
}; 