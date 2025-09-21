export type ContractModel = {
  id: string;
  createdAt: string;
  updatedAt: string;
  isSigned: boolean;
  attachments: ReadonlyArray<{ id: string; isSeen: boolean }>;
};
