/**
 * Generates a unique Google Meet room code.
 * Format: xxx-xxxx-xxx (same pattern as real Meet codes)
 */
export function generateMeetCode(): string {
  const seg = (len: number) =>
    Array.from({ length: len }, () => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]).join('')
  return `${seg(3)}-${seg(4)}-${seg(3)}`
}

/**
 * Returns the full Google Meet URL for a given code.
 */
export function getMeetUrl(code: string): string {
  return `https://meet.google.com/${code}`
}

/**
 * Opens a specific Google Meet room in a new tab.
 * If no code is provided, opens a brand-new meeting (fallback only).
 */
export function openGoogleMeet(code?: string): void {
  const url = code ? getMeetUrl(code) : 'https://meet.google.com/new'
  window.open(url, '_blank', 'noopener,noreferrer')
}
