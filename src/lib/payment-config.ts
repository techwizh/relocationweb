export function isMpesaPaymentSkipped(): boolean {
  return process.env.SKIP_MPESA_PAYMENT === "true";
}

export function isMpesaSandbox(): boolean {
  return (process.env.MPESA_ENV ?? "sandbox") !== "production";
}

export function isSplitFrontendDeploy(): boolean {
  return Boolean(process.env.API_URL?.trim());
}

/** M-Pesa credentials live on Render in split deploy — don't warn on Vercel. */
export function shouldShowMpesaConfigWarning(mpesaConfigured: boolean): boolean {
  if (isMpesaPaymentSkipped()) return false;
  if (isSplitFrontendDeploy()) return false;
  return !mpesaConfigured;
}
