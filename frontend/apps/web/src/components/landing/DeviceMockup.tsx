import { ReactNode } from 'react';

interface DeviceMockupProps {
  children: ReactNode;
  className?: string;
}

export function DeviceMockup({ children, className = '' }: DeviceMockupProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Glow effect behind device */}
      <div className="absolute inset-0 blur-3xl opacity-40 bg-gradient-to-br from-bvi-turquoise-500 to-bvi-atlantic-500 rounded-full scale-75 animate-glow-pulse" />

      {/* Phone frame - CSS-only 3D effect */}
      <div className="relative animate-float">
        {/* Outer frame with 3D perspective */}
        <div
          className="relative mx-auto"
          style={{
            width: '280px',
            perspective: '1000px',
          }}
        >
          <div
            className="relative rounded-[3rem] bg-gradient-to-br from-gray-800 via-gray-900 to-black p-2 shadow-2xl"
            style={{
              transform: 'rotateY(-5deg) rotateX(2deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Inner bezel */}
            <div className="relative rounded-[2.5rem] bg-black p-1">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="w-24 h-7 bg-black rounded-full flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-800" />
                  <div className="w-3 h-3 rounded-full bg-gray-800 ring-1 ring-gray-700" />
                </div>
              </div>

              {/* Screen content area */}
              <div className="relative rounded-[2.25rem] overflow-hidden bg-bvi-atlantic-800 aspect-[9/19.5]">
                {/* Screen content */}
                <div className="absolute inset-0">
                  {children}
                </div>

                {/* Screen glass reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Side buttons */}
            <div className="absolute -left-1 top-24 w-1 h-8 bg-gray-700 rounded-l-sm" />
            <div className="absolute -left-1 top-36 w-1 h-12 bg-gray-700 rounded-l-sm" />
            <div className="absolute -left-1 top-52 w-1 h-12 bg-gray-700 rounded-l-sm" />
            <div className="absolute -right-1 top-32 w-1 h-16 bg-gray-700 rounded-r-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Pre-built screen content variants
export function QRScannerScreen() {
  return (
    <div className="w-full h-full flex flex-col bg-bvi-atlantic-900">
      {/* Status bar */}
      <div className="pt-12 px-6 pb-4 flex items-center justify-between text-white/60 text-xs">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 border border-white/60 rounded-sm">
            <div className="w-3/4 h-full bg-white/60 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="px-6 py-4">
        <h3 className="text-white font-semibold text-lg">Scan Permit</h3>
        <p className="text-white/60 text-sm mt-1">Position QR code within frame</p>
      </div>

      {/* Scanner viewport */}
      <div className="flex-1 flex items-center justify-center px-8 pb-8">
        <div className="relative w-full aspect-square max-w-[200px]">
          {/* Scanner frame with animated glow */}
          <div className="absolute inset-0 rounded-2xl border-2 border-bvi-turquoise-500 animate-glow-pulse"
               style={{ boxShadow: '0 0 30px rgba(0, 163, 177, 0.4), inset 0 0 30px rgba(0, 163, 177, 0.1)' }}>
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-bvi-turquoise-400 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-bvi-turquoise-400 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-bvi-turquoise-400 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-bvi-turquoise-400 rounded-br-xl" />
          </div>

          {/* Scan line animation */}
          <div className="absolute inset-x-4 top-4 h-0.5 bg-gradient-to-r from-transparent via-bvi-turquoise-400 to-transparent animate-pulse" />

          {/* QR placeholder */}
          <div className="absolute inset-8 grid grid-cols-3 grid-rows-3 gap-1 opacity-30">
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`bg-white/40 rounded-sm ${i === 4 ? 'opacity-0' : ''}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom instruction */}
      <div className="px-6 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bvi-turquoise-500/20 text-bvi-turquoise-400 text-sm">
          <div className="w-2 h-2 rounded-full bg-bvi-turquoise-400 animate-pulse" />
          Scanner active
        </div>
      </div>
    </div>
  );
}

export function VerifiedScreen() {
  return (
    <div className="w-full h-full flex flex-col bg-bvi-atlantic-900">
      {/* Status bar */}
      <div className="pt-12 px-6 pb-4 flex items-center justify-between text-white/60 text-xs">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 border border-white/60 rounded-sm">
            <div className="w-3/4 h-full bg-white/60 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Success content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Success icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-bvi-turquoise-500/20 flex items-center justify-center animate-glow-pulse"
               style={{ boxShadow: '0 0 40px rgba(0, 163, 177, 0.3)' }}>
            <svg className="w-10 h-10 text-bvi-turquoise-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h3 className="text-white font-semibold text-xl mb-2">Permit Verified</h3>
        <p className="text-bvi-turquoise-400 text-sm mb-8">Valid through Dec 2026</p>

        {/* Permit details card */}
        <div className="w-full rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Operator</span>
              <span className="text-white text-sm font-medium">Caribbean Air Charter</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Registration</span>
              <span className="text-white text-sm font-medium font-mono">VP-BAA</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Permit Type</span>
              <span className="text-bvi-turquoise-400 text-sm font-medium">Blanket</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Insurance</span>
              <span className="text-bvi-turquoise-400 text-sm font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-bvi-turquoise-400" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action */}
      <div className="px-6 pb-8">
        <button className="w-full py-3 rounded-xl bg-bvi-turquoise-500 text-white font-medium text-sm">
          Scan Another
        </button>
      </div>
    </div>
  );
}
