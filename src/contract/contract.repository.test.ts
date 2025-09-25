import { Test, TestingModule } from '@nestjs/testing';
import { ContractDb } from './contract.db';
import { ContractRepository } from './contract.repository';

describe('ContractRepository', () => {
  let repository: ContractRepository;
  let db: ContractDb;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractRepository,
        {
          provide: ContractDb,
          useValue: {
            getAll: jest.fn(),
            find: jest.fn(),
            insertOrUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<ContractRepository>(ContractRepository);
    db = module.get<ContractDb>(ContractDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it.todo('should query db with correct id');

    it.todo('should fail with ContractNotFoundError when contract not found');

    it.todo('should return ContractAggregate when contract is found');

    it.todo('should correctly map to entity');
  });

  describe('findAllUnsignedIds', () => {
    it.todo('should return only unsigned contracts');
    it.todo('should return empty list if there are no contracts');
  });

  describe('persist', () => {
    it.todo('should persist correct data in db');

    it.todo('should bump updatedAt before persisting');
  });
});
