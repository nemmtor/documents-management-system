import { Attachment } from './attachment.vo';

describe('Attachment', () => {
  it('holds its id', () => {
    const attachment = new Attachment({ id: '1', isSeen: false });

    expect(attachment.id).toBe('1');
  });

  it('can be created as unseen', () => {
    const attachment = new Attachment({ id: '1', isSeen: false });

    expect(attachment.isSeen).toBe(false);
  });

  it('can be created as seen', () => {
    const attachment = new Attachment({ id: '1', isSeen: true });

    expect(attachment.isSeen).toBe(true);
  });

  it('can be seen', () => {
    const attachment = new Attachment({ id: '1', isSeen: false });

    attachment.see();

    expect(attachment.isSeen).toBe(true);
  });

  it('can be unseen', () => {
    const attachment = new Attachment({ id: '1', isSeen: true });

    attachment.unsee();

    expect(attachment.isSeen).toBe(false);
  });
});
