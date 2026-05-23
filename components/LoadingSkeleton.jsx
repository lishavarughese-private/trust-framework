// Shared loading skeleton — prevents UI flicker while API calls resolve
// AC: TASK-005 — loading skeleton shown while API call is in flight

export default function LoadingSkeleton({ rows = 6 }) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className="skeleton-wrapper"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-card" aria-hidden="true">
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--subtitle" />
          <div className="skeleton-line skeleton-line--badge" />
        </div>
      ))}
      <span className="sr-only">Loading, please wait...</span>

      <style jsx>{`
        .skeleton-wrapper {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem;
          padding: 1rem 0;
        }
        .skeleton-card {
          background: #f3f4f6;
          border-radius: 8px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .skeleton-line {
          background: #e5e7eb;
          border-radius: 4px;
        }
        .skeleton-line--title    { height: 1.25rem; width: 70%; }
        .skeleton-line--subtitle { height: 1rem;    width: 50%; }
        .skeleton-line--badge    { height: 1.5rem;  width: 30%; border-radius: 999px; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        .sr-only {
          position: absolute;
          width: 1px; height: 1px;
          padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0,0,0,0);
          border: 0;
        }
      `}</style>
    </div>
  );
}
