export type SavedSessionRestoreResult = 'not_found' | 'restored' | 'unavailable';

type RestoreSavedSessionOptions<TSession> = {
  sessionPath: string;
  exists: (path: string) => boolean;
  read: (path: string) => string;
  decrypt: (encrypted: string) => string;
  parse: (plaintext: string) => TSession;
  setSession: (session: TSession) => Promise<{ error: Error | null }>;
  stopAutoRefresh: () => void;
  onUnavailable: (error: unknown) => void;
};

/**
 * Restore legacy cloud auth without making it a prerequisite for the local
 * CareerOS shell. The encrypted session stays on disk so a transient outage
 * does not sign the user out.
 */
export async function restoreSavedSession<TSession>({
  sessionPath,
  exists,
  read,
  decrypt,
  parse,
  setSession,
  stopAutoRefresh,
  onUnavailable,
}: RestoreSavedSessionOptions<TSession>): Promise<SavedSessionRestoreResult> {
  if (!exists(sessionPath)) return 'not_found';

  const encryptedSession = read(sessionPath);
  const plaintextSession = decrypt(encryptedSession);
  const session = parse(plaintextSession);

  try {
    const { error } = await setSession(session);
    if (error) throw error;
    return 'restored';
  } catch (error) {
    stopAutoRefresh();
    onUnavailable(error);
    return 'unavailable';
  }
}
