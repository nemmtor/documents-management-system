import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateContractRequestDTOSchema = z.object({
  attachmentIds: z.array(z.uuid()),
});

export class CreateContractRequestDTO extends createZodDto(
  CreateContractRequestDTOSchema,
) {}
