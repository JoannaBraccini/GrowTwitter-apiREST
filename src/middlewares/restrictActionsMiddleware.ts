import { NextFunction, Request, Response } from "express";

export function restrictActionsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const test = process.env.NODE_ENV === "test";
  if (test) {
    if (req.method !== "GET" && !req.path.includes("/login")) {
      res.status(403).json({
        ok: false,
        code: 403,
        message: "Ações sensíveis estão desabilitadas no ambiente de teste.",
      });
      return;
    }
  }
  next();
}
