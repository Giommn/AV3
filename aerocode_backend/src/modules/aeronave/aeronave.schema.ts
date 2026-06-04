import { z } from 'zod';
import { TipoAeronave } from '@prisma/client';

export const createAeronaveSchema = z.object({
  codigo: z
    .string({ required_error: 'Código é obrigatório.' })
    .min(1)
    .max(50)
    .trim(),
  modelo: z
    .string({ required_error: 'Modelo é obrigatório.' })
    .min(1)
    .max(100)
    .trim(),
  tipo: z.nativeEnum(TipoAeronave, {
    errorMap: () => ({ message: `Tipo deve ser COMERCIAL ou MILITAR.` }),
  }),
  capacidade: z
    .number({ required_error: 'Capacidade é obrigatória.' })
    .int()
    .positive('Capacidade deve ser um número inteiro positivo.'),
  alcance: z
    .number({ required_error: 'Alcance é obrigatório.' })
    .positive('Alcance deve ser um número positivo.'),
});

export const updateAeronaveSchema = createAeronaveSchema.partial();

export type CreateAeronaveDto = z.infer<typeof createAeronaveSchema>;
export type UpdateAeronaveDto = z.infer<typeof updateAeronaveSchema>;
