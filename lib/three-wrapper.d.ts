export * from '../node_modules/@types/three/index.d.ts';

export class Clock {
  autoStart: boolean;
  startTime: number;
  oldTime: number;
  elapsedTime: number;
  running: boolean;
  constructor(autoStart?: boolean);
  start(): void;
  stop(): void;
  getElapsedTime(): number;
  getDelta(): number;
}
