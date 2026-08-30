
import { Card } from '../components/ui/Card'

// Helper component for placeholder pages to demonstrate atmosphere
function PlaceholderPage({ title, bgClass, textClass }: { title: string, bgClass: string, textClass?: string }) {
  return (
    <div className={`min-h-screen pt-8 px-4 flex flex-col items-center ${bgClass} ${textClass || 'text-plumBrown'}`}>
      <h1 className="text-3xl font-serif mb-8 text-center">{title}</h1>
      <Card className="w-full max-w-sm p-8 text-center bg-white/60 backdrop-blur-sm shadow-soft">
        <p className="opacity-80">This feature is not yet implemented.</p>
      </Card>
    </div>
  )
}

export function Login() {
  return <PlaceholderPage title="Login" bgClass="bg-warmPaper" />
}

export function Time() {
  return <PlaceholderPage title="Our Time" bgClass="bg-lavender-deep/20" /> // Twilight Lavender
}

export function Moments() {
  return <PlaceholderPage title="Our Moments" bgClass="bg-rose-pink/20" /> // Rose Garden
}

export function Messages() {
  return <PlaceholderPage title="Messages" bgClass="bg-blush" /> // Warm Blush/Paper
}

export function Doodle() {
  return <PlaceholderPage title="Doodle Wall" bgClass="bg-white" /> // Warm White Paper
}

export function Compass() {
  return <PlaceholderPage title="Compass" bgClass="bg-blue-100/50" /> // Soft Sky + Lavender
}

export function Games() {
  return <PlaceholderPage title="Games" bgClass="bg-sunflower/20" /> // Sunflower Meadow
}

export function Garden() {
  return <PlaceholderPage title="Memory Garden" bgClass="bg-sage/20" /> // Sage + Flora
}

export function Settings() {
  return <PlaceholderPage title="Settings" bgClass="bg-warmPaper" /> 
}
