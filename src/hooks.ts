import type { Handle } from "@sveltejs/kit";

/**
 * Replace all max-age cache controls with s-maxage
 */
export const handle: Handle = async ({ request, resolve }) => {
  const response = await resolve(request);

  if (!response) return response;

  const cacheControlHeader = response?.headers?.["cache-control"];

  if (cacheControlHeader) {
    response.headers["cache-control"] = cacheControlHeader.replace("max-age", "s-maxage");
  }

  return {
    ...response
  };
};
