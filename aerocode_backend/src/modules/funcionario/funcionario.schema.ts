import { z } from 'zod';
import { NivelPermissao } from '@prisma/client';

export const createFuncionarioSchema = z.object({
  nome: z.string({ required_error: 'Nome é obrigatório.' }).min(1).max(100).trim(),
  telefone: z.string({ required_error: 'Telefone é obrigatório.' }).min(1).max(20).trim(),
  endereco: z.string({ required_error: 'Endereço é obrigatório.' }).min(1).max(255).trim(),
  usuario: z
    .string({ required_error: 'Usuário é obrigatório.' })
    .min(3, 'Usuário deve ter no mínimo 3 caracteres.')
    .max(50)
    .trim()
    .toLowerCase(),
  senha: z
    .string({ required_error: 'Senha é obrigatória.' })
    .min(6, 'Senha deve ter no mínimo 6 caracteres.'),
  nivelPermissao: z
    .nativeEnum(NivelPermissao, {
      errorMap: () => ({ message: 'Nível deve ser ADMINISTRADOR, ENGENHEIRO ou OPERADOR.' }),
    })
    .optional()
    .default(NivelPermissao.OPERADOR),
});

export const updateFuncionarioSchema = z.object({
  nome: z.string().min(1).max(100).trim().optional(),
  telefone: z.string().min(1).max(20).trim().optional(),
  endereco: z.string().min(1).max(255).trim().optional(),
  nivelPermissao: z.nativeEnum(NivelPermissao).optional(),
  ativo: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  senhaAtual: z.string({ required_error: 'Senha atual é obrigatória.' }),
  novaSenha: z.string({ required_error: 'Nova senha é obrigatória.' }).min(6),
});

export const loginSchema = z.object({
  usuario: z.string({ required_error: 'Usuário é obrigatório.' }).trim().toLowerCase(),
  senha: z.string({ required_error: 'Senha é obrigatória.' }),
});

export type CreateFuncionarioDto = z.infer<typeof createFuncionarioSchema>;
export type UpdateFuncionarioDto = z.infer<typeof updateFuncionarioSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
