import { JwtPayload } from 'jsonwebtoken';

interface ITokenPayload extends JwtPayload {
  id: number,
}

interface IAuthBody {
  email: string;
  password: string;
}

interface IAuthService {
  generate(id: number): Promise<string>;
  validate(authorization: string | undefined): Promise<ITokenPayload>;
}

export default IAuthService;
export { ITokenPayload, IAuthBody };
