// Type definitions

export interface NavItem {
  name: string
  href: string
}

export interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

export interface Stat {
  value: string
  label: string
}

export interface Step {
  number: string
  title: string
  description: string
  color: string
}

export interface FormData {
  name: string
  email: string
  phone?: string
  message: string
}

export interface ButtonProps {
  children: React.ReactNode
  variant?: 'solid' | 'outline'
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export interface CanvasSize {
  width: number
  height: number
}
