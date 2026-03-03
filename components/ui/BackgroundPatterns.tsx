export const MedicalPattern = () => (
  <div className="absolute inset-0 opacity-5">
    <svg width="100%" height="100%">
      <defs>
        <pattern id="medical-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          {/* Heartbeat line */}
          <path d="M0,50 L20,50 L25,30 L30,70 L35,20 L40,50 L100,50" stroke="currentColor" strokeWidth="2" fill="none" />
          {/* Medical cross */}
          <rect x="70" y="15" width="3" height="15" fill="currentColor" />
          <rect x="63" y="22" width="17" height="3" fill="currentColor" />
          {/* DNA helix */}
          <ellipse cx="15" cy="80" rx="3" ry="8" fill="currentColor" />
          <ellipse cx="25" cy="80" rx="3" ry="8" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#medical-pattern)" />
    </svg>
  </div>
);

export const DNAPattern = () => (
  <div className="absolute inset-0 opacity-10">
    <svg width="100%" height="100%">
      <defs>
        <pattern id="dna-pattern" x="0" y="0" width="60" height="120" patternUnits="userSpaceOnUse">
          <path d="M10,0 Q20,30 10,60 Q0,90 10,120" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M50,0 Q40,30 50,60 Q60,90 50,120" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="10" y1="15" x2="50" y2="15" stroke="currentColor" strokeWidth="1" />
          <line x1="10" y1="45" x2="50" y2="45" stroke="currentColor" strokeWidth="1" />
          <line x1="10" y1="75" x2="50" y2="75" stroke="currentColor" strokeWidth="1" />
          <line x1="10" y1="105" x2="50" y2="105" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dna-pattern)" />
    </svg>
  </div>
);

export const HexagonPattern = () => (
  <div className="absolute inset-0 opacity-5">
    <svg width="100%" height="100%">
      <defs>
        <pattern id="hexagon-pattern" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
          <polygon points="28,0 56,15 56,45 28,60 0,45 0,15" fill="none" stroke="currentColor" strokeWidth="1" />
          <polygon points="28,60 56,75 56,105 28,120 0,105 0,75" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexagon-pattern)" />
    </svg>
  </div>
);

export const PulsePattern = () => (
  <div className="absolute inset-0 opacity-5">
    <svg width="100%" height="100%">
      <defs>
        <pattern id="pulse-pattern" x="0" y="0" width="200" height="100" patternUnits="userSpaceOnUse">
          <path d="M0,50 L40,50 L50,20 L60,80 L70,10 L80,50 L200,50" stroke="currentColor" strokeWidth="2" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pulse-pattern)" />
    </svg>
  </div>
);

export const CircuitPattern = () => (
  <div className="absolute inset-0 opacity-5">
    <svg width="100%" height="100%">
      <defs>
        <pattern id="circuit-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="2" fill="currentColor" />
          <circle cx="90" cy="10" r="2" fill="currentColor" />
          <circle cx="10" cy="90" r="2" fill="currentColor" />
          <circle cx="90" cy="90" r="2" fill="currentColor" />
          <line x1="10" y1="10" x2="90" y2="10" stroke="currentColor" strokeWidth="1" />
          <line x1="10" y1="10" x2="10" y2="90" stroke="currentColor" strokeWidth="1" />
          <line x1="90" y1="10" x2="90" y2="90" stroke="currentColor" strokeWidth="1" />
          <line x1="10" y1="90" x2="90" y2="90" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
    </svg>
  </div>
);
