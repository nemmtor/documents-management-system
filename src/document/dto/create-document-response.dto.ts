import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateDocumentResponseDTOSchema = z.object({
  documentId: z.uuid(),
});

export class CreateDocumentResponseDTO extends createZodDto(
  CreateDocumentResponseDTOSchema,
) {}
