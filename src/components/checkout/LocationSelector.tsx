
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Map } from "lucide-react";
import { toast } from "sonner";

interface LocationSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  selectedLocation?: { lat: number; lng: number; address: string };
}

const LocationSelector = ({ onLocationSelect, selectedLocation }: LocationSelectorProps) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [showMap, setShowMap] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Simulate reverse geocoding - in production, use a real geocoding service
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)} - Nairobi, Kenya`;
          
          onLocationSelect({
            lat: latitude,
            lng: longitude,
            address: address
          });
          
          toast.success("Location detected successfully!");
        } catch (error) {
          toast.error("Failed to get address for your location");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location access denied. Please enable location permissions.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out.");
            break;
          default:
            toast.error("An unknown error occurred while getting location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleManualAddress = () => {
    if (!manualAddress.trim()) {
      toast.error("Please enter an address");
      return;
    }

    // Simulate geocoding - in production, use a real geocoding service
    const simulatedCoords = {
      lat: -1.2921 + (Math.random() - 0.5) * 0.1,
      lng: 36.8219 + (Math.random() - 0.5) * 0.1,
      address: manualAddress
    };

    onLocationSelect(simulatedCoords);
    toast.success("Address added successfully!");
  };

  const SimpleMap = ({ lat, lng }: { lat: number; lng: number }) => (
    <div className="w-full h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="text-center z-10">
        <MapPin className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm font-medium">Your Location</p>
        <p className="text-xs text-muted-foreground">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
      </div>
      <div className="absolute top-4 right-4 bg-white p-2 rounded shadow">
        <span className="text-xs font-medium">Nairobi, Kenya</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Delivery Location</h3>
      </div>

      {/* Current Location Button */}
      <Button
        onClick={getCurrentLocation}
        disabled={isGettingLocation}
        className="w-full"
        variant="outline"
      >
        <Navigation className="h-4 w-4 mr-2" />
        {isGettingLocation ? "Getting Location..." : "Use Current Location"}
      </Button>

      {/* Manual Address Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Enter delivery address manually"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleManualAddress} variant="outline">
            Add
          </Button>
        </div>
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="space-y-3">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Selected Location:</p>
            <p className="text-sm text-muted-foreground">{selectedLocation.address}</p>
          </div>

          {/* Map Toggle */}
          <Button
            onClick={() => setShowMap(!showMap)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Map className="h-4 w-4 mr-2" />
            {showMap ? "Hide Map" : "Show on Map"}
          </Button>

          {/* Simple Map */}
          {showMap && (
            <SimpleMap lat={selectedLocation.lat} lng={selectedLocation.lng} />
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
