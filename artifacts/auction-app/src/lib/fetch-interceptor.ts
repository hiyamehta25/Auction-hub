// Intercept all fetch requests to add the Authorization header if a token exists
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

  // Only intercept our API requests
  if (url.includes("/api/")) {
    const token = localStorage.getItem("auction_token");
    if (token) {
      init = init || {};
      init.headers = {
        ...init.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  return originalFetch(input, init);
};

export {};
