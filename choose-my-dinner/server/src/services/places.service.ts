import { Client, PlaceType1 } from '@googlemaps/google-maps-services-js';
import { Restaurant, SearchParams, Coordinates } from '../types/search';

export class PlacesService {
  private client: Client;

  constructor(private apiKey: string) {
    this.client = new Client({});
  }

  private async getCoordinates(address: string): Promise<Coordinates> {
    const response = await this.client.geocode({
      params: {
        address,
        key: this.apiKey,
      },
    });

    if (response.data.results.length === 0) {
      throw new Error('Address not found');
    }

    const location = response.data.results[0].geometry.location;
    return { lat: location.lat, lng: location.lng };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async searchRestaurants(params: SearchParams): Promise<Restaurant[]> {
    const coordinates = await this.getCoordinates(params.address);
    
    const searchParams = {
      params: {
        location: coordinates,
        radius: parseInt(params.radius),
        type: PlaceType1.restaurant,
        keyword: params.cuisine,
        minprice: parseInt(params.priceLevel),
        maxprice: parseInt(params.priceLevel),
        key: this.apiKey,
      },
    };

    const response = await this.client.placesNearby(searchParams);

    if (response.data.results.length === 0) {
      return [];
    }

    const allRestaurants = response.data.results.map((place): Restaurant => ({
      name: place.name || 'Unknown Restaurant',
      address: place.vicinity || 'Address not available',
      rating: place.rating || 0,
      priceLevel: place.price_level || 1,
      types: place.types || [],
      photos: place.photos?.map(
        (photo) =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
      ),
    }));

    // Filter by price level if specified
    const filteredRestaurants = params.priceLevel
      ? allRestaurants.filter(
          (restaurant) => restaurant.priceLevel === parseInt(params.priceLevel)
        )
      : allRestaurants;

    // Shuffle and return 3 random restaurants
    return this.shuffleArray(filteredRestaurants).slice(0, 3);
  }
} 