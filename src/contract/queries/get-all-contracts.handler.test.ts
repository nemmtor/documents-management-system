import { Test, TestingModule } from '@nestjs/testing';
import { ContractDb } from '../contract.db';
import { GetAllContractsQueryHandler } from './get-all-contracts.handler';
import { GetAllContractsQuery } from './get-all-contracts.query';

describe('GetAllContractsQuery', () => {
  let handler: GetAllContractsQueryHandler;
  let db: ContractDb;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllContractsQueryHandler,
        {
          provide: ContractDb,
          useValue: {
            getAll: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetAllContractsQueryHandler>(
      GetAllContractsQueryHandler,
    );
    db = module.get<ContractDb>(ContractDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return AllContractsReadModel', async () => {
    const mockDbContracts = [
      {
        id: '1',
        createdAt: new Date('2023-01-01').toISOString(),
        updatedAt: new Date('2023-01-02').toISOString(),
        isSigned: false,
        attachments: [],
      },
      {
        id: '2',
        createdAt: new Date('2023-01-01').toISOString(),
        updatedAt: new Date('2023-01-02').toISOString(),
        isSigned: false,
        attachments: [],
      },
    ];
    jest.spyOn(db, 'getAll').mockResolvedValueOnce(mockDbContracts);

    const result = await handler.execute(new GetAllContractsQuery());

    expect(result[0]).toEqual({
      id: mockDbContracts[0].id,
      createdAt: mockDbContracts[0].createdAt,
      updatedAt: mockDbContracts[0].updatedAt,
      isSigned: mockDbContracts[0].isSigned,
      attachments: mockDbContracts[0].attachments,
    });
    expect(result).toHaveLength(2);
  });

  it('should return only required fields', async () => {
    const mockDbContracts = [
      {
        id: '1',
        createdAt: new Date('2023-01-01').toISOString(),
        updatedAt: new Date('2023-01-02').toISOString(),
        isSigned: false,
        attachments: [],
        extraField1: 'should not appear',
        extraField2: 42,
        extraField3: { nested: 'object' },
      },
    ];
    jest.spyOn(db, 'getAll').mockResolvedValueOnce(mockDbContracts);

    const result = await handler.execute(new GetAllContractsQuery());

    expect(result[0]).not.toHaveProperty('extraField1');
    expect(result[0]).not.toHaveProperty('extraField2');
    expect(result[0]).not.toHaveProperty('extraField3');
  });

  it('should call db.getAll', async () => {
    const getAllSpy = jest.spyOn(db, 'getAll').mockResolvedValueOnce([]);

    await handler.execute(new GetAllContractsQuery());

    expect(getAllSpy).toHaveBeenCalled();
  });

  it('should return empty list if there are no contracts', async () => {
    jest.spyOn(db, 'getAll').mockResolvedValueOnce([]);

    const result = await handler.execute(new GetAllContractsQuery());

    expect(result).toHaveLength(0);
  });
});
