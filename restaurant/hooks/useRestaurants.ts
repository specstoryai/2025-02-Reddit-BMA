import { useState, useEffect } from 'react';

export interface Restaurant {
  id: string;
  name: string;
  placeId: string;
  location: {
    lat: number;
    lng: number;
  };
  notes: string;
  visitDate: string;
  rating: number;
}

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    // Load restaurants from localStorage on mount
    const stored = localStorage.getItem('restaurants');
    if (stored) {
      setRestaurants(JSON.parse(stored));
    }
  }, []);

  const addRestaurant = (restaurant: Omit<Restaurant, 'id'>) => {
    const newRestaurant = {
      ...restaurant,
      id: crypto.randomUUID()
    };
    const updatedRestaurants = [...restaurants, newRestaurant];
    setRestaurants(updatedRestaurants);
    localStorage.setItem('restaurants', JSON.stringify(updatedRestaurants));
  };

  const removeRestaurant = (id: string) => {
    const updatedRestaurants = restaurants.filter(r => r.id !== id);
    setRestaurants(updatedRestaurants);
    localStorage.setItem('restaurants', JSON.stringify(updatedRestaurants));
  };

  const updateRestaurant = (id: string, updates: Partial<Restaurant>) => {
    const updatedRestaurants = restaurants.map(r => 
      r.id === id ? { ...r, ...updates } : r
    );
    setRestaurants(updatedRestaurants);
    localStorage.setItem('restaurants', JSON.stringify(updatedRestaurants));
  };

  return {
    restaurants,
    addRestaurant,
    removeRestaurant,
    updateRestaurant
  };
} 