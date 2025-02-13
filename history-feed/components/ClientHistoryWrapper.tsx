'use client';

import dynamic from 'next/dynamic';
import Loading from '@/app/loading';

const HistoryFeed = dynamic(() => import('./HistoryFeed'), {
  ssr: false,
  loading: () => <Loading />
});

export default function ClientHistoryWrapper() {
  return <HistoryFeed />;
} 