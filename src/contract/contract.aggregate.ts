import { AggregateRoot } from '@nestjs/cqrs';
import { AttachmentNotFoundError } from './errors/attachment-not-found.error';
import { CannotSignContractWithUnseenAttachmentsError } from './errors/cannot-sign-contract-with-unseen-attachments.error';
import { CannotUnseeAttachmentOfSignedContract } from './errors/cannot-unsee-attachment-of-signed-contract.error';
import { ContractBecameSignableEvent } from './events/contract-became-signable.event';
import { ContractBecameUnsignableEvent } from './events/contract-became-unsignable.event';
import { ContractSignedEvent } from './events/contract-signed.event';

type ContractAggregateEvents =
  | ContractBecameUnsignableEvent
  | ContractBecameSignableEvent
  | ContractSignedEvent;

// TODO: this is value object - should it be a class?
type Attachment = { id: string; isSeen: boolean };

export class ContractAggregate extends AggregateRoot<ContractAggregateEvents> {
  public readonly id: string;
  public readonly createdAt: Date;
  private _isSigned: boolean;
  private _attachments: Attachment[];

  public constructor(payload: {
    id: string;
    createdAt: Date;
    isSigned: boolean;
    attachments: Attachment[];
  }) {
    super();
    this.id = payload.id;
    this.createdAt = payload.createdAt;
    this._attachments = payload.attachments;
    this._isSigned = payload.isSigned;
  }

  get attachments(): readonly Attachment[] {
    return this._attachments;
  }

  get isSigned() {
    return this._isSigned;
  }

  sign() {
    if (this._isSigned) {
      return;
    }

    if (this._attachments.some((a) => a.isSeen === false)) {
      throw new CannotSignContractWithUnseenAttachmentsError({
        contractId: this.id,
      });
    }

    this._isSigned = true;
    this.apply(new ContractSignedEvent({ contractId: this.id }));
  }

  seeAttachment(attachmentId: string) {
    const attachment = this._attachments.find((a) => a.id === attachmentId);
    if (attachment?.isSeen) {
      return;
    }
    if (!attachment) {
      throw new AttachmentNotFoundError({ attachmentId, contractId: this.id });
    }
    attachment.isSeen = true;

    if (this._attachments.every((a) => a.isSeen)) {
      this.apply(new ContractBecameSignableEvent({ contractId: this.id }));
    }
  }

  unseeAttachment(attachmentId: string) {
    if (this._isSigned) {
      throw new CannotUnseeAttachmentOfSignedContract(this.id);
    }

    const attachment = this._attachments.find((a) => a.id === attachmentId);
    if (!attachment) {
      throw new AttachmentNotFoundError({ attachmentId, contractId: this.id });
    }
    if (!attachment.isSeen) {
      return;
    }
    attachment.isSeen = false;

    this.apply(new ContractBecameUnsignableEvent({ contractId: this.id }));
  }

  hasAttachmentWithId(attachmentId: string) {
    return Boolean(this._attachments.find((a) => a.id === attachmentId));
  }
}
