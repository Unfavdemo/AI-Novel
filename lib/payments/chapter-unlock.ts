import { isPaidChapter, stubPurchasesAllowed, type UnlockSource } from "@/lib/chapter-access";

export type UnlockVerificationCode =
  | "PAYMENT_REQUIRED"
  | "PAYMENT_NOT_VERIFIED"
  | "PAYMENT_PROVIDER_MISCONFIGURED";

export type UnlockVerificationResult =
  | {
      ok: true;
      source: UnlockSource;
      paymentReference: string | null;
    }
  | {
      ok: false;
      code: UnlockVerificationCode;
      message: string;
      status: number;
    };

export function verifyChapterUnlockPayment(
  req: Request,
  chapter: { isFreePreview: boolean; priceCents: number | null },
): UnlockVerificationResult {
  if (!isPaidChapter(chapter)) {
    return { ok: true, source: "stub", paymentReference: null };
  }

  const provider = (process.env.PAYMENT_PROVIDER ?? "stub").toLowerCase();
  if (provider !== "stub" && provider !== "stripe") {
    return {
      ok: false,
      code: "PAYMENT_PROVIDER_MISCONFIGURED",
      message: `Unsupported PAYMENT_PROVIDER "${provider}"`,
      status: 500,
    };
  }

  if (provider === "stripe") {
    const paymentStatus = req.headers.get("x-payment-status");
    const paymentReference = req.headers.get("x-payment-reference");
    if (paymentStatus === "paid") {
      return {
        ok: true,
        source: "stripe",
        paymentReference,
      };
    }
    return {
      ok: false,
      code: "PAYMENT_NOT_VERIFIED",
      message: "Payment is not verified",
      status: 402,
    };
  }

  if (stubPurchasesAllowed()) {
    return { ok: true, source: "stub", paymentReference: null };
  }

  return {
    ok: false,
    code: "PAYMENT_REQUIRED",
    message: "Stub purchases are disabled in this environment",
    status: 403,
  };
}
