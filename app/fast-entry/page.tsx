import { FastEntryForm } from './FastEntryForm'
import Image from 'next/image'

export default function FastEntryPage() {
  return (
    <div className="relative min-h-screen pb-24 md:pb-8 text-gray-900 overflow-hidden">
      {/* Beautiful Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/hero-bg.png" 
          alt="Abstract Background" 
          fill
          priority
          className="object-cover opacity-60 md:opacity-40"
        />
        {/* Subtle gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-gray-50/80 to-gray-50" />
      </div>

      <div className="relative z-10 p-4 md:p-8 pt-12 md:pt-16">
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-4 drop-shadow-sm">Fast Data Entry</h1>
          <p className="text-base md:text-lg text-gray-600 font-medium max-w-lg mx-auto">Transcribe physical registers at lightning speed with hands-free navigation.</p>
        </header>

        <FastEntryForm />
      </div>
    </div>
  )
}
