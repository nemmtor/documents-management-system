import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const GetContractParamsDTOSchema = z.object({
  contractId: z.uuid(),
});

export class GetContractParamsDTO extends createZodDto(
  GetContractParamsDTOSchema,
) {}
