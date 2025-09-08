import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from 'figma:asset/4ec4ef4bbce2f211d1f818a5e554de58f597206b.png';

interface LogoLogisambProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export function LogoLogisamb({ 
  variant = 'full', 
  size = 'md', 
  className = '', 
  showText = true 
}: LogoLogisambProps) {
  
  const sizeClasses = {
    sm: { container: 'h-8', icon: 'w-8 h-8', text: 'text-sm', subtext: 'text-xs' },
    md: { container: 'h-10', icon: 'w-10 h-10', text: 'text-lg', subtext: 'text-xs' },
    lg: { container: 'h-12', icon: 'w-12 h-12', text: 'text-xl', subtext: 'text-sm' },
    xl: { container: 'h-16', icon: 'w-16 h-16', text: 'text-2xl', subtext: 'text-base' }
  };

  const sizes = sizeClasses[size];

  // Modern SVG Icon Component
  const LogoIcon = ({ className: iconClass = '' }: { className?: string }) => (
    <div className={`relative ${sizes.icon} ${iconClass}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <radialGradient id="glowEffect" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.3)" />
            <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
          </radialGradient>
        </defs>

        {/* Background Glow */}
        <circle cx="50" cy="50" r="45" fill="url(#glowEffect)" />
        
        {/* Main Container/Truck Body */}
        <rect 
          x="25" 
          y="35" 
          width="40" 
          height="25" 
          rx="4" 
          fill="url(#primaryGradient)"
        />
        
        {/* Truck Cabin */}
        <rect 
          x="15" 
          y="40" 
          width="15" 
          height="15" 
          rx="2" 
          fill="url(#accentGradient)"
        />
        
        {/* Wheels */}
        <circle cx="22" cy="65" r="6" fill="#374151" />
        <circle cx="22" cy="65" r="4" fill="#6b7280" />
        <circle cx="55" cy="65" r="6" fill="#374151" />
        <circle cx="55" cy="65" r="4" fill="#6b7280" />
        
        {/* Container Lid */}
        <rect 
          x="27" 
          y="30" 
          width="36" 
          height="4" 
          rx="2" 
          fill="url(#accentGradient)"
        />
        
        {/* Recycling Symbol */}
        <g transform="translate(42, 20) scale(0.6)">
          <path 
            d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" 
            fill="#fbbf24"
          />
          <circle cx="12" cy="9" r="3" fill="none" stroke="#fbbf24" strokeWidth="1"/>
        </g>
        
        {/* Motion Lines */}
        <path 
          d="M70 42 L80 42 M70 46 L78 46 M70 50 L76 50" 
          stroke="url(#primaryGradient)" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
        
        {/* Company Initial */}
        {variant === 'icon' && (
          <text 
            x="50" 
            y="85" 
            textAnchor="middle" 
            fill="url(#primaryGradient)" 
            fontSize="14" 
            fontWeight="bold"
            fontFamily="system-ui"
          >
            L
          </text>
        )}
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <LogoIcon />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-3 ${sizes.container} ${className}`}>
        <LogoIcon />
        {showText && (
          <div className="flex flex-col">
            <h1 className={`font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent leading-none ${sizes.text}`}>
              LOGISAMB
            </h1>
            <p className={`text-muted-foreground leading-none ${sizes.subtext}`}>
              Gestión Integral
            </p>
          </div>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <LogoIcon />
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold bg-gradient-to-r from-green-600 via-green-500 to-blue-600 bg-clip-text text-transparent leading-tight ${sizes.text}`}>
            LOGISAMB
          </h1>
          <p className={`text-muted-foreground leading-tight ${sizes.subtext} max-w-xs`}>
            MANEJO INTEGRAL DE RESIDUOS INDUSTRIALES<br />
            PELIGROSOS Y DOMICILIARIOS
          </p>
        </div>
      )}
    </div>
  );
}

// Alternative version using the original image
export function LogoLogisambImage({ 
  size = 'md', 
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg' | 'xl'; 
  className?: string 
}) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12', 
    lg: 'h-16',
    xl: 'h-20'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <ImageWithFallback 
        src={logoImage}
        alt="LOGISAMB - Manejo Integral de Residuos"
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
    </div>
  );
}

// Brand colors for use across the app
export const LogisambColors = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7', 
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  accent: {
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8'
  }
} as const;