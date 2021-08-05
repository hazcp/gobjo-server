import { Coordinates } from './postcodeToLatLong';
import * as geolib from 'geolib';

export interface SearchArea {
  northWest: Coordinates,
  southEast: Coordinates
}

export function generateLatLongRange(coordinates: Coordinates, distance: number): SearchArea{
  const hypotenuseLength = Math.sqrt(2*Math.pow(distance, 2));

  const northWest = geolib.computeDestinationPoint(
    { latitude: coordinates.lat, longitude: coordinates.long },
    hypotenuseLength,
    315.0
  );
  const southEast = geolib.computeDestinationPoint(
    { latitude: coordinates.lat, longitude: coordinates.long },
    hypotenuseLength,
    135.0
  );
  return {
    northWest: {
      lat: northWest.latitude,
      long: northWest.longitude
    },
    southEast: {
      lat: southEast.latitude,
      long: southEast.longitude
    }
  };
}

