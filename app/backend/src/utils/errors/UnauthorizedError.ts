import CustomGenericError from './CustomGenericError';

class UnauthorizedError extends CustomGenericError {
  constructor(message: string) {
    super(message, 401, 'UnauthorizedError');
  }
}

export default UnauthorizedError;
