import { Restaurant } from '@/hooks/useRestaurants';
import { format } from 'date-fns';
import { TrashIcon } from '@heroicons/react/24/outline';

interface RestaurantListProps {
  restaurants: Restaurant[];
  onSelect?: (restaurant: Restaurant) => void;
  onDelete?: (id: string) => void;
  selectedId?: string;
}

export default function RestaurantList({
  restaurants,
  onSelect,
  onDelete,
  selectedId
}: RestaurantListProps) {
  if (restaurants.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No restaurants saved yet. Search and add some!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {restaurants.map((restaurant) => (
        <div
          key={restaurant.id}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedId === restaurant.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
          }`}
          onClick={() => onSelect?.(restaurant)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{restaurant.name}</h3>
              <div className="text-sm text-gray-600 mt-1">
                <div>Visited: {new Date(restaurant.visitDate).toLocaleDateString()}</div>
                <div className="flex items-center gap-1">
                  <span>Your Rating: </span>
                  <span className="text-yellow-400">{'★'.repeat(Math.floor(restaurant.rating))}</span>
                  {restaurant.rating % 1 !== 0 && <span className="text-yellow-400">½</span>}
                  <span className="ml-1">({restaurant.rating})</span>
                </div>
              </div>
              {restaurant.notes && (
                <p className="text-sm text-gray-600 mt-1">{restaurant.notes}</p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(restaurant.id);
              }}
              className="text-red-500 hover:text-red-600"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 