import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const SignContractParamsDTOSchema = z.object({
  contractId: z.uuid(),
});

export class SignContractParamsDTO extends createZodDto(
  SignContractParamsDTOSchema,
) {}
