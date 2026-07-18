import { FastEntryForm } from './FastEntryForm'

export default function FastEntryPage() {
  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50 pb-24 md:pb-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Fast Data Entry</h1>
        <p className="text-sm text-gray-500">Transcribe physical registers at lightning speed using just your keyboard.</p>
      </header>

      <FastEntryForm />
    </div>
  )
}
