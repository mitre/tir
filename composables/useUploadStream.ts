import type { ProgressMessage } from "~/types/progress";

type ProgressCallback = (msg: ProgressMessage) => void;
type CompletionCallback = () => void;
type ErrorCallback = (err: unknown) => void;

export async function useUploadStream(
  url: string,
  formData: FormData,
  onMessage: ProgressCallback,
  onComplete?: CompletionCallback,
  onError?: ErrorCallback,
): Promise<void> {
  try {
    const response = await fetch(url, { method: "POST", body: formData });
    if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Missing response body");

    const decoder = new TextDecoder();
    let result = "";
    let done = false;

    while (!done) {
      const { done: chunkDone, value } = await reader.read();
      done = chunkDone;

      if (value) {
        result += decoder.decode(value, { stream: true });

        try {
          const messages = result.split("\n").filter(Boolean);
          for (const message of messages) {
            const parsed = JSON.parse(message) as ProgressMessage;

            try {
              onMessage(parsed);
            } catch (e) {
              console.error("Frontend message handler failed:", e);
            }

            if (parsed.type === "complete") return onComplete?.();
          }

          result = "";
        } catch {
          // Incomplete JSON, wait for more data
        }
      }
    }
  } catch (err) {
    onError?.(err);
  }
}
