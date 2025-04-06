export const PencilWallSVG = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 800 600"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute inset-0 z-0 opacity-5"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="1,1" />
      </pattern>
      <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill="url(#smallGrid)" />
        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#000" strokeWidth="1" strokeDasharray="2,2" />
      </pattern>
    </defs>
    
    <rect width="100%" height="100%" fill="url(#grid)" />
    
    {/* Hand-drawn lines */}
    <g stroke="#000" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M50,50 Q100,20 150,50 T250,50" strokeWidth="1" strokeDasharray="1,3" />
      <path d="M300,100 Q350,150 400,100 T500,150" strokeWidth="1" strokeDasharray="1,3" />
      <path d="M600,200 Q650,250 700,200 T800,250" strokeWidth="1" strokeDasharray="1,3" />
      <path d="M100,300 Q150,350 200,300 T300,350" strokeWidth="1" strokeDasharray="1,3" />
      <path d="M400,400 Q450,450 500,400 T600,450" strokeWidth="1" strokeDasharray="1,3" />
      <path d="M700,500 Q750,550 800,500 T900,550" strokeWidth="1" strokeDasharray="1,3" />
    </g>
    
    {/* Sketchy circles */}
    <g stroke="#000" fill="none" strokeWidth="0.5">
      <ellipse cx="200" cy="100" rx="30" ry="25" strokeDasharray="2,2" />
      <ellipse cx="400" cy="200" rx="25" ry="30" strokeDasharray="2,2" />
      <ellipse cx="600" cy="300" rx="35" ry="25" strokeDasharray="2,2" />
      <ellipse cx="300" cy="400" rx="25" ry="20" strokeDasharray="2,2" />
      <ellipse cx="500" cy="500" rx="30" ry="35" strokeDasharray="2,2" />
    </g>
    
    {/* Pencil texture */}
    <filter id="pencilTexture" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    
    <rect width="100%" height="100%" filter="url(#pencilTexture)" fillOpacity="0" />
  </svg>
);

export default function PencilWallBackground() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
      <PencilWallSVG />
    </div>
  );
}