import { z } from "zod";
import { parseAmountToStroops } from "./terms";

export const dealTypes = ["Service", "DigitalGoods", "Custom"] as const;
export type DealType = (typeof dealTypes)[number];

export const dealStatuses = [
  "Created",
  "Funded",
  "Delivered",
  "RevisionRequested",
  "Disputed",
  "Released",
  "Refunded",
  "Cancelled",
] as const;
export type DealStatus = (typeof dealStatuses)[number];

const addressSchema = z.string().regex(/^[GC][A-Z2-7]{55}$/, "Alamat Stellar tidak valid");

export const dealInputSchema = z
  .object({
    dealType: z.enum(dealTypes),
    title: z.string().trim().min(3, "Judul minimal 3 karakter").max(100),
    description: z.string().trim().min(10, "Deskripsi minimal 10 karakter").max(2_000),
    seller: addressSchema,
    buyer: addressSchema,
    resolver: addressSchema,
    asset: addressSchema,
    amount: z.string().refine(
      (value) => {
        try {
          parseAmountToStroops(value);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Nominal tidak valid" },
    ),
    deliveryDeadline: z.string().min(1, "Deadline wajib diisi"),
    reviewPeriodHours: z.number().int().positive("Periode review wajib diisi"),
    revisionLimit: z.number().int().min(0).max(10),
    revisionPeriodHours: z.number().int().min(0),
  })
  .superRefine((input, context) => {
    if (input.buyer === input.seller) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Buyer harus berbeda dari seller",
        path: ["buyer"],
      });
    }
    if (input.resolver === input.seller || input.resolver === input.buyer) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Resolver harus berbeda dari buyer dan seller",
        path: ["resolver"],
      });
    }
    if (input.revisionLimit > 0 && input.revisionPeriodHours <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Periode revisi wajib diisi",
        path: ["revisionPeriodHours"],
      });
    }
    const timestamp = new Date(input.deliveryDeadline).getTime();
    if (!Number.isFinite(timestamp) || timestamp <= Date.now()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Deadline harus di masa depan",
        path: ["deliveryDeadline"],
      });
    }
  });

export type DealInput = z.infer<typeof dealInputSchema>;

type StatusTone = "waiting" | "secure" | "review" | "warning" | "success" | "neutral";

const statusPresentation: Record<
  DealStatus,
  { label: string; tone: StatusTone; description: string }
> = {
  Created: {
    label: "Menunggu pendanaan",
    tone: "waiting",
    description: "Deal sudah dibuat. Buyer belum mengunci dana.",
  },
  Funded: {
    label: "Dana terkunci",
    tone: "secure",
    description: "Dana buyer aman di escrow. Seller dapat mulai memenuhi deal.",
  },
  Delivered: {
    label: "Menunggu pemeriksaan",
    tone: "review",
    description: "Seller sudah mengirim hasil. Buyer sedang memeriksa.",
  },
  RevisionRequested: {
    label: "Perlu revisi",
    tone: "warning",
    description: "Buyer meminta perbaikan sebelum dana diteruskan.",
  },
  Disputed: {
    label: "Dalam penyelesaian",
    tone: "warning",
    description: "Deal sedang ditinjau resolver yang disepakati.",
  },
  Released: {
    label: "Dana diteruskan",
    tone: "success",
    description: "Deal selesai dan dana sudah diteruskan ke seller.",
  },
  Refunded: {
    label: "Dana dikembalikan",
    tone: "neutral",
    description: "Dana escrow sudah kembali ke buyer.",
  },
  Cancelled: {
    label: "Deal dibatalkan",
    tone: "neutral",
    description: "Deal dibatalkan sebelum pendanaan.",
  },
};

export function getStatusPresentation(status: DealStatus) {
  return statusPresentation[status];
}
