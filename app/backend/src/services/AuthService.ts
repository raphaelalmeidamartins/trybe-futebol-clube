import * as jwt from 'jsonwebtoken';
import UnauthorizedError from '../utils/errors/UnauthorizedError';
import { ITokenPayload } from './utils/types/AuthTypes';

class AuthService {
  constructor(private tokenModule = jwt) {}

  public async generate(id: number): Promise<string> {
    const token = this.tokenModule.sign(
      { id },
      String(process.env.JWT_SECRET),
      {
        expiresIn: '1d',
      },
    );
    return token;
  }

  public async validate(
    authorization: string | undefined,
  ): Promise<ITokenPayload> {
    if (!authorization) throw new UnauthorizedError('Token not found');
    const token = authorization;
    const payload = this.tokenModule.verify(
      token,
      String(process.env.JWT_SECRET),
    );
    return payload as ITokenPayload;
  }
}

export default AuthService;
