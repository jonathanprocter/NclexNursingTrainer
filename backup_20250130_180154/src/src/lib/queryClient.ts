import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        // Get the current host from window location
        const host = window.location.origin;
        const url = `${host}${queryKey[0]}`;

        const res = await fetch(url, {
          credentials: "include",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          if (res.status >= 500) {
            throw new Error(`${res.status}: ${res.statusText}`);
          }

          throw new Error(`${res.status}: ${await res.text()}`);
        }

        return res.json();
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    }
  },
});