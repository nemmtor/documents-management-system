import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const GetContractResponseDTOSchema = z.object({
  id: z.uuid(),
  isSigned: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  attachments: z.array(z.object({ id: z.uuid(), isSeen: z.boolean() })),
});

export class GetContractResponseDTO extends createZodDto(
  GetContractResponseDTOSchema,
) {}
