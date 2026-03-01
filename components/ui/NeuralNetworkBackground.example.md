# Neural Network Background Component

A professional, interactive neural network style animated background for healthcare AI websites with mouse-reactive particles and connecting lines.

## Features

- 🎯 **Small floating particles** with smooth movement
- 🔗 **Dynamic connections** between nearby particles
- 🖱️ **Mouse interaction** - particles react to cursor movement
- 💙 **Blue and white theme** - professional healthcare colors
- ⚡ **Canvas-based** - optimized performance
- 📦 **Contained** - works inside any div/container
- 🎨 **Subtle & professional** - non-distracting animation

## Usage

### Method 1: Using NeuralNetworkContainer (Recommended)

Wrap your content with the container component:

```tsx
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer'

export default function YourPage() {
  return (
    <NeuralNetworkContainer className="min-h-screen bg-white">
      <YourNavbar />
      <YourContent />
      <YourFooter />
    </NeuralNetworkContainer>
  )
}
```

### Method 2: Using in a Specific Section

```tsx
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer'

export default function HeroSection() {
  return (
    <NeuralNetworkContainer className="py-20 bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <h1>Your Hero Title</h1>
        <p>Your content here</p>
      </div>
    </NeuralNetworkContainer>
  )
}
```

### Method 3: Direct Canvas Usage

For more control, use the background component directly:

```tsx
import NeuralNetworkBackground from '@/components/ui/NeuralNetworkBackground'

export default function CustomSection() {
  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <NeuralNetworkBackground />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <YourContent />
      </div>
    </div>
  )
}
```

## Features Explained

### Particle Behavior
- Particles float slowly with random velocity
- Particles move away from mouse cursor (repulsion effect)
- Particles return to original position when mouse moves away
- Smooth damping for natural movement

### Connection Lines
- Lines appear between particles within 120px distance
- Line opacity fades based on distance
- Creates neural network visual effect
- Subtle blue color matching healthcare theme

### Mouse Interaction
- 100px interaction radius around cursor
- Particles gently pushed away from mouse
- Smooth spring-back animation
- Non-intrusive, professional feel

## Customization

### Change Particle Count
Edit `NeuralNetworkBackground.tsx`:
```tsx
// More particles for denser network
const particleCount = Math.floor((canvas.width * canvas.height) / 10000)

// Fewer particles for cleaner look
const particleCount = Math.floor((canvas.width * canvas.height) / 20000)
```

### Change Colors
```tsx
// Particle color
ctx.fillStyle = 'rgba(59, 130, 246, 0.6)' // Blue

// Connection line color
ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`

// Try other colors:
// Teal: rgba(14, 165, 164, 0.6)
// Cyan: rgba(6, 182, 212, 0.6)
// Navy: rgba(30, 58, 138, 0.6)
```

### Adjust Mouse Interaction
```tsx
// Stronger repulsion
const maxDistance = 150 // Increase from 100

// Weaker repulsion
const maxDistance = 80 // Decrease from 100

// Faster return to position
particle.vx += (particle.originalX - particle.x) * 0.02 // Increase from 0.01
```

### Connection Distance
```tsx
// Longer connections
const maxConnectionDistance = 150 // Increase from 120

// Shorter connections
const maxConnectionDistance = 100 // Decrease from 120
```

## Performance

- **Adaptive particle count** based on container size
- **RequestAnimationFrame** for smooth 60fps
- **Efficient distance calculations**
- **Automatic cleanup** on unmount
- **Responsive** to window resize

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (touch events supported)

## Best Practices

1. **Use light backgrounds** - particles are blue, work best on white/light backgrounds
2. **Ensure content contrast** - add backdrop-blur or bg-white/opacity to cards if needed
3. **Test on mobile** - particle count auto-adjusts for smaller screens
4. **Combine with glassmorphism** - works great with glass cards

## Example with Glass Cards

```tsx
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer'

export default function Dashboard() {
  return (
    <NeuralNetworkContainer className="min-h-screen bg-white">
      <div className="p-8">
        {/* Glass card on neural network background */}
        <div className="backdrop-blur-md bg-white/70 rounded-3xl shadow-xl p-8 border border-blue-100">
          <h2 className="text-2xl font-bold">AI Prediction</h2>
          <p>Your content here</p>
        </div>
      </div>
    </NeuralNetworkContainer>
  )
}
```

## Notes

- Background is contained within the wrapper div
- Mouse interaction only works when hovering over the canvas
- Particles stay within container bounds
- Automatically responsive to container size changes
- Professional and subtle - perfect for healthcare/medical AI websites
