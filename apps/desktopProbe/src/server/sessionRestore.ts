import fs from 'fs';

type SessionAuth = {
  setSession(session: Record<string, unknown>): Promise<{ error: unknown | null }>;
};

type ProtectedStorage = {
  decryptString(value: Buffer): string;
};

type SessionLogger = {
  info(message: string): void;
  error(message: string): void;
};

export async function restoreStoredSession({
  enabled,
  sessionPath,
  protectedStorage,
  auth,
  logger,
}: {
  enabled: boolean;
  sessionPath: string;
  protectedStorage: ProtectedStorage;
  auth: SessionAuth;
  logger: SessionLogger;
}) {
  if (!fs.existsSync(sessionPath)) {
    logger.info('no session found on disk');
    return false;
  }

  if (!enabled) {
    logger.info('remote authentication is disabled; skipping stored session restore');
    return false;
  }

  try {
    const encryptedSession = fs.readFileSync(sessionPath, 'utf-8');
    const plaintextSession = protectedStorage.decryptString(Buffer.from(encryptedSession, 'base64'));
    const session = JSON.parse(plaintextSession) as Record<string, unknown>;
    const { error } = await auth.setSession(session);
    if (error) throw error;
    logger.info('finished loading session from disk');
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`stored remote session could not be restored; continuing with local CareerOS: ${message}`);
    return false;
  }
}
