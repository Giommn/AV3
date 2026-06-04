import { z } from 'zod';
import { StatusEtapa } from '@prisma/client';

export const createEtapaSchema = z.object({
  nome: z.string({ required_error: 'Nome é obrigatório.' }).min(1).max(100).trim(),
  prazo: z.coerce.date({ required_error: 'Prazo é obrigatório.' }),
  ordem: z.number({ required_error: 'Ordem é obrigatória.' }).int().positive(),
  aeronaveId: z.number({ required_error: 'aeronaveId é obrigatório.' }).int().positive(),
});

export const updateEtapaSchema = createEtapaSchema.partial();

export const associarFuncionarioSchema = z.object({
  funcionarioId: z.number({ required_error: 'funcionarioId é obrigatório.' }).int().positive(),
});

export type CreateEtapaDto = z.infer<typeof createEtapaSchema>;
export type UpdateEtapaDto = z.infer<typeof updateEtapaSchema>;
export type AssociarFuncionarioDto = z.infer<typeof associarFuncionarioSchema>;
