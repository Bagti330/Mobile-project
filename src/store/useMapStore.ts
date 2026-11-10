import { create } from 'zustand';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface MarkerData {
  id: string;
  coordinate: Coordinate;
  timestamp: number;
}

export interface MapState {
  currentLocation: Coordinate | null;
  hasLocationPermission: boolean | null;
  markers: MarkerData[];
  setCurrentLocation: (location: Coordinate | null) => void;
  setLocationPermission: (hasPermission: boolean | null) => void;
  addMarker: (marker: MarkerData) => void;
}

export const useMapStore = create<MapState>((set) => ({
  currentLocation: null,
  hasLocationPermission: null,
  markers: [],
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  setLocationPermission: (hasLocationPermission) => set({ hasLocationPermission }),
  addMarker: (marker) =>
    set((state) => ({
      markers: [...state.markers, marker],
    })),
}));

