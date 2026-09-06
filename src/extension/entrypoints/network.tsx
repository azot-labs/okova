export default defineUnlistedScript(() => {
  const MAX_SIZE = 1024 * 1024 * 1; // 1 MB

  const filterHead = (url: string, headers: Record<string, string>) => {
    const size = headers['content-length'];
    const isSizeOk = Number(size) < MAX_SIZE;
    if (size && !isSizeOk) return false;

    const type = headers['content-type'];
    const isTypeOk =
      type?.includes('xml') || type?.includes('dash') || type?.includes('octet-stream');
    if (!isTypeOk) return false;

    return true;
  };

  const filterData = (url: string, text: string) => {
    const isManifest = text.trimStart().startsWith('<');
    return isManifest;
  };

  const postMessage = (url: string, headers: Record<string, string>, text: string) => {
    const message = {
      namespace: 'okova:network',
      method: 'response',
      params: { url, text, headers },
      id: Date.now(),
    };
    window.postMessage(message, '*');
  };

  const inspectFetchResponse = async (response: Response) => {
    const url = response.url;
    const headers = Object.fromEntries(response.headers.entries());
    if (!filterHead(url, headers)) return;

    const reader = response.clone().body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    let sizeBytes = 0;
    let text = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sizeBytes += value.byteLength;
        if (sizeBytes >= MAX_SIZE) {
          // A tee's cancellation can wait for the page to consume its branch.
          void reader.cancel().catch(() => {});
          return;
        }
        text += decoder.decode(value, { stream: true });
      }
      text += decoder.decode();
    } finally {
      reader.releaseLock();
    }
    if (filterData(url, text)) postMessage(url, headers, text);
  };

  const patchFetch = () => {
    if (typeof fetch === 'function') {
      const originalFetch = fetch;
      const cachedFetch = async function fetch(resource: URL | RequestInfo, options?: RequestInit) {
        const response = await originalFetch(resource, options);
        void inspectFetchResponse(response).catch((error) => {
          console.warn('[okova] Fetch response inspection failed', error);
        });
        return response;
      };
      Object.assign(cachedFetch, originalFetch);
      try {
        // @ts-ignore
        fetch = cachedFetch;
      } catch (error1) {
        try {
          globalThis.fetch = cachedFetch;
        } catch (error2) {
          console.warn('Okova was unable to patch the fetch() function in this environment. ');
        }
      }
    }
  };

  const patchXmlHttpRequest = () => {
    class PatchedXHR extends XMLHttpRequest {
      constructor() {
        super();
        this.addEventListener('load', () => {
          void this.#handleResponse().catch((error) => {
            console.warn('[okova] XHR response inspection failed', error);
          });
        });
      }

      async #handleResponse() {
        const url = this.responseURL;
        const headersString = this.getAllResponseHeaders();
        const headersArray = headersString.trim().split(/[\r\n]+/);
        const headers: Record<string, string> = {};
        for (const line of headersArray) {
          const parts = line.split(': ');
          const header = parts.shift();
          if (!header) continue;
          const value = parts.join(': ');
          headers[header.toLowerCase()] = value;
        }
        if (!filterHead(url, headers)) return;

        const response: unknown = this.response;
        let text: string;
        switch (this.responseType) {
          case '':
          case 'text':
            text = this.responseText;
            break;
          case 'arraybuffer':
            if (!(response instanceof ArrayBuffer) || response.byteLength >= MAX_SIZE) return;
            // A timer task lets all page load handlers finish before decoding.
            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            text = new TextDecoder().decode(response);
            break;
          case 'blob':
            if (!(response instanceof Blob) || response.size >= MAX_SIZE) return;
            text = await response.text();
            break;
          case 'document':
            if (!this.responseXML) return;
            text = new XMLSerializer().serializeToString(this.responseXML);
            break;
          default:
            return;
        }
        // Reject long strings before allocating a UTF-8 copy for the byte check.
        if (text.length >= MAX_SIZE || new TextEncoder().encode(text).byteLength >= MAX_SIZE)
          return;
        if (filterData(url, text)) postMessage(url, headers, text);
      }
    }
    window.XMLHttpRequest = PatchedXHR;
  };

  patchFetch();
  patchXmlHttpRequest();

  console.log('[okova] Response interception added');
});
