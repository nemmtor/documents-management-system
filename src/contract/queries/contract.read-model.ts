// TODO: is it ok that it is reused? Maybe there should be a separate readmodel per query?
export type ContractReadModel = {
  id: string;
  isSigned: boolean;
  createdAt: string;
  updatedAt: string;
  // TODO: can readmodel return content of attachment? If yes how to retrieve it?
  attachments: ReadonlyArray<{ isSeen: boolean; id: string }>;
};
