import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

export function validate(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }));
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "Invalid data",
          details: errorMessages,
        });
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  };
}
