export interface ApiClientOptions extends RequestInit {
  timeoutMs?: number;
}

export class ApiError extends Error {
  constructor(public status: number, public statusText: string, public body: unknown) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

export async function apiClient<T = unknown>(url: string, options: ApiClientOptions = {}): Promise<T> {
  const { timeoutMs = 15000, ...fetchOptions } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    if (!res.ok) {
      let body;
      try {
        body = await res.json();
      } catch {
        body = await res.text();
      }
      throw new ApiError(res.status, res.statusText, body);
    }

    // Return empty object for 204 No Content
    if (res.status === 204) return {} as T;
    
    // Parse JSON
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}
