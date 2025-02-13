export default function Loading() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-800 rounded mb-6" />
        
        <div className="space-y-4">
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="flex gap-4 flex-wrap">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg animate-pulse">
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-3" />
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 