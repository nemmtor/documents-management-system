import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateDocumentContentRequestDTOSchema = z.object({
  content: z.string(),
});

export class UpdateDocumentContentRequestDTO extends createZodDto(
  UpdateDocumentContentRequestDTOSchema,
) {}

export type UpdateDocumentContentRequestDTOShape = z.infer<
  typeof UpdateDocumentContentRequestDTOSchema
>;
