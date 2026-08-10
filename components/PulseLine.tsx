export function PulseLine() {
  return (
    <svg
      viewBox="0 0 600 120"
      className="w-full max-w-2xl"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pulseFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7ef29c" stopOpacity="0" />
          <stop offset="15%" stopColor="#7ef29c" stopOpacity="1" />
          <stop offset="85%" stopColor="#7ef29c" stopOpacity="1" />
          <stop offset="100%" stopColor="#7ef29c" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,60 L120,60 L145,60 L160,20 L180,100 L200,60 L230,60 L245,40 L260,60 L340,60 L365,60 L380,15 L400,105 L420,60 L460,60 L475,45 L490,60 L600,60"
        fill="none"
        stroke="url(#pulseFade)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="380" cy="15" r="4" fill="#a8ffc1">
        <animate
          attributeName="opacity"
          values="1;0.3;1"
          dur="1.8s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
