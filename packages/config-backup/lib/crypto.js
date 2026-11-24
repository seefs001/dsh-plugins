import { createCipheriv, createDecipheriv, randomBytes, scrypt as scryptCallback } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)

export const BUNDLE_FORMAT = 'dsh-config-backup'
export const BUNDLE_VERSION = 1

const KDF_DEFAULTS = { name: 'scrypt', N: 16384, r: 8, p: 1, keyLen: 32 }
const IV_BYTES = 12
const SALT_BYTES = 16

export class BackupError extends Error {
  constructor(code, message, status = 400) {
    super(message)
    this.name = 'BackupError'
    this.code = code
    this.status = status
  }
}

export function isEncryptedEnvelope(value) {
  return Boolean(
    value && typeof value === 'object' && !Array.isArray(value)
    && value.format === BUNDLE_FORMAT
    && value.encrypted === true,
  )
}

export async function encryptBundle(payload, passphrase) {
  if (typeof passphrase !== 'string' || passphrase.length < 4) {
    throw new BackupError('INVALID_PASSPHRASE', 'Passphrase must be at least 4 characters', 400)
  }
  const salt = randomBytes(SALT_BYTES)
  const iv = randomBytes(IV_BYTES)
  const key = await scrypt(passphrase, salt, KDF_DEFAULTS.keyLen, {
    N: KDF_DEFAULTS.N,
    r: KDF_DEFAULTS.r,
    p: KDF_DEFAULTS.p,
  })
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8')
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    format: BUNDLE_FORMAT,
    version: BUNDLE_VERSION,
    encrypted: true,
    exportedAt: payload.exportedAt ?? new Date().toISOString(),
    source: payload.source ?? null,
    kdf: {
      name: KDF_DEFAULTS.name,
      N: KDF_DEFAULTS.N,
      r: KDF_DEFAULTS.r,
      p: KDF_DEFAULTS.p,
      salt: salt.toString('base64'),
    },
    cipher: {
      name: 'aes-256-gcm',
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
    },
    ciphertext: ciphertext.toString('base64'),
  }
}

export async function decryptBundle(envelope, passphrase) {
  if (!isEncryptedEnvelope(envelope)) {
    throw new BackupError('INVALID_BUNDLE', 'Backup file is not an encrypted envelope', 400)
  }
  if (envelope.version !== BUNDLE_VERSION) {
    throw new BackupError('UNSUPPORTED_VERSION', `Unsupported backup version: ${envelope.version}`, 400)
  }
  if (typeof passphrase !== 'string' || passphrase.length === 0) {
    throw new BackupError('PASSPHRASE_REQUIRED', 'Passphrase is required to unlock this encrypted backup', 401)
  }
  const kdf = envelope.kdf
  const cipherInfo = envelope.cipher
  if (
    kdf?.name !== 'scrypt' || typeof kdf.salt !== 'string'
    || cipherInfo?.name !== 'aes-256-gcm' || typeof cipherInfo.iv !== 'string' || typeof cipherInfo.tag !== 'string'
    || typeof envelope.ciphertext !== 'string'
  ) {
    throw new BackupError('INVALID_BUNDLE', 'Encrypted backup metadata is malformed', 400)
  }
  const N = Number(kdf.N)
  const r = Number(kdf.r)
  const p = Number(kdf.p)
  if (!Number.isInteger(N) || N < 1024 || N > 131072 || !Number.isInteger(r) || r < 1 || r > 32 || !Number.isInteger(p) || p < 1 || p > 8) {
    throw new BackupError('INVALID_BUNDLE', 'Encrypted backup KDF parameters are out of range', 400)
  }
  const salt = Buffer.from(kdf.salt, 'base64')
  const iv = Buffer.from(cipherInfo.iv, 'base64')
  const tag = Buffer.from(cipherInfo.tag, 'base64')
  const ciphertext = Buffer.from(envelope.ciphertext, 'base64')
  if (salt.length < 8 || iv.length !== IV_BYTES || tag.length !== 16) {
    throw new BackupError('INVALID_BUNDLE', 'Encrypted backup binary headers are invalid', 400)
  }
  const key = await scrypt(passphrase, salt, KDF_DEFAULTS.keyLen, { N, r, p })
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
    return JSON.parse(plain)
  } catch {
    throw new BackupError('WRONG_PASSPHRASE', 'Incorrect passphrase or corrupted backup file', 401)
  }
}
