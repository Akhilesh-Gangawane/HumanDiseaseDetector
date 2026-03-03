# AnimatedBackground Component

A premium, modern animated background for AI Healthcare applications with smooth gradient mesh, floating particles, and neural network animations.

## Features

- ✨ Smooth animated gradient blobs (teal, blue, cyan)
- 🎨 Floating particles with neural network connections
- 🔮 Glassmorphism compatible
- ⚡ Optimized 60fps performance
- 📱 Fully responsive
- 🎯 Fixed positioning (stays behind content)
- 🎭 Professional medical AI theme

## Usage

### Basic Implementation

```tsx
import AnimatedBackground from '@/components/ui/AnimatedBackground'

export default function YourPage() {
  return (
    <div className="relative min-h-screen">
      {/* Animated Background - Fixed, stays behind everything */}
      <AnimatedBackground />
      
      {/* Your Content - Add relative z-10 to stay above background */}
      <div className="relative z-10">
        <YourContent />
      </div>
    </div>
  )
}
```

### With Cards (Glassmorphism)

```tsx
import AnimatedBackground from '@/components/ui/AnimatedBackground'

export default function Dashboard() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      
      <div className="relative z-10 p-8">
        {/* Glass cards work perfectly with the background */}
        <div className="backdrop-blur-md bg-white/70 rounded-3xl shadow-xl p-8">
          <h2>Your Content</h2>
        </div>
      </div>
    </div>
  )
}
```

## Color Scheme

The component uses medical AI theme colors:
- **Teal**: `#0ea5a4` - Primary medical color
- **Blue**: `#2563eb` - Secondary tech color
- **Cyan**: `#06b6d4` - Accent AI color

## Performance

- Canvas-based particle system
- RequestAnimationFrame for smooth 60fps
- Optimized particle count (50 particles)
- Efficient connection drawing
- Automatic cleanup on unmount

## Customization

To customize colors, edit the `AnimatedBackground.tsx` file:

```tsx
// Change particle colors
const colors = ['#0ea5a4', '#2563eb', '#06b6d4']

// Change blob colors in the gradient orbs
background: 'radial-gradient(circle, #YOUR_COLOR 0%, transparent 70%)'
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Notes

- The background is fixed and full-screen
- z-index is set to -10 (behind all content)
- No interaction with user clicks (pointer-events handled automatically)
- Animations are smooth and non-distracting
- Perfect for landing pages, dashboards, and feature sections
