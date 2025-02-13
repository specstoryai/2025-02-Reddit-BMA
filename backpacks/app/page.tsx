import { BackpackVisualizer } from '@/components/BackpackVisualizer';
import { backpackData } from '@/lib/data';

export default function Home() {
  return (
    <div className="min-h-screen">
      <BackpackVisualizer data={backpackData} />
    </div>
  );
}
