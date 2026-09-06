// Shared with normal EME interception so adapted sessions are captured only once.
export const playbackSessions = new WeakSet<MediaKeySession>();
