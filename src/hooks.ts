import type { Handle } from "@sveltejs/kit";

/**
 * Replace all max-age cache controls with s-maxage
 */
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  if (!response) return response;

  const cacheControlHeader = response.headers.get("cache-control");

  if (cacheControlHeader) {
    response.headers.set(
      "cache-control",
      (cacheControlHeader as string).replace("max-age", "s-maxage")
    );
  }

  return response;
};
