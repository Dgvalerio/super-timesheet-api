import { CryptoHash } from '@/common/interfaces/crypto-hash';

import { hashSync } from 'bcrypt';
import { createDecipheriv, scrypt } from 'crypto';
import { promisify } from 'util';

export const hashPasswordTransform = {
  to(password: string): string {
    return hashSync(password, 8);
  },
  from(hash: string): string {
    return hash;
  },
};

export const decryptPassword = async (hash: CryptoHash): Promise<string> => {
  const key: Buffer = (await promisify(scrypt)(
    `${process.env.AZURE_SECRET}`,
    'salt',
    32
  )) as Buffer;

  const decipher = createDecipheriv(
    'aes-256-ctr',
    key,
    Buffer.from(hash.iv, 'hex')
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString();
};
