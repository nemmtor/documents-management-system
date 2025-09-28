import { AggregateRoot } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';
import { Attachment } from './attachment.vo';
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
      return ok();
    }

    if (this._attachments.some((a) => a.isSeen === false)) {
      return err(new CannotSignContractWithUnseenAttachmentsError(this.id));
    }

    this._isSigned = true;
    this.apply(new ContractSignedEvent({ contractId: this.id }));

    return ok();
  }

  seeAttachment(attachmentId: string) {
    const attachment = this._attachments.find((a) => a.id === attachmentId);
    if (attachment?.isSeen) {
      return ok();
    }
    if (!attachment) {
      return err(
        new AttachmentNotFoundError({ attachmentId, contractId: this.id }),
      );
    }
    attachment.see();

    if (this._attachments.every((a) => a.isSeen)) {
      this.apply(new ContractBecameSignableEvent({ contractId: this.id }));
    }

    return ok();
  }

  unseeAttachment(attachmentId: string) {
    if (this._isSigned) {
      return err(new CannotUnseeAttachmentOfSignedContract(this.id));
    }

    const attachment = this._attachments.find((a) => a.id === attachmentId);
    if (!attachment) {
      return err(
        new AttachmentNotFoundError({ attachmentId, contractId: this.id }),
      );
    }
    if (!attachment.isSeen) {
      return ok();
    }
    attachment.unsee();

    this.apply(new ContractBecameUnsignableEvent({ contractId: this.id }));
    return ok();
  }
}
