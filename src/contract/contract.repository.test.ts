import { Test, TestingModule } from '@nestjs/testing';
import { ContractAggregate } from './contract.aggregate';
import { ContractDb } from './contract.db';
import { ContractRepository } from './contract.repository';
import { ContractNotFoundError } from './errors/contract-not-found.error';

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
    it('should return ContractAggregate when contract is found', async () => {
      const mockDbContract = {
        id: '1',
        content: 'existing content',
        createdAt: '2023-05-01T10:30:00Z',
        updatedAt: '2023-05-02T15:45:00Z',
        isSigned: false,
        attachments: [],
      };
      jest.spyOn(db, 'find').mockResolvedValueOnce(mockDbContract);

      const result = await repository.getById(mockDbContract.id);
      const contractAggregate = result._unsafeUnwrap();

      expect(contractAggregate).toBeInstanceOf(ContractAggregate);
      expect(contractAggregate.id).toBe(mockDbContract.id);
    });

    it('should correctly map to entity', async () => {
      const mockDbContract = {
        id: '1',
        content: 'existing content',
        createdAt: '2023-05-01T10:30:00.000Z',
        updatedAt: '2023-05-02T15:45:00.000Z',
        isSigned: false,
        attachments: [],
      };
      jest.spyOn(db, 'find').mockResolvedValueOnce(mockDbContract);

      const result = await repository.getById(mockDbContract.id);
      const contractAggregate = result._unsafeUnwrap();

      expect(contractAggregate).toBeInstanceOf(ContractAggregate);
      expect(contractAggregate.id).toBe(mockDbContract.id);
      expect(contractAggregate.createdAt).toBeInstanceOf(Date);
      expect(contractAggregate.createdAt.toISOString()).toBe(
        mockDbContract.createdAt,
      );
      expect(contractAggregate.isSigned).toBe(false);
      expect(contractAggregate.attachments).toEqual(mockDbContract.attachments);
    });

    it('should query db with correct id', async () => {
      const mockDbContract = {
        id: '1',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
        isSigned: false,
        attachments: [],
      };
      const findSpy = jest
        .spyOn(db, 'find')
        .mockResolvedValueOnce(mockDbContract);

      await repository.getById(mockDbContract.id);

      expect(findSpy).toHaveBeenCalledTimes(1);
      expect(findSpy).toHaveBeenCalledWith(mockDbContract.id);
    });

    it('should fail with ContractNotFoundError when contract not found', async () => {
      jest.spyOn(db, 'find').mockResolvedValueOnce(undefined);

      const result = await repository.getById('1');

      expect(result._unsafeUnwrapErr()).toEqual(
        expect.objectContaining({
          constructor: ContractNotFoundError,
        }),
      );
    });
  });

  describe('findAllUnsignedIds', () => {
    it('should return only unsigned contracts', async () => {
      const mockDbContracts = [
        {
          id: '1',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-02T00:00:00Z',
          isSigned: false,
          attachments: [],
        },
        {
          id: '2',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-02T00:00:00Z',
          isSigned: true,
          attachments: [],
        },
      ];
      jest.spyOn(db, 'getAll').mockResolvedValueOnce(mockDbContracts);

      const result = await repository.findAllUnsignedIds();

      expect(result[0].id).toBe('1');
      expect(result).toHaveLength(1);
    });

    it('should return empty list if there are no contracts', async () => {
      jest.spyOn(db, 'getAll').mockResolvedValueOnce([]);

      const result = await repository.findAllUnsignedIds();

      expect(result).toEqual([]);
    });
  });

  describe('persist', () => {
    it('should persist correct data in db', async () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        isSigned: false,
        attachments: [],
      });
      const insertOrUpdateSpy = jest
        .spyOn(db, 'insertOrUpdate')
        .mockResolvedValueOnce(undefined);

      await repository.persist(contractAggregate);

      expect(insertOrUpdateSpy).toHaveBeenCalledTimes(1);
      expect(insertOrUpdateSpy).toHaveBeenCalledWith({
        id: contractAggregate.id,
        createdAt: contractAggregate.createdAt.toISOString(),
        updatedAt: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        ),
        isSigned: contractAggregate.isSigned,
        attachments: contractAggregate.attachments,
      });
    });

    it('should bump updatedAt before persisting', async () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        isSigned: false,
        attachments: [],
      });
      const insertOrUpdateSpy = jest
        .spyOn(db, 'insertOrUpdate')
        .mockResolvedValueOnce(undefined);
      const beforePersist = new Date();

      await repository.persist(contractAggregate);

      const afterPersist = new Date();
      const calledWith = insertOrUpdateSpy.mock.calls[0][0];
      const updatedAtDate = new Date(calledWith.updatedAt);

      expect(updatedAtDate.getTime()).toBeGreaterThanOrEqual(
        beforePersist.getTime(),
      );
      expect(updatedAtDate.getTime()).toBeLessThanOrEqual(
        afterPersist.getTime(),
      );
    });
  });
});
