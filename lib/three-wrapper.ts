// @ts-nocheck
declare module '../node_modules/three/build/three.module.js' {
  export * from 'three';
}

import * as THREE from '../node_modules/three/build/three.module.js';

class SafeClock {
  autoStart: boolean;
  startTime: number;
  oldTime: number;
  elapsedTime: number;
  running: boolean;

  constructor(autoStart = true) {
    this.autoStart = autoStart;
    this.startTime = 0;
    this.oldTime = 0;
    this.elapsedTime = 0;
    this.running = false;
  }

  start() {
    this.startTime = (typeof performance === 'undefined' ? Date : performance).now();
    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.running = true;
  }

  stop() {
    this.getElapsedTime();
    this.running = false;
    this.autoStart = false;
  }

  getElapsedTime() {
    this.getDelta();
    return this.elapsedTime;
  }

  getDelta() {
    let diff = 0;
    if (this.autoStart && !this.running) {
      this.start();
      return 0;
    }
    if (this.running) {
      const newTime = (typeof performance === 'undefined' ? Date : performance).now();
      diff = (newTime - this.oldTime) / 1000;
      this.oldTime = newTime;
      this.elapsedTime += diff;
    }
    return diff;
  }
}

// Create a namespace object to override default exports correctly
const THREE_MODIFIED = {
  ...THREE,
  Clock: SafeClock,
};

// Re-export everything from original three
export * from '../node_modules/three/build/three.module.js';

// Explicitly override Clock and default exports
export { SafeClock as Clock };
export default THREE_MODIFIED;
