import { Coordinate } from '@/store/useMapStore';

/**
 * Jari-jari rata-rata bumi dalam satuan meter (WGS-84 mean radius).
 */
const EARTH_RADIUS_METERS = 6371000;

/**
 * Mengonversi derajat sudut menjadi radian.
 *
 * @param degrees - Nilai sudut dalam derajat.
 * @returns Nilai sudut dalam radian.
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Menghitung jarak lingkaran besar (great-circle distance) antara dua titik koordinat
 * di permukaan bumi menggunakan Formulasi Haversine murni.
 *
 * @param origin - Titik koordinat awal yang berisi latitude dan longitude.
 * @param destination - Titik koordinat tujuan yang berisi latitude dan longitude.
 * @returns Jarak lurus permukaan bumi antara kedua titik dalam satuan meter.
 */
export function calculateDistance(
  origin: Coordinate,
  destination: Coordinate
): number {
  const dLat = toRadians(destination.latitude - origin.latitude);
  const dLon = toRadians(destination.longitude - origin.longitude);

  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const clampedA = Math.min(Math.max(a, 0), 1);
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));

  return EARTH_RADIUS_METERS * c;
}
