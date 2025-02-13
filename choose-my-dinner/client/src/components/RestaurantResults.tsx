import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Restaurant } from '../types/search';

interface RestaurantResultsProps {
  restaurants: Restaurant[];
}

export function RestaurantResults({ restaurants }: RestaurantResultsProps) {
  if (!restaurants.length) {
    return (
      <div className="mt-8 text-center">
        <div className="rounded-lg border border-dashed p-8 max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-2">No Restaurants Found</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find any restaurants matching your criteria. Try:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2">
            <li>Expanding your search radius</li>
            <li>Adjusting the price range</li>
            <li>Trying a different cuisine type</li>
            <li>Double-checking your address</li>
          </ul>
        </div>
      </div>
    );
  }

  const getGoogleMapsUrl = (name: string, address: string) => {
    const query = encodeURIComponent(`${name} ${address}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const getPriceDescription = (priceLevel: number) => {
    switch (priceLevel) {
      case 1:
        return "$ (Under $15)";
      case 2:
        return "$$ ($15-$30)";
      case 3:
        return "$$$ ($31-$60)";
      case 4:
        return "$$$$ (Over $60)";
      default:
        return "Price not available";
    }
  };

  return (
    <div className="grid gap-6 mt-8 md:grid-cols-3">
      {restaurants.map((restaurant, index) => (
        <a
          key={restaurant.name + index}
          href={getGoogleMapsUrl(restaurant.name, restaurant.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-transform hover:scale-105"
        >
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{restaurant.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Rating:</span>{' '}
                  {restaurant.rating} / 5
                </div>
                <div className="text-sm">
                  <span className="font-medium">Price Range:</span>{' '}
                  {getPriceDescription(restaurant.priceLevel)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Address:</span>{' '}
                  <span className="text-blue-600">{restaurant.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
} 