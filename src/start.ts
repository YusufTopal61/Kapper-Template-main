import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Ruim boven de grootste geldige server-function payload (de instellingen-
// update met alle openingstijden is de zwaarste, ruim onder 5 KB). Weigert
// misvormde of te grote request-bodies vóórdat ze geparsed worden.
const MAX_REQUEST_BODY_BYTES = 100 * 1024;

const bodySizeMiddleware = createMiddleware().server(async ({ next }) => {
  const contentLength = getRequestHeader("content-length");
  if (contentLength && Number(contentLength) > MAX_REQUEST_BODY_BYTES) {
    return new Response("Payload too large", { status: 413 });
  }
  return next();
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [bodySizeMiddleware, errorMiddleware, csrfMiddleware],
}));
