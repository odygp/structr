import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-lg bg-gray-900 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Structr</h1>
        <p className="text-gray-500 mb-8">Build wireframes with drag-and-drop sections</p>
        <Link
          href="/builder"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Go to Builder
        </Link>
      </div>
    </div>
  );
}
