export type ContractModel = {
  id: string;
  createdAt: string;
  updatedAt: string;
  isSigned: boolean;
  attachments: Array<{ id: string; isSeen: boolean }>;
};
