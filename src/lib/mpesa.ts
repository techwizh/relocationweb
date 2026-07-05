import { normalizeKenyanPhone } from "@/lib/phone";

type MpesaConfig = {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
  accountReference: string;
  transactionDesc: string;
};

type OAuthResponse = {
  access_token: string;
  expires_in?: string | number;
};

let cachedAccessToken: { value: string; expiresAt: number } | null = null;

type StkPushResponse = {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
};

type StkQueryResponse = {
  ResultCode: string;
  ResultDesc: string;
};

export type StkPushResult = {
  merchantRequestId: string;
  checkoutRequestId: string;
  customerMessage: string;
};

export class MpesaConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MpesaConfigError";
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (text.trimStart().startsWith("<")) {
    if (response.status === 403) {
      throw new Error(
        "M-Pesa returned HTTP 403 (rate limit or temporary block). Wait 30–60 seconds, then click Pay once. Avoid rapid retries — Daraja sandbox limits how often you can call the API.",
      );
    }

    throw new Error(
      `M-Pesa returned an HTML error page (HTTP ${response.status}). Check your Consumer Key and Consumer Secret in .env, and confirm your Daraja app is active.`,
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `M-Pesa returned an unexpected response (HTTP ${response.status}). Check your Daraja credentials.`,
    );
  }
}

function getMpesaConfig(): MpesaConfig {
  const consumerKey = process.env.MPESA_CONSUMER_KEY?.trim();
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET?.trim();
  const shortcode = process.env.MPESA_SHORTCODE?.trim();
  const passkey = process.env.MPESA_PASSKEY?.trim();
  const callbackUrl = process.env.MPESA_CALLBACK_URL?.trim();

  if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
    throw new MpesaConfigError(
      "M-Pesa is not configured. Add MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, and MPESA_CALLBACK_URL to your .env file.",
    );
  }

  if (callbackUrl.includes("YOUR-NGROK-URL") || callbackUrl.includes("your-public-url")) {
    throw new MpesaConfigError(
      "MPESA_CALLBACK_URL is still a placeholder. Start ngrok or localtunnel and paste the real HTTPS URL.",
    );
  }

  const environment = process.env.MPESA_ENV ?? "sandbox";
  const baseUrl =
    environment === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  return {
    baseUrl,
    consumerKey,
    consumerSecret,
    shortcode,
    passkey,
    callbackUrl,
    accountReference: process.env.MPESA_ACCOUNT_REFERENCE?.trim() || "Relocate",
    transactionDesc: process.env.MPESA_TRANSACTION_DESC?.trim() || "Move booking",
  };
}

function formatTimestamp(date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-KE", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.year}${lookup.month}${lookup.day}${lookup.hour}${lookup.minute}${lookup.second}`;
}

function toStkPhone(phone: string): string {
  const normalized = normalizeKenyanPhone(phone);
  if (!normalized) {
    throw new Error("Invalid phone number for M-Pesa.");
  }

  return normalized.replace("+", "");
}

function buildPassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

async function getAccessToken(config: MpesaConfig): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now) {
    return cachedAccessToken.value;
  }

  const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString(
    "base64",
  );

  const requestInit: RequestInit = {
    headers: {
      Authorization: `Basic ${credentials}`,
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(
        `${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        requestInit,
      );

      const data = await parseJsonResponse<
        OAuthResponse & { errorMessage?: string; errorCode?: string }
      >(response);

      if (!response.ok || !data.access_token) {
        throw new Error(
          data.errorMessage ??
            `M-Pesa authentication failed (HTTP ${response.status}). Re-copy Consumer Key and Secret from Daraja.`,
        );
      }

      const expiresInSeconds = Number(data.expires_in ?? 3500);
      cachedAccessToken = {
        value: data.access_token,
        expiresAt: now + Math.max(60, expiresInSeconds - 60) * 1000,
      };

      return data.access_token;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("M-Pesa authentication failed.");
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  throw (
    lastError ??
    new Error("M-Pesa authentication failed. Wait 30 seconds and try again.")
  );
}

export async function initiateStkPush(input: {
  phone: string;
  amount: number;
  bookingId: string;
}): Promise<StkPushResult> {
  const config = getMpesaConfig();
  const accessToken = await getAccessToken(config);
  const timestamp = formatTimestamp();
  const password = buildPassword(config.shortcode, config.passkey, timestamp);
  const phone = toStkPhone(input.phone);
  const amount = Math.max(1, Math.round(input.amount));

  const response = await fetch(`${config.baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: config.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: config.shortcode,
      PhoneNumber: phone,
      CallBackURL: config.callbackUrl,
      AccountReference: config.accountReference.slice(0, 12),
      TransactionDesc: config.transactionDesc.slice(0, 13),
    }),
  });

  const data = await parseJsonResponse<
    StkPushResponse & {
      errorMessage?: string;
      fault?: { faultstring?: string };
    }
  >(response);

  if (!response.ok || data.ResponseCode !== "0") {
    throw new Error(
      data.errorMessage ??
        data.fault?.faultstring ??
        data.ResponseDescription ??
        "M-Pesa STK Push failed.",
    );
  }

  return {
    merchantRequestId: data.MerchantRequestID,
    checkoutRequestId: data.CheckoutRequestID,
    customerMessage: data.CustomerMessage,
  };
}

export async function queryStkPushStatus(checkoutRequestId: string): Promise<{
  resultCode: string;
  resultDesc: string;
}> {
  const config = getMpesaConfig();
  const accessToken = await getAccessToken(config);
  const timestamp = formatTimestamp();
  const password = buildPassword(config.shortcode, config.passkey, timestamp);

  const response = await fetch(`${config.baseUrl}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: config.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  });

  const data = await parseJsonResponse<StkQueryResponse & { errorMessage?: string }>(response);

  if (!response.ok) {
    throw new Error(data.errorMessage ?? "Could not query M-Pesa payment status.");
  }

  return {
    resultCode: data.ResultCode,
    resultDesc: data.ResultDesc,
  };
}

export function isMpesaConfigured(): boolean {
  try {
    getMpesaConfig();
    return true;
  } catch {
    return false;
  }
}
