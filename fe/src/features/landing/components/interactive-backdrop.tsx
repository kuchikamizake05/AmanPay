const tiles = [
  [2, 1, 4.2, 0, false],
  [5, 2, 5.1, 1.2, true],
  [8, 1, 3.8, 2.1, false],
  [12, 3, 6, 0.8, false],
  [3, 4, 4.5, 3, false],
  [7, 5, 5.4, 1.5, false],
  [10, 4, 3.9, 2.7, true],
  [14, 2, 4.8, 0.4, false],
  [1, 6, 5.7, 1.9, false],
  [6, 7, 4.1, 3.5, false],
  [11, 6, 5, 2.2, false],
  [15, 5, 4.6, 1.1, false],
] as const;

export function InteractiveBackdrop() {
  return (
    <div className="interactive-backdrop" aria-hidden="true">
      <div className="interactive-backdrop__glow" />
      <svg className="interactive-backdrop__grid" focusable="false">
        <defs>
          <pattern id="hero-ledger-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-ledger-grid)" />
        {tiles.map(([column, row, duration, delay, amber]) => (
          <rect
            className={amber ? "grid-tile grid-tile--amber" : "grid-tile"}
            height="47"
            key={`${column}-${row}`}
            style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
            width="47"
            x={column * 48 + 1}
            y={row * 48 + 1}
          />
        ))}
      </svg>
    </div>
  );
}
