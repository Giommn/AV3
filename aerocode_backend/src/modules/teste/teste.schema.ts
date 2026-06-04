import { z } from 'zod';
import { TipoTeste, ResultadoTeste } from '@prisma/client';

export const createTesteSchema = z.object({
  tipo: z.nativeEnum(TipoTeste, {
    errorMap: () => ({ message: 'Tipo deve ser ELETRICO, HIDRAULICO ou AERODINAMICO.' }),
  }),
  resultado: z.nativeEnum(ResultadoTeste, {
    errorMap: () => ({ message: 'Resultado deve ser APROVADO ou REPROVADO.' }),
  }),
  observacao: z.string().max(1000).trim().optional(),
  aeronaveId: z.number({ required_error: 'aeronaveId é obrigatório.' }).int().positive(),
});

export const updateTesteSchema = createTesteSchema.partial();

export type CreateTesteDto = z.infer<typeof createTesteSchema>;
export type UpdateTesteDto = z.infer<typeof updateTesteSchema>;
