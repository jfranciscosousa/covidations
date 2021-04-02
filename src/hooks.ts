import type { Handle } from "@sveltejs/kit";

/**
 * Replace all max-age cache controls with s-maxage
 */

const handle: Handle = async (request, render) => {
	const response = await render(request);
	const cacheControlHeader = response.headers["cache-control"];

	if (cacheControlHeader) {
		response.headers["cache-control"] = cacheControlHeader.replace("max-age", "s-maxage");
	}

	return {
		...response,
		headers: {
			...response.headers
		}
	};
};

export { handle };
