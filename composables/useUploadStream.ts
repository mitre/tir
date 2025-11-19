import type { ProgressMessage } from "~/types/progress";

type ProgressCallback = (msg: ProgressMessage) => void;
type CompletionCallback = () => void;
type ErrorCallback = (err: unknown) => void;

type UploadOpts = {
  uploadLengthHint?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  withCredentials?: boolean;
};

export async function useUploadStream(
  url: string,
  formData: FormData,
  onMessage: ProgressCallback,
  onComplete?: CompletionCallback,
  onError?: ErrorCallback,
  opts: UploadOpts = {},
): Promise<void> {
  try {
    const headers: Record<string, string> = { ...(opts.headers || {}) };
    if (opts.uploadLengthHint != null) {
      headers["X-Upload-Length"] = String(opts.uploadLengthHint);
    }
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers,
      credentials: opts.withCredentials ? "include" : "same-origin",
      signal: opts.signal,
    });
    if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Missing response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line) continue;

        let parsed: ProgressMessage | null = null;
        try {
          parsed = JSON.parse(line) as ProgressMessage;
        } catch {
          parsed = null;
        }
        if (!parsed) continue;

        try {
          onMessage(parsed);
        } catch (e) {
          console.error("Frontend message handler failed:", e);
        }
        if (parsed.type === "complete") {
          onComplete?.();
          return;
        }
      }
    }

    const tail = buffer.trim();
    if (tail) {
      try {
        const parsed = JSON.parse(tail) as ProgressMessage;
        onMessage(parsed);
        if (parsed.type === "complete") onComplete?.();
      } catch {}
    }
  } catch (err) {
    onError?.(err);
  }
}
