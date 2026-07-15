"use client";

import React, { Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';
import Skeleton from './Skeleton';

export default function SuspenseBoundary({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={fallback ?? <div className="space-y-2"><Skeleton className="h-6 w-1/2" /><Skeleton /><Skeleton className="w-3/4" /></div>}>
      <Suspense fallback={fallback ?? <div className="space-y-2"><Skeleton className="h-6 w-1/2" /><Skeleton /><Skeleton className="w-3/4" /></div>}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
