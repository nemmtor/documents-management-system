import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateDocumentRequestDTOSchema = z.object({
  content: z.string(),
});

export class CreateDocumentRequestDTO extends createZodDto(
  CreateDocumentRequestDTOSchema,
) {}

export type CreateDocumentRequestDTOShape = z.infer<
  typeof CreateDocumentRequestDTOSchema
>;
