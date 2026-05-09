"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Loader2, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function CameraCapture({
  onCapture,
  photo,
  onReset,
}: {
  onCapture: (dataUrl: string) => void;
  photo: string | null;
  onReset: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActive(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Browser tidak mendukung akses kamera. Gunakan Chrome/Edge/Firefox versi terbaru dan akses via HTTPS atau localhost."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setActive(true);

      // Attach stream AFTER React renders the <video> element.
      // Using rAF ensures videoRef.current is not null.
      requestAnimationFrame(async () => {
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        try {
          await v.play();
        } catch (err) {
          // Autoplay might need user gesture on some browsers; ignore.
          console.warn("video.play() rejected:", err);
        }
      });
    } catch (e: any) {
      const name = e?.name as string | undefined;
      let msg =
        "Akses kamera wajib diaktifkan untuk melakukan absensi.";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        msg =
          "Akses kamera ditolak. Izinkan kamera pada browser lalu coba lagi.";
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        msg = "Kamera tidak ditemukan pada perangkat ini.";
      } else if (name === "NotReadableError") {
        msg =
          "Kamera sedang digunakan aplikasi lain. Tutup aplikasi yang memakai kamera lalu coba lagi.";
      } else if (e?.message) {
        msg = `${msg} (${e.message})`;
      }
      setError(msg);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setActive(false);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror horizontally (selfie)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onCapture(dataUrl);
    stopStream();
  };

  const retake = () => {
    onReset();
    startCamera();
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-900 flex items-center justify-center"
        )}
      >
        {/* Video is ALWAYS mounted so the ref is available.
            Visibility is controlled by CSS to avoid unmount/remount races. */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "h-full w-full object-cover",
            active && !photo ? "block" : "hidden"
          )}
          style={{ transform: "scaleX(-1)" }}
        />

        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt="Preview foto"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {!active && !photo && (
          <div className="text-white/70 text-center space-y-2 px-4 z-10">
            {loading ? (
              <>
                <Loader2 className="h-12 w-12 mx-auto animate-spin" />
                <p className="text-sm">Mengaktifkan kamera...</p>
              </>
            ) : (
              <>
                <CameraOff className="h-12 w-12 mx-auto" />
                <p className="text-sm">Kamera belum aktif</p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {!photo && !active && (
          <Button
            type="button"
            onClick={startCamera}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {loading ? "Mengaktifkan..." : "Aktifkan Kamera"}
          </Button>
        )}
        {!photo && active && (
          <Button type="button" onClick={takePhoto} className="w-full">
            <Camera className="h-4 w-4" /> Ambil Foto
          </Button>
        )}
        {photo && (
          <Button
            type="button"
            variant="outline"
            onClick={retake}
            className="w-full"
          >
            <RefreshCcw className="h-4 w-4" /> Ambil Ulang
          </Button>
        )}
      </div>
    </div>
  );
}
