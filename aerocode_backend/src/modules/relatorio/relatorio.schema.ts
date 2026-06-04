import { z } from 'zod';

export const createRelatorioSchema = z.object({
  aeronaveId: z.number({ required_error: 'aeronaveId é obrigatório.' }).int().positive(),
  nomeCliente: z.string({ required_error: 'Nome do cliente é obrigatório.' }).min(1).max(100).trim(),
  dataEntrega: z.coerce.date({ required_error: 'Data de entrega é obrigatória.' }),
});

export type CreateRelatorioDto = z.infer<typeof createRelatorioSchema>;
