export class Attachment {
  readonly id: string;
  private _isSeen: boolean;

  constructor(payload: { id: string; isSeen: boolean }) {
    this.id = payload.id;
    this._isSeen = payload.isSeen;
  }

  see() {
    this._isSeen = true;
  }
  unsee() {
    this._isSeen = false;
  }

  get isSeen() {
    return this._isSeen;
  }
}
