#!/usr/bin/env node
import { pbkdf2, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

// AI_ACCOUNT_PASSWORD is the sole password input; never use argv or defaults.
const password = process.env.AI_ACCOUNT_PASSWORD;
delete process.env.AI_ACCOUNT_PASSWORD;
if (process.argv.length !== 2 || typeof password !== 'string' ||
    password.length < 12 || Buffer.byteLength(password, 'utf8') > 1024) {
  process.stderr.write('Set AI_ACCOUNT_PASSWORD to a password of at least 12 characters (maximum 1024 UTF-8 bytes); no CLI arguments are accepted.\n');
  process.exitCode = 1;
} else {
  const salt = randomBytes(32);
  const bytes = Buffer.from(password, 'utf8');
  try {
    const hash = await promisify(pbkdf2)(bytes, salt, 600000, 32, 'sha256');
    process.stdout.write(JSON.stringify({
      passwordSalt: salt.toString('hex'),
      passwordHash: hash.toString('hex'),
    }) + '\n');
    hash.fill(0);
  } catch {
    process.stderr.write('Password hashing failed.\n');
    process.exitCode = 1;
  } finally {
    bytes.fill(0);
    salt.fill(0);
  }
}
