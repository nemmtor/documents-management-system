import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const SeeAttachmentParamsDTOSchema = z.object({
  contractId: z.uuid(),
  attachmentId: z.uuid(),
});

export class SeeAttachmentParamsDTO extends createZodDto(
  SeeAttachmentParamsDTOSchema,
) {}
