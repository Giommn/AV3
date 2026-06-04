import jwt from 'jsonwebtoken';
import { NivelPermissao } from '@prisma/client';

export interface JwtPayload {
  funcionarioId: number;
  usuario: string;
  nivelPermissao: NivelPermissao;
}

export function signToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET não configurado.');

  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']) ?? '8h',
  });
}

export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET não configurado.');

  return jwt.verify(token, secret) as JwtPayload;
}
