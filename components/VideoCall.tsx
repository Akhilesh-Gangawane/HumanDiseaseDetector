'use client';

import { useEffect } from 'react';
import { openGoogleMeet } from '@/lib/videosdk';

interface VideoCallProps {
  onLeave: () => void;
}

// Immediately redirects to Google Meet and calls onLeave to reset parent state
export default function VideoCall({ onLeave }: VideoCallProps) {
  useEffect(() => {
    openGoogleMeet();
    onLeave();
  }, [onLeave]);

  return null;
}
