import { BackpackVisualizer } from '@/components/BackpackVisualizer';
import { backpackData } from '@/lib/data';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Backpack Dimensions Visualizer</h1>
      <BackpackVisualizer data={backpackData} />
    </div>
  );
}
