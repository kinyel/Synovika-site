import { atom } from 'nanostores';

/**
 * Shared page state (raleston-web's store). Discrete state lives in
 * nanostores; per-frame values live in `live`, a plain mutable object.
 */
export const $progress = atom(0);
/** True once the page has painted and the hero intro may play. */
export const $introDone = atom(false);
export const $reducedMotion = atom(false);

export interface LiveState {
  /** Scroll delta this frame in px, signed. */
  velocity: number;
  /** Smoothed absolute scroll speed, 0..1. */
  speed: number;
  /** How far the services helix has turned, in cards. */
  turn: number;
}

export const live: LiveState = { velocity: 0, speed: 0, turn: 0 };
