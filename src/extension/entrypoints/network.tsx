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
    const isManifest = text.startsWith('<?xml') || text.startsWith('<MPD');
    return isManifest;
  };

  const postMessage = (url: string, headers: Record<string, string>, text: string) => {
    const message = {
      jsonrpc: '2.0',
      method: 'response',
      params: { url, text, headers },
      id: Date.now(),
    };
    window.postMessage(message, '*');
  };

  const isResponseMessage = (event: MessageEvent) => {
    return event.data && event.data.jsonrpc === '2.0' && event.data.method === 'response';
  };

  const originalWorker = window.Worker;
  // @ts-ignore
  window.Worker = function (scriptUrl: string | URL, options: WorkerOptions) {
    const worker = new originalWorker(scriptUrl, options);
    worker.addEventListener('message', (event) => {
      if (isResponseMessage(event)) {
        const { url, headers, text } = event.data.params;
        postMessage(url, headers, text);
      }
    });
    return worker;
  };

  const inspectFetchResponse = async (response: Response) => {
    const url = response.url;
    const headers = Object.fromEntries(response.headers.entries());
    if (!filterHead(url, headers)) return;

    const text = await response.clone().text();
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
          headers[header] = value;
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
            if (!(response instanceof Blob)) return;
            text = await response.text();
            break;
          case 'document':
            if (!this.responseXML) return;
            text = new XMLSerializer().serializeToString(this.responseXML);
            break;
          default:
            return;
        }
        if (filterData(url, text)) postMessage(url, headers, text);
      }
    }
    window.XMLHttpRequest = PatchedXHR;
  };

  const patchBlobFetch = () => {
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = function (blob) {
      if (
        blob instanceof Blob &&
        (blob.type.includes('javascript') ||
          blob.type.includes('application/x-javascript') ||
          blob.type === 'text/javascript' ||
          blob.type === '')
      ) {
        // Convert blob to text synchronously
        const xhr = new XMLHttpRequest();
        const url = originalCreateObjectURL(blob);
        xhr.overrideMimeType('text/plain; charset=x-user-defined');
        xhr.open('GET', url, false);
        xhr.send();
        const blobDataBuffer = Uint8Array.from(xhr.response as string, (c) => c.charCodeAt(0));
        const sourceCode = new TextDecoder().decode(blobDataBuffer);
        const injectionCode = `
          const originalFetch = fetch;
          fetch = async function(...args) {
            const response = await originalFetch.apply(this, args);

            const inspectResponse = async () => {
              const size = response.headers.get('content-length');
              const MAX_SIZE = 1024 * 1024 * 1; // 1 MB
              const isSizeOk = Number(size) < MAX_SIZE;
              if (size && !isSizeOk) return;

              const type = response.headers.get('content-type');
              const isTypeOk = type?.includes('xml') || type?.includes('dash') || type?.includes('octet-stream');
              if (!isTypeOk) return;

              const clone = response.clone();
              const text = await clone.text();
              const message = {
                jsonrpc: '2.0',
                method: 'response',
                params: {
                  url: response.url,
                  text,
                  headers: Object.fromEntries(response.headers.entries())
                },
                id: Date.now()
              };
              if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
                self.postMessage(message);
              } else {
                window.postMessage(message, '*');
              }
            };
            void inspectResponse().catch(error => {
              console.warn('[okova] Fetch response inspection failed', error);
            });
            return response;
          };
        `;
        const modifiedCode = injectionCode + '\n' + sourceCode;
        const modifiedBlob = new Blob([modifiedCode], { type: blob.type });
        return originalCreateObjectURL.call(URL, modifiedBlob);
      }
      return originalCreateObjectURL.call(URL, blob);
    };
  };

  patchFetch();
  patchXmlHttpRequest();
  patchBlobFetch();

  console.log('[okova] Response interception added');
});
