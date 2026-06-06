// The backend serializes Java LocalDateTime values with no timezone marker
// (e.g. "2026-06-06T14:30:00"). JavaScript's Date parses a zone-less date-time
// string as LOCAL time, but those values are actually UTC — so they end up
// shifted by the viewer's timezone offset. Appending 'Z' forces UTC parsing.
//
// Use this for every backend timestamp the user sees (notifications, chat, etc.).
export function parseBackendDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  let s = String(value).trim();

  // Normalize a space-separated date-time ("2026-06-06 14:30:00") to ISO.
  if (s.includes(' ') && !s.includes('T')) {
    s = s.replace(' ', 'T');
  }

  // Already carries a timezone (trailing Z or ±hh:mm)? Leave it alone.
  const hasZone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(s);

  // Only append 'Z' to date-time strings; date-only ("2026-06-06") is already
  // treated as UTC by Date and "2026-06-06Z" would be invalid.
  if (!hasZone && s.includes('T')) {
    s += 'Z';
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
