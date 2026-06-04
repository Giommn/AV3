import { z } from 'zod';
import { TipoPeca, StatusPeca } from '@prisma/client';

export const createPecaSchema = z.object({
  nome: z.string({ required_error: 'Nome é obrigatório.' }).min(1).max(100).trim(),
  tipo: z.nativeEnum(TipoPeca, {
    errorMap: () => ({ message: 'Tipo deve ser NACIONAL ou IMPORTADA.' }),
  }),
  fornecedor: z.string({ required_error: 'Fornecedor é obrigatório.' }).min(1).max(100).trim(),
  status: z
    .nativeEnum(StatusPeca, {
      errorMap: () => ({ message: 'Status deve ser EM_PRODUCAO, EM_TRANSPORTE ou PRONTA.' }),
    })
    .optional()
    .default(StatusPeca.EM_PRODUCAO),
  aeronaveId: z.number({ required_error: 'aeronaveId é obrigatório.' }).int().positive(),
});

export const updateStatusPecaSchema = z.object({
  status: z.nativeEnum(StatusPeca, {
    errorMap: () => ({ message: 'Status deve ser EM_PRODUCAO, EM_TRANSPORTE ou PRONTA.' }),
  }),
});

export const updatePecaSchema = createPecaSchema.partial();

export type CreatePecaDto = z.infer<typeof createPecaSchema>;
export type UpdatePecaDto = z.infer<typeof updatePecaSchema>;
export type UpdateStatusPecaDto = z.infer<typeof updateStatusPecaSchema>;
