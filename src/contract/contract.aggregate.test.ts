import { ContractAggregate } from './contract.aggregate';
import { AttachmentNotFoundError } from './errors/attachment-not-found.error';
import { CannotSignContractWithUnseenAttachmentsError } from './errors/cannot-sign-contract-with-unseen-attachments.error';
import { CannotUnseeAttachmentOfSignedContract } from './errors/cannot-unsee-attachment-of-signed-contract.error';
import { ContractBecameSignableEvent } from './events/contract-became-signable.event';
import { ContractBecameUnsignableEvent } from './events/contract-became-unsignable.event';
import { ContractSignedEvent } from './events/contract-signed.event';

describe('ContractAggregate', () => {
  describe('signing', () => {
    it('should mark contract as signed', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [],
      });

      contractAggregate.sign();

      expect(contractAggregate.isSigned).toBe(true);
    });

    it('should be successfull', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [],
      });

      const result = contractAggregate.sign();

      expect(result.isOk()).toBe(true);
    });

    it('should be successfull if contract is already signed', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: true,
        attachments: [],
      });

      const result = contractAggregate.sign();

      expect(result.isOk()).toBe(true);
    });

    it('should apply ContractSignedEvent event on success', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [],
      });
      const applySpy = jest.spyOn(contractAggregate, 'apply');

      contractAggregate.sign();

      expect(applySpy).toHaveBeenCalledTimes(1);
      expect(applySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: ContractSignedEvent,
          payload: { contractId: contractAggregate.id },
        }),
      );
    });

    it('should not apply ContractSignedEvent if contract is already signed', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: true,
        attachments: [],
      });
      const applySpy = jest.spyOn(contractAggregate, 'apply');

      contractAggregate.sign();

      expect(applySpy).not.toHaveBeenCalled();
    });

    it('should not apply ContractSignedEvent if there are unseen attachments', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '1', isSeen: false }],
      });
      const applySpy = jest.spyOn(contractAggregate, 'apply');

      contractAggregate.sign();

      expect(applySpy).not.toHaveBeenCalled();
    });

    it('should fail with CannotSignContractWithUnseenAttachmentsError if there are unseen attachments', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '1', isSeen: false }],
      });

      const result = contractAggregate.sign();

      expect(result._unsafeUnwrapErr()).toEqual(
        expect.objectContaining({
          constructor: CannotSignContractWithUnseenAttachmentsError,
        }),
      );
    });
  });

  describe('seeing attachment', () => {
    it('should mark attachment as seen', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '1', isSeen: false }],
      });

      contractAggregate.seeAttachment('1');

      expect(contractAggregate.attachments[0].isSeen).toBe(true);
    });

    it('should be successfull', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '1', isSeen: false }],
      });

      const result = contractAggregate.seeAttachment('1');

      expect(result.isOk()).toBe(true);
    });

    it('should be successfull if attachment is already seen', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '1', isSeen: true }],
      });

      const result = contractAggregate.seeAttachment('1');

      expect(result.isOk()).toBe(true);
    });

    it('should apply ContractBecameSignableEvent on success', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '1', isSeen: false }],
      });
      const applySpy = jest.spyOn(contractAggregate, 'apply');

      contractAggregate.seeAttachment('1');

      expect(applySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: ContractBecameSignableEvent,
          payload: {
            contractId: contractAggregate.id,
          },
        }),
      );
    });

    it('should not mark attachment as seen if attachment was not found', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '1', isSeen: false }],
      });

      contractAggregate.seeAttachment('2');

      expect(contractAggregate.attachments[0].isSeen).toBe(false);
    });

    it('should not apply ContractBecameSignableEvent if attachment was not found', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '1', isSeen: false }],
      });
      const applySpy = jest.spyOn(contractAggregate, 'apply');

      contractAggregate.seeAttachment('2');

      expect(applySpy).not.toHaveBeenCalled();
    });

    it('should not apply ContractBecameSignableEvent if attachment is already seen', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '1', isSeen: true }],
      });
      const applySpy = jest.spyOn(contractAggregate, 'apply');

      contractAggregate.seeAttachment('1');

      expect(applySpy).not.toHaveBeenCalled();
    });

    it('should not apply ContractBecameSignableEvent if there is another unseen attachment', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [
          { id: '1', isSeen: false },
          { id: '2', isSeen: false },
        ],
      });
      const applySpy = jest.spyOn(contractAggregate, 'apply');

      contractAggregate.seeAttachment('1');

      expect(applySpy).not.toHaveBeenCalled();
    });

    it('should fail with AttachmentNotFoundError if attachment was not found', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '1', isSeen: false }],
      });

      const result = contractAggregate.seeAttachment('2');
      const error = result._unsafeUnwrapErr();

      expect(error).toEqual(
        expect.objectContaining({
          constructor: AttachmentNotFoundError,
        }),
      );
      expect(error.attachmentId).toBe('2');
      expect(error.contractId).toBe('1');
    });
  });

  describe('unseeing attachment', () => {
    it('should mark attachment as unseen', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '1', isSeen: true }],
      });

      contractAggregate.unseeAttachment('1');

      expect(contractAggregate.attachments[0].isSeen).toBe(false);
    });

    it('should be successfull', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '1', isSeen: true }],
      });

      const result = contractAggregate.unseeAttachment('1');

      expect(result.isOk()).toBe(true);
    });

    it('should be successfull if attachment is already unseen', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '1', isSeen: false }],
      });

      const result = contractAggregate.unseeAttachment('1');

      expect(result.isOk()).toBe(true);
    });

    it('should apply ContractBecameUnsignableEvent on success', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '1', isSeen: true }],
      });
      const applySpy = jest.spyOn(contractAggregate, 'apply');

      contractAggregate.unseeAttachment('1');

      expect(applySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: ContractBecameUnsignableEvent,
          payload: { contractId: '1' },
        }),
      );
    });

    it('should not unsee attachment if contract is signed', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: true,
        attachments: [{ id: '1', isSeen: true }],
      });

      contractAggregate.unseeAttachment('1');

      expect(contractAggregate.attachments[0].isSeen).toBe(true);
    });

    it('should not apply ContractBecameUnsignableEvent if attachment is already unseen', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [
          { id: '1', isSeen: false },
          { id: '2', isSeen: true },
        ],
      });
      const applySpy = jest.spyOn(contractAggregate, 'apply');

      contractAggregate.unseeAttachment('1');

      expect(applySpy).not.toHaveBeenCalled();
    });

    it('should not apply ContractBecameUnsignableEvent if attachment was not found', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '2', isSeen: true }],
      });
      const applySpy = jest.spyOn(contractAggregate, 'apply');

      contractAggregate.unseeAttachment('1');

      expect(applySpy).not.toHaveBeenCalled();
    });

    it('should not apply ContractBecameUnsignableEvent if contract was already signed', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: true,
        attachments: [{ id: '1', isSeen: true }],
      });
      const applySpy = jest.spyOn(contractAggregate, 'apply');

      contractAggregate.unseeAttachment('1');

      expect(applySpy).not.toHaveBeenCalled();
    });

    it('should fail with CannotUnseeAttachmentOfSignedContract if contract is signed', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: true,
        attachments: [{ id: '1', isSeen: true }],
      });

      const result = contractAggregate.unseeAttachment('1');

      expect(result._unsafeUnwrapErr()).toEqual(
        expect.objectContaining({
          constructor: CannotUnseeAttachmentOfSignedContract,
        }),
      );
    });

    it('should fail with AttachmentNotFoundError if attachment was not found', () => {
      const contractAggregate = new ContractAggregate({
        id: '1',
        createdAt: new Date(),
        isSigned: false,
        attachments: [{ id: '1', isSeen: true }],
      });

      const result = contractAggregate.unseeAttachment('2');
      const error = result._unsafeUnwrapErr();

      expect(error).toEqual(
        expect.objectContaining({
          constructor: AttachmentNotFoundError,
        }),
      );
      expect(
        error instanceof AttachmentNotFoundError && error.attachmentId,
      ).toBe('2');
      expect(error.contractId).toBe('1');
    });
  });
});
