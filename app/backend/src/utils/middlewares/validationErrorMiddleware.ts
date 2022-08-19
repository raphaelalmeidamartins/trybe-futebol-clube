import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as Joi from 'joi';
import CustomGenericError from '../errors/CustomGenericError';

function validationErrorMiddleware(
  err: Joi.ValidationError | CustomGenericError,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const [{ type }] = err.details;
  console.log(type);
  switch (true) {
    case type.includes('required') || type.includes('empty'):
      res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
      break;
    case type.includes('string') || type.includes('number') || type.includes('array'):
      res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .json({ message: err.message });
      break;
    default: next(err); break;
  }
}

export default validationErrorMiddleware;
