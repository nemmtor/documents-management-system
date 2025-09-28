import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateDocumentContentParamsDTOSchema = z.object({
  documentId: z.uuid(),
});

export class UpdateDocumentContentParamsDTO extends createZodDto(
  UpdateDocumentContentParamsDTOSchema,
) {}
