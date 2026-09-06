export type EmeMethodResolver = (receiver: object, method: PropertyKey) => unknown;
export type EmeInstaller = (playback: boolean) => EmeMethodResolver;

declare global {
  interface Window {
    __okovaEmeInstaller?: EmeInstaller;
    __okovaStartEme?: (
      token: string,
      installer: EmeInstaller | undefined,
      playback: boolean,
    ) => boolean;
  }
}
