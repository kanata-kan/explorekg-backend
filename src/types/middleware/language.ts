// Language detection middleware

import { Request, Response, NextFunction } from "express";

export function languageMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const q =
    (req.query.lang as string) ||
    req.headers["accept-language"]?.toString().split(",")[0];
  req["lang"] = q || process.env.DEFAULT_LANG || "en";
  next();
}
