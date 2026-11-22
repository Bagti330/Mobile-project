
import * as Location from "expo-location";
import { requestLocationPermission } from "./permissions";

export async function getReportLocation() {
  try {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      return null;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch (error) {
    console.error("Location error:", error);
    return null;
  }
}
