"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { processLeaveRequest } from "@/app/actions/leave-actions";
import { LeaveTypeBadge, LeaveStatusBadge } from "@/components/status-badge";
import { LeaveStatus } from "@prisma/client";
import { formatDateShort } from "@/lib/utils";

export function LeaveActions({
  leave,
}: {
  leave: {
    id: string;
    type: "IZIN" | "SAKIT" | "CUTI";
    startDate: Date | string;
    endDate: Date | string;
    reason: string;
    attachment?: string | null;
    status: LeaveStatus;
    rejectedReason?: string | null;
    user: { name: string; email: string };
  };
}) {
  const router = useRouter();
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (status: "APPROVED" | "REJECTED") => {
    setLoading(true);
    try {
      await processLeaveRequest(leave.id, {
        status,
        rejectedReason: status === "REJECTED" ? rejectReason : null,
      });
      toast.success(
        status === "APPROVED" ? "Pengajuan disetujui" : "Pengajuan ditolak"
      );
      setDetailOpen(false);
      setRejectOpen(false);
      setRejectReason("");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal memproses");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDetailOpen(true)}
          title="Detail"
        >
          <Eye className="h-4 w-4" />
        </Button>
        {leave.status === "PENDING" && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-emerald-600 hover:text-emerald-700"
              onClick={() => handle("APPROVED")}
              disabled={loading}
              title="Setujui"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => setRejectOpen(true)}
              title="Tolak"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail Pengajuan</DialogTitle>
            <DialogDescription>
              Diajukan oleh {leave.user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <LeaveTypeBadge type={leave.type} />
              <LeaveStatusBadge status={leave.status} />
            </div>
            <div>
              <div className="text-muted-foreground">Periode</div>
              <div className="font-medium">
                {formatDateShort(leave.startDate)} — {formatDateShort(leave.endDate)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Alasan</div>
              <div className="whitespace-pre-line">{leave.reason}</div>
            </div>
            {leave.attachment && (
              <div>
                <div className="text-muted-foreground">Lampiran</div>
                <a
                  href={leave.attachment}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Lihat lampiran <ExternalLink className="h-3 w-3" />
                </a>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={leave.attachment}
                  alt="Lampiran"
                  className="mt-2 max-h-64 rounded-lg border"
                />
              </div>
            )}
            {leave.rejectedReason && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div className="text-xs font-medium text-destructive">
                  Alasan Penolakan
                </div>
                <div>{leave.rejectedReason}</div>
              </div>
            )}
          </div>
          {leave.status === "PENDING" && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDetailOpen(false);
                  setRejectOpen(true);
                }}
              >
                <X className="h-4 w-4" /> Tolak
              </Button>
              <Button
                variant="success"
                onClick={() => handle("APPROVED")}
                disabled={loading}
              >
                <Check className="h-4 w-4" /> Setujui
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pengajuan</DialogTitle>
            <DialogDescription>
              Sampaikan alasan penolakan kepada karyawan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Alasan Penolakan</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Tulis alasan penolakan..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => handle("REJECTED")}
              disabled={loading || !rejectReason.trim()}
            >
              Tolak Pengajuan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
