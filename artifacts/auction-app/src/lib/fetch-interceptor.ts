const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let url = "";

  if (typeof input === "string") {
    url = input;
  } else if (input instanceof URL) {
    url = input.toString();
  } else if (input instanceof Request) {
    url = input.url;
  }

  if (url.includes("/api/")) {
    const token = localStorage.getItem("auction_token");
    if (token) {
      init = init || {};

      // Properly merge headers — init.headers may be a Headers instance,
      // a plain object, or a string[][]. We must NOT spread a Headers instance
      // directly (it produces {}) — use the Headers constructor instead.
      const merged = new Headers(init.headers as HeadersInit | undefined);
      merged.set("Authorization", `Bearer ${token}`);
      init = { ...init, headers: merged };
    }
  }

  return originalFetch(input, init);
};

export {};
