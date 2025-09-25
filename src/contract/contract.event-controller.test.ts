import { Test, TestingModule } from '@nestjs/testing';
import { ContractEventController } from './contract.event-controller';
import { ContractService } from './contract.service';

describe('ContractEventController', () => {
  let controller: ContractEventController;
  let contractService: ContractService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractEventController],
      providers: [
        {
          provide: ContractService,
          useValue: {
            markDocumentAsUnseen: jest.fn(),
          },
        },
      ],
    }).compile();

    contractService = module.get<ContractService>(ContractService);
    controller = module.get<ContractEventController>(ContractEventController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleDocumentContentUpdated', () => {
    it('should call contractService.markDocumentAsUnseen with correct payload', async () => {
      const documentId = '1';
      const markDocumentAsUnseenSpy = jest.spyOn(
        contractService,
        'markDocumentAsUnseen',
      );

      await controller.handleDocumentContentUpdated({
        payload: { documentId },
      });

      expect(markDocumentAsUnseenSpy).toHaveBeenCalledWith(documentId);
    });
  });
});
