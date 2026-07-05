export function isMpesaPaymentSkipped(): boolean {
  return process.env.SKIP_MPESA_PAYMENT === "true";
}

export function isMpesaSandbox(): boolean {
  return (process.env.MPESA_ENV ?? "sandbox") !== "production";
}
