import Map from './components/Map';
import StravaSegments from './components/StravaSegments';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Welcome to Dash-N-Dine</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Map />
          <StravaSegments />
        </div>
      </main>
    </div>
  );
}
