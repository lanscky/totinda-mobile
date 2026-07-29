import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "https://backend.totinda.com/api"
).replace(/\/+$/, "");

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_INFO_KEY = "user_info";
const REQUEST_TIMEOUT_MS = 15_000;
let onSessionExpired: (() => void) | null = null;
let pendingTokenRefresh: Promise<string | null> | null = null;

type ApiRequestOptions = RequestInit & {
  authenticated?: boolean;
  retryOnUnauthorized?: boolean;
  timeoutMs?: number;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status = 0, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const getErrorMessage = (data: unknown, fallback: string) => {
  if (!data || typeof data !== "object") return fallback;

  const payload = data as Record<string, unknown>;
  if (typeof payload.detail === "string") return payload.detail;
  if (typeof payload.message === "string") return payload.message;

  const firstValue = Object.values(payload)[0];
  if (typeof firstValue === "string") return firstValue;
  if (Array.isArray(firstValue) && typeof firstValue[0] === "string") {
    return firstValue[0];
  }

  return fallback;
};

const parseResponse = async (response: Response) => {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
};

export const clearSession = () =>
  AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY]);

export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler;
  return () => {
    if (onSessionExpired === handler) onSessionExpired = null;
  };
};

const expireSession = async () => {
  await clearSession();
  onSessionExpired?.();
};

const performTokenRefresh = async () => {
  const refresh = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refresh) {
    await expireSession();
    return null;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
      signal: controller.signal,
    });
    const data = await parseResponse(response);

    if (!response.ok || !data || typeof data !== "object") {
      await expireSession();
      return null;
    }

    const access = (data as Record<string, unknown>).access;
    if (typeof access !== "string") {
      await expireSession();
      return null;
    }

    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access);
    return access;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const refreshAccessToken = () => {
  if (!pendingTokenRefresh) {
    pendingTokenRefresh = performTokenRefresh().finally(() => {
      pendingTokenRefresh = null;
    });
  }
  return pendingTokenRefresh;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    authenticated = true,
    retryOnUnauthorized = true,
    timeoutMs = REQUEST_TIMEOUT_MS,
    headers,
    ...requestOptions
  } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const token = authenticated
      ? await AsyncStorage.getItem(ACCESS_TOKEN_KEY)
      : null;
    const requestHeaders = new Headers(headers);

    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
    if (
      requestOptions.body &&
      !(requestOptions.body instanceof FormData) &&
      !requestHeaders.has("Content-Type")
    ) {
      requestHeaders.set("Content-Type", "application/json");
    }

    const response = await fetch(
      `${API_URL}/${endpoint.replace(/^\/+/, "")}`,
      {
        ...requestOptions,
        headers: requestHeaders,
        signal: controller.signal,
      },
    );

    if (response.status === 401 && authenticated && retryOnUnauthorized) {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        return apiRequest<T>(endpoint, {
          ...options,
          retryOnUnauthorized: false,
        });
      }
    }

    const data = await parseResponse(response);
    if (!response.ok) {
      throw new ApiError(
        getErrorMessage(data, "Une erreur est survenue. Veuillez réessayer."),
        response.status,
        data,
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("La requête a expiré. Vérifiez votre connexion.");
    }
    throw new ApiError("Impossible de joindre le serveur. Vérifiez votre connexion.");
  } finally {
    clearTimeout(timeout);
  }
}
