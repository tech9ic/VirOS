import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Cache for deduplication of in-flight requests
const requestCache = new Map<string, Promise<any>>();

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Enhanced API request with request deduplication and security headers
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Add security headers
  const headers: HeadersInit = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer-when-downgrade',
  };
  
  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    cache: method === 'GET' ? 'default' : 'no-store',
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    // Request deduplication using cache for concurrent requests to the same URL
    const cacheKey = `get:${url}`;
    
    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey);
    }
    
    const request = fetch(url, {
      credentials: "include",
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer-when-downgrade',
      },
    })
    .then(async (res) => {
      // Remove from cache once complete
      requestCache.delete(cacheKey);
      
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    })
    .catch((error) => {
      requestCache.delete(cacheKey);
      throw error;
    });
    
    requestCache.set(cacheKey, request);
    return request;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      // Set reasonable staleTime to reduce unnecessary requests
      staleTime: 20000, // 20 seconds
      retry: false,
      // Enable lightweight caching
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: false,
    },
  },
});
