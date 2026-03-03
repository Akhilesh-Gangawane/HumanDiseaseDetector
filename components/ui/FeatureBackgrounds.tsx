'use client'

export const NeuralNetworkBg = () => (
  <div className="absolute inset-0 opacity-40 overflow-hidden">
    <svg width="100%" height="100%" className="text-blue-600">
      <defs>
        <radialGradient id="glow">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Pulsing Neural nodes */}
      <circle cx="20%" cy="30%" r="4" fill="url(#glow)">
        <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="40%" cy="20%" r="3" fill="url(#glow)">
        <animate attributeName="r" values="2;4;2" dur="3.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;1;0.5" dur="3.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="60%" cy="40%" r="4" fill="url(#glow)">
        <animate attributeName="r" values="3;5;3" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="80%" cy="25%" r="3" fill="url(#glow)">
        <animate attributeName="r" values="2;4;2" dur="3.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;1;0.5" dur="3.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="30%" cy="60%" r="3" fill="url(#glow)">
        <animate attributeName="r" values="2;4;2" dur="3.3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;1;0.5" dur="3.3s" repeatCount="indefinite" />
      </circle>
      <circle cx="70%" cy="70%" r="4" fill="url(#glow)">
        <animate attributeName="r" values="3;5;3" dur="2.9s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2.9s" repeatCount="indefinite" />
      </circle>
      <circle cx="50%" cy="80%" r="3" fill="url(#glow)">
        <animate attributeName="r" values="2;4;2" dur="3.1s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;1;0.5" dur="3.1s" repeatCount="indefinite" />
      </circle>
      
      {/* Connecting lines with subtle pulse */}
      <line x1="20%" y1="30%" x2="40%" y2="20%" stroke="currentColor" strokeWidth="1" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="40%" y1="20%" x2="60%" y2="40%" stroke="currentColor" strokeWidth="1" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2.2s" repeatCount="indefinite" />
      </line>
      <line x1="60%" y1="40%" x2="80%" y2="25%" stroke="currentColor" strokeWidth="1" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2.4s" repeatCount="indefinite" />
      </line>
      <line x1="20%" y1="30%" x2="30%" y2="60%" stroke="currentColor" strokeWidth="1" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2.1s" repeatCount="indefinite" />
      </line>
      <line x1="60%" y1="40%" x2="70%" y2="70%" stroke="currentColor" strokeWidth="1" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2.3s" repeatCount="indefinite" />
      </line>
      <line x1="30%" y1="60%" x2="50%" y2="80%" stroke="currentColor" strokeWidth="1" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2.5s" repeatCount="indefinite" />
      </line>
      <line x1="70%" y1="70%" x2="50%" y2="80%" stroke="currentColor" strokeWidth="1" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2.6s" repeatCount="indefinite" />
      </line>
    </svg>
  </div>
);

export const EKGWaveBg = () => (
  <div className="absolute inset-0 opacity-40 overflow-hidden">
    <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none" className="text-blue-600">
      <defs>
        <linearGradient id="ekgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Smooth flowing EKG wave pattern */}
      <path
        d="M0,100 L80,100 L85,80 L90,120 L95,60 L100,100 L400,100"
        stroke="url(#ekgGradient)"
        strokeWidth="2"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          from="-100 0"
          to="0 0"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M0,100 L80,100 L85,80 L90,120 L95,60 L100,100 L400,100"
        stroke="url(#ekgGradient)"
        strokeWidth="2"
        fill="none"
        transform="translate(0, 40)"
        opacity="0.5"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          from="-100 40"
          to="0 40"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  </div>
);

export const NetworkMapBg = () => (
  <div className="absolute inset-0 opacity-40 overflow-hidden">
    <svg width="100%" height="100%" className="text-teal-600">
      {/* Grid pattern */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        </pattern>
        <filter id="bokeh">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      {/* Soft Bokeh Particles - floating light orbs */}
      <circle cx="30%" cy="40%" r="8" fill="currentColor" opacity="0.4" filter="url(#bokeh)">
        <animate attributeName="cy" values="40%;35%;40%" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="30%" cy="40%" r="16" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2">
        <animate attributeName="r" values="16;20;16" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur="4s" repeatCount="indefinite" />
      </circle>
      
      <circle cx="70%" cy="30%" r="6" fill="currentColor" opacity="0.4" filter="url(#bokeh)">
        <animate attributeName="cy" values="30%;25%;30%" dur="5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="5s" repeatCount="indefinite" />
      </circle>
      <circle cx="70%" cy="30%" r="12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2">
        <animate attributeName="r" values="12;16;12" dur="5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur="5s" repeatCount="indefinite" />
      </circle>
      
      <circle cx="50%" cy="70%" r="10" fill="currentColor" opacity="0.4" filter="url(#bokeh)">
        <animate attributeName="cy" values="70%;65%;70%" dur="4.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="50%" cy="70%" r="18" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2">
        <animate attributeName="r" values="18;22;18" dur="4.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur="4.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  </div>
);

export const LockSecurityBg = () => (
  <div className="absolute inset-0 opacity-40 overflow-hidden">
    <svg width="100%" height="100%" viewBox="0 0 200 200" className="text-blue-800">
      {/* Scanning line effect */}
      <defs>
        <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.6" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Horizontal scanning line */}
      <rect x="0" y="0" width="200" height="4" fill="url(#scanGradient)">
        <animate attributeName="y" values="0;196;0" dur="6s" repeatCount="indefinite" />
      </rect>
      
      {/* Fading hexagonal grid */}
      <g opacity="0.3">
        <polygon points="30,20 40,15 50,20 50,30 40,35 30,30" fill="none" stroke="currentColor" strokeWidth="0.5">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
        </polygon>
        <polygon points="60,20 70,15 80,20 80,30 70,35 60,30" fill="none" stroke="currentColor" strokeWidth="0.5">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3.5s" repeatCount="indefinite" />
        </polygon>
        <polygon points="90,20 100,15 110,20 110,30 100,35 90,30" fill="none" stroke="currentColor" strokeWidth="0.5">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite" />
        </polygon>
        <polygon points="45,45 55,40 65,45 65,55 55,60 45,55" fill="none" stroke="currentColor" strokeWidth="0.5">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3.2s" repeatCount="indefinite" />
        </polygon>
        <polygon points="75,45 85,40 95,45 95,55 85,60 75,55" fill="none" stroke="currentColor" strokeWidth="0.5">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3.8s" repeatCount="indefinite" />
        </polygon>
      </g>
      
      {/* Lock icon with pulse */}
      <g transform="translate(140, 120)">
        <rect x="0" y="20" width="40" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
        </rect>
        <path d="M10,20 L10,10 Q10,0 20,0 Q30,0 30,10 L30,20" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
        </path>
        <circle cx="20" cy="35" r="4" fill="currentColor" opacity="0.4">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  </div>
);

export const AnalyticsChartBg = () => (
  <div className="absolute inset-0 opacity-40 overflow-hidden">
    <svg width="100%" height="100%" viewBox="0 0 200 150" preserveAspectRatio="none" className="text-blue-600">
      {/* Growing Data Pillars - bars that rise and fall */}
      <rect x="20" y="90" width="20" height="50" fill="currentColor" opacity="0.4">
        <animate attributeName="height" values="50;60;50" dur="3s" repeatCount="indefinite" />
        <animate attributeName="y" values="90;80;90" dur="3s" repeatCount="indefinite" />
      </rect>
      <rect x="50" y="70" width="20" height="70" fill="currentColor" opacity="0.5">
        <animate attributeName="height" values="70;85;70" dur="3.5s" repeatCount="indefinite" />
        <animate attributeName="y" values="70;55;70" dur="3.5s" repeatCount="indefinite" />
      </rect>
      <rect x="80" y="50" width="20" height="90" fill="currentColor" opacity="0.6">
        <animate attributeName="height" values="90;105;90" dur="4s" repeatCount="indefinite" />
        <animate attributeName="y" values="50;35;50" dur="4s" repeatCount="indefinite" />
      </rect>
      <rect x="110" y="40" width="20" height="100" fill="currentColor" opacity="0.5">
        <animate attributeName="height" values="100;115;100" dur="3.2s" repeatCount="indefinite" />
        <animate attributeName="y" values="40;25;40" dur="3.2s" repeatCount="indefinite" />
      </rect>
      <rect x="140" y="30" width="20" height="110" fill="currentColor" opacity="0.7">
        <animate attributeName="height" values="110;125;110" dur="3.8s" repeatCount="indefinite" />
        <animate attributeName="y" values="30;15;30" dur="3.8s" repeatCount="indefinite" />
      </rect>
      <rect x="170" y="20" width="20" height="120" fill="currentColor" opacity="0.6">
        <animate attributeName="height" values="120;135;120" dur="4.2s" repeatCount="indefinite" />
        <animate attributeName="y" values="20;5;20" dur="4.2s" repeatCount="indefinite" />
      </rect>
      
      {/* Animated trend line */}
      <path
        d="M30,100 L60,80 L90,60 L120,50 L150,35 L180,25"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      >
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  </div>
);

export const MobileAppBg = () => (
  <div className="absolute inset-0 opacity-40 overflow-hidden">
    <svg width="100%" height="100%" viewBox="0 0 200 200" className="text-teal-600">
      <defs>
        <filter id="glass-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>
      </defs>
      
      {/* Floating App UI Glass - soft blurred rectangles moving in 3D space */}
      <rect x="20" y="30" width="60" height="40" rx="8" fill="currentColor" opacity="0.15" filter="url(#glass-blur)">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 5,-3; 0,0"
          dur="5s"
          repeatCount="indefinite"
        />
        <animate attributeName="opacity" values="0.1;0.25;0.1" dur="5s" repeatCount="indefinite" />
      </rect>
      
      <rect x="100" y="50" width="70" height="50" rx="10" fill="currentColor" opacity="0.12" filter="url(#glass-blur)">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -4,4; 0,0"
          dur="6s"
          repeatCount="indefinite"
        />
        <animate attributeName="opacity" values="0.08;0.2;0.08" dur="6s" repeatCount="indefinite" />
      </rect>
      
      <rect x="40" y="110" width="50" height="35" rx="6" fill="currentColor" opacity="0.18" filter="url(#glass-blur)">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 3,5; 0,0"
          dur="5.5s"
          repeatCount="indefinite"
        />
        <animate attributeName="opacity" values="0.12;0.28;0.12" dur="5.5s" repeatCount="indefinite" />
      </rect>
      
      <rect x="120" y="130" width="55" height="45" rx="7" fill="currentColor" opacity="0.14" filter="url(#glass-blur)">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -5,-2; 0,0"
          dur="6.5s"
          repeatCount="indefinite"
        />
        <animate attributeName="opacity" values="0.1;0.22;0.1" dur="6.5s" repeatCount="indefinite" />
      </rect>
      
      {/* Phone outline with subtle pulse */}
      <g transform="translate(60, 20)">
        <rect x="0" y="0" width="80" height="160" rx="12" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3">
          <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
        </rect>
        <circle cx="40" cy="145" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3">
          <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  </div>
);
