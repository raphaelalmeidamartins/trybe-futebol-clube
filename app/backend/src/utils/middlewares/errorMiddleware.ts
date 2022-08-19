import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomGenericError from '../errors/CustomGenericError';

function errorMiddleware(
  err: CustomGenericError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const { statusCode, message } = err;

  if (statusCode) {
    res.status(statusCode).json({ message });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
  }
}

export default errorMiddleware;
