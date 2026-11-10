const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type StoredObject = {
  key: string;
  size: number;
  lastModified: string | null;
};

type SignedUpload = {
  key: string;
  url: string;
  expiresAt: string;
};

export async function uploadFile(
  file: File,
  options?: {
    onProgress?: (loaded: number, total: number) => void;
    signal?: AbortSignal;
  },
): Promise<{ key: string }> {
  const contentType = file.type || "application/octet-stream";
  const ticket = await requestJson<SignedUpload>("/storage/uploads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType }),
  });

  await putFile(ticket.url, file, contentType, options);
  return { key: ticket.key };
}

export function describeObject(
  key: string,
): Promise<{ size: number; contentType: string }> {
  return requestJson(
    `/storage/objects/details?key=${encodeURIComponent(key)}`,
  );
}

export function listObjects(): Promise<{ objects: StoredObject[] }> {
  return requestJson("/storage/objects");
}

export async function presignDownload(key: string): Promise<string> {
  const ticket = await requestJson<{ url: string }>(
    `/storage/downloads?key=${encodeURIComponent(key)}`,
  );
  return ticket.url;
}

export async function downloadObject(key: string): Promise<void> {
  window.location.assign(await presignDownload(key));
}

export function deleteObject(key: string): Promise<{ deleted: true }> {
  return requestJson(`/storage/objects?key=${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
}

function putFile(
  url: string,
  file: File,
  contentType: string,
  options?: {
    onProgress?: (loaded: number, total: number) => void;
    signal?: AbortSignal;
  },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        options?.onProgress?.(event.loaded, event.total);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      reject(new Error("Upload to storage failed"));
    };
    xhr.onerror = () => reject(new Error("Upload to storage failed"));
    xhr.onabort = () =>
      reject(new DOMException("Upload canceled", "AbortError"));
    options?.signal?.addEventListener("abort", () => xhr.abort(), {
      once: true,
    });
    if (options?.signal?.aborted) {
      xhr.abort();
      return;
    }
    xhr.send(file);
  });
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, init);
  if (!response.ok) {
    let detail = `Storage request failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: unknown };
      if (typeof body.message === "string") {
        detail = body.message;
      }
    } catch {
      // The status line is enough when the body is not JSON.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}
