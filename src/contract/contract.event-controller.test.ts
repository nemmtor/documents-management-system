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
            markAttachmentAsUnseen: jest.fn(),
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

  describe('handleAttachmentUpdated', () => {
    it('should call contractService.markAttachmentAsUnseen with correct payload', async () => {
      const documentId = '1';
      const markAttachmentAsUnseenSpy = jest.spyOn(
        contractService,
        'markAttachmentAsUnseen',
      );

      await controller.handleAttachmentUpdated({
        payload: { documentId },
      });

      expect(markAttachmentAsUnseenSpy).toHaveBeenCalledWith(documentId);
    });
  });
});
