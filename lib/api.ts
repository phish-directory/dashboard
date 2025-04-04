type ApiOptions = {
  method?: string;
  body?: any;
  requiresAuth?: boolean;
};

// API base URL selection based on environment
let API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.phish.directory"
    : "http://localhost:3000";

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body, requiresAuth = true } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requiresAuth) {
    // Get token from localStorage (client-side only)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("phishDirectoryToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
    // Add credentials for cross-origin requests in local development
    credentials: "include",
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // Use the API_BASE_URL which is now environment-aware
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "API request failed");
  }

  return response.json();
}
