"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Crosshair,
  MapPin,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldOff,
} from "lucide-react";
import { haversineDistance } from "@/lib/haversine";
import { getGoogleMapsLink } from "@/lib/utils";

export type LocationResult = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  distance: number;
  inside: boolean;
};

export function GeolocationBox({
  officeLatitude,
  officeLongitude,
  radius,
  onLocationChange,
}: {
  officeLatitude: number;
  officeLongitude: number;
  radius: number;
  onLocationChange: (loc: LocationResult | null) => void;
}) {
  const [loc, setLoc] = useState<LocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enforced = radius > 0;

  const detect = () => {
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung geolocation");
      return;
    }
    setError(null);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const distance = haversineDistance(
          pos.coords.latitude,
          pos.coords.longitude,
          officeLatitude,
          officeLongitude
        );
        const result: LocationResult = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          distance: Math.round(distance * 100) / 100,
          // When radius is 0 (disabled), user is always considered inside.
          inside: enforced ? distance <= radius : true,
        };
        setLoc(result);
        onLocationChange(result);
        setLoading(false);
      },
      (err) => {
        setError(
          "Akses lokasi wajib diaktifkan untuk melakukan absensi. " +
            (err.message ?? "")
        );
        setLoc(null);
        onLocationChange(null);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-3">
      {!enforced && (
        <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <ShieldOff className="h-4 w-4" />
          Validasi radius kantor dinonaktifkan oleh admin — absensi dapat
          dilakukan dari lokasi mana pun.
        </div>
      )}

      <div className="rounded-lg border p-4 bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Lokasi Saya</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={detect}
            disabled={loading}
          >
            <Crosshair className="h-4 w-4" />
            {loading ? "Mendeteksi..." : "Deteksi Lokasi"}
          </Button>
        </div>

        {loc && (
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="font-mono text-xs text-muted-foreground">
              {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
            </div>
            {loc.accuracy && (
              <div className="text-xs text-muted-foreground">
                Akurasi: ±{Math.round(loc.accuracy)}m
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs">Jarak dari kantor:</span>
              <span className="font-semibold">{loc.distance}m</span>
              {enforced && (
                <span className="text-xs text-muted-foreground">
                  (batas: {radius}m)
                </span>
              )}
            </div>
            <a
              href={getGoogleMapsLink(loc.latitude, loc.longitude)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Buka di Google Maps <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>

      {loc && enforced && loc.inside && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Anda berada di dalam area kantor.
        </div>
      )}
      {loc && enforced && !loc.inside && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>
            Anda berada di luar area kantor (jarak {loc.distance}m). Absensi
            tidak dapat dilakukan.
          </span>
        </div>
      )}
      {loc && !enforced && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Lokasi terdeteksi. Anda dapat melanjutkan absensi.
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          {error}
        </div>
      )}
    </div>
  );
}
