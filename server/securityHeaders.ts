import type { RequestHandler } from "express";

const securityHeaders = new Headers({
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy": "default-src 'self' eniallator.github.io",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
});

export const insertSecurityHeaders: RequestHandler = (_req, res, next) => {
  res.setHeaders(securityHeaders);
  next();
};
