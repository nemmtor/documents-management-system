import { Test, TestingModule } from '@nestjs/testing';
import { ContractDb } from '../contract.db';
import { GetContractQueryHandler } from './get-contract.handler';
import { GetContractQuery } from './get-contract.query';

describe('GetContractQuery', () => {
  let handler: GetContractQueryHandler;
  let db: ContractDb;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetContractQueryHandler,
        {
          provide: ContractDb,
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetContractQueryHandler>(GetContractQueryHandler);
    db = module.get<ContractDb>(ContractDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return ContractReadModel', async () => {
    const mockDbContract = {
      id: '1',
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date('2023-01-02').toISOString(),
      isSigned: false,
      attachments: [],
    };
    jest.spyOn(db, 'find').mockResolvedValueOnce(mockDbContract);

    const result = await handler.execute(
      new GetContractQuery({ contractId: mockDbContract.id }),
    );

    expect(result).toEqual({
      id: mockDbContract.id,
      createdAt: mockDbContract.createdAt,
      updatedAt: mockDbContract.updatedAt,
      isSigned: mockDbContract.isSigned,
      attachments: mockDbContract.attachments,
    });
  });

  it('should return only required fields', async () => {
    const mockDbContract = {
      id: '1',
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date('2023-01-02').toISOString(),
      isSigned: false,
      attachments: [],
      extraField1: 'should not appear',
      extraField2: 42,
      extraField3: { nested: 'object' },
    };

    jest.spyOn(db, 'find').mockResolvedValueOnce(mockDbContract);

    const result = await handler.execute(
      new GetContractQuery({ contractId: mockDbContract.id }),
    );

    expect(result).not.toHaveProperty('extraField1');
    expect(result).not.toHaveProperty('extraField2');
    expect(result).not.toHaveProperty('extraField3');
  });

  it('should call db.find with contract id', async () => {
    const contractId = '1';
    const findSpy = jest.spyOn(db, 'find').mockResolvedValueOnce(undefined);

    await handler.execute(new GetContractQuery({ contractId }));

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(contractId);
  });

  it('should return undefined when contract is not found', async () => {
    jest.spyOn(db, 'find').mockResolvedValueOnce(undefined);

    const result = await handler.execute(
      new GetContractQuery({ contractId: '1' }),
    );

    expect(result).toBeUndefined();
  });
});
