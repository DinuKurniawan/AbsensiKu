"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MapPin, ExternalLink } from "lucide-react";
import { AttendanceStatusBadge } from "@/components/status-badge";
import {
  formatDate,
  formatTime,
  getGoogleMapsLink,
} from "@/lib/utils";
import { AttendanceStatus } from "@prisma/client";

export type AttendanceDetail = {
  id: string;
  date: Date | string;
  status: AttendanceStatus;
  checkInTime?: Date | string | null;
  checkOutTime?: Date | string | null;
  checkInPhoto?: string | null;
  checkOutPhoto?: string | null;
  checkInLatitude?: number | null;
  checkInLongitude?: number | null;
  checkOutLatitude?: number | null;
  checkOutLongitude?: number | null;
  checkInDistance?: number | null;
  checkOutDistance?: number | null;
  note?: string | null;
  deviceInfo?: string | null;
  ipAddress?: string | null;
  user?: { name: string; email: string } | null;
};

export function AttendanceDetailDialog({
  attendance,
  showUser = true,
}: {
  attendance: AttendanceDetail;
  showUser?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const a = attendance;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Eye className="h-4 w-4" />
      </Button>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Absensi</DialogTitle>
          <DialogDescription>
            {formatDate(a.date)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {showUser && a.user && (
            <div className="rounded-lg border p-3 bg-muted/30">
              <div className="text-sm text-muted-foreground">Karyawan</div>
              <div className="font-semibold">{a.user.name}</div>
              <div className="text-xs text-muted-foreground">{a.user.email}</div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <AttendanceStatusBadge status={a.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Check in */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="font-semibold flex items-center gap-2">
                <Badge variant="success">Absen Masuk</Badge>
                <span className="text-sm text-muted-foreground">
                  {formatTime(a.checkInTime)}
                </span>
              </div>
              {a.checkInPhoto ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.checkInPhoto}
                    alt="Foto Check In"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  Tidak ada foto
                </div>
              )}
              {a.checkInLatitude != null && a.checkInLongitude != null && (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {a.checkInLatitude.toFixed(6)}, {a.checkInLongitude.toFixed(6)}
                  </div>
                  {a.checkInDistance != null && (
                    <div className="text-muted-foreground">
                      Jarak: {a.checkInDistance}m
                    </div>
                  )}
                  <a
                    href={getGoogleMapsLink(a.checkInLatitude, a.checkInLongitude)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Buka Google Maps <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Check out */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="font-semibold flex items-center gap-2">
                <Badge variant="info">Absen Pulang</Badge>
                <span className="text-sm text-muted-foreground">
                  {formatTime(a.checkOutTime)}
                </span>
              </div>
              {a.checkOutPhoto ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.checkOutPhoto}
                    alt="Foto Check Out"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  Belum absen pulang
                </div>
              )}
              {a.checkOutLatitude != null && a.checkOutLongitude != null && (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {a.checkOutLatitude.toFixed(6)}, {a.checkOutLongitude.toFixed(6)}
                  </div>
                  {a.checkOutDistance != null && (
                    <div className="text-muted-foreground">
                      Jarak: {a.checkOutDistance}m
                    </div>
                  )}
                  <a
                    href={getGoogleMapsLink(a.checkOutLatitude, a.checkOutLongitude)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Buka Google Maps <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {(a.note || a.deviceInfo || a.ipAddress) && (
            <div className="rounded-lg border p-4 text-xs space-y-1.5">
              {a.note && (
                <div>
                  <span className="text-muted-foreground">Catatan: </span>
                  {a.note}
                </div>
              )}
              {a.deviceInfo && (
                <div className="text-muted-foreground break-all">
                  <span className="font-medium">Device:</span> {a.deviceInfo}
                </div>
              )}
              {a.ipAddress && (
                <div className="text-muted-foreground">
                  <span className="font-medium">IP:</span> {a.ipAddress}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
