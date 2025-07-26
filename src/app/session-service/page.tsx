'use client';

import React from 'react';
import { SessionServiceProvider } from '@/lib/embed/services/SessionServiceProvider';

export default function SessionServicePage() {
  return (
    <div style={{ display: 'none' }}>
      <SessionServiceProvider />
    </div>
  );
} 