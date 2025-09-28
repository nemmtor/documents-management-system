import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const GetDocumentParamsDTOSchema = z.object({
  documentId: z.uuid(),
});

export class GetDocumentParamsDTO extends createZodDto(
  GetDocumentParamsDTOSchema,
) {}
