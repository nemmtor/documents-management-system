import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateContractResponseDTOSchema = z.object({
  contractId: z.uuid(),
});

export class CreateContractResponseDTO extends createZodDto(
  CreateContractResponseDTOSchema,
) {}
