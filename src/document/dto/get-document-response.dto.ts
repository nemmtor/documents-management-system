import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const GetDocumentResponseDTOSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  content: z.string(),
});

export class GetDocumentResponseDTO extends createZodDto(
  GetDocumentResponseDTOSchema,
) {}
