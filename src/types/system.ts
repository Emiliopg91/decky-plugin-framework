import { EventData } from "./eventBus";

import { getMobxObservable } from "./mobxobservable";

export class LoginEventData extends EventData {
  private _username: string;

  public constructor(username: string) {
    super();
    this._username = username;
  }

  public getUsername(): string {
    return this._username;
  }
}

/**
 * Class for Suspend event
 */
export class SuspendEventData extends EventData {
  private _suspend: boolean;

  public constructor(isSuspend: boolean) {
    super();
    this._suspend = isSuspend;
  }

  /**
   * If SteamDeck is suspending
   * @returns If is suspending
   */
  public isSuspend(): boolean {
    return this._suspend;
  }

  /**
   * If SteamDeck is resuming
   * @returns If is resuming
   */
  public isResume(): boolean {
    return !this._suspend;
  }
}

/**
 * Class for network event
 */
export class NetworkEventData extends EventData {
  private _connectedToInet: boolean;

  public constructor(isConnectedToInet: boolean) {
    super();
    this._connectedToInet = isConnectedToInet;
  }

  /**
   * If SteamDeck is connected to inet
   * @returns If is connected to inet
   */
  public isConnectedToInet(): boolean {
    return this._connectedToInet;
  }
}

/*
Credit:
https://github.com/0u73r-h34v3n/SDH-PlayTime/blob/ed25e1bc134b62be4127c8dd4156855b66e86545/src/app/middlewares/sleep.ts#L67
*/

const mobxAdministrationSymbol = Symbol("mobx administration");
const mobxStoredAnnotationsSymbol = Symbol("mobx-stored-annotations");

interface SuspendResumeStoreType {
  m_bResuming: boolean;
  m_bShowResumeUI: boolean;
  m_bSuspending: boolean;
  m_cSuspendBlockers: number;
  m_eSuspendResumeProgress: number;
  m_nSuspendSleepMS: number;

  // BShowSuspendResumeDialogs();
  // BlockSuspendAction();
  // GetSuspendResumeState();
  // Init();
  // InitiateResume();
  // InitiateSleep();
  // NotifyResumeUIDone();

  [mobxAdministrationSymbol]: unknown;
  [mobxStoredAnnotationsSymbol]: unknown;
}

declare global {
  // https://github.com/ricewind012/steam-sharedjscontext-types/blob/master/generated/SuspendResumeStore.ts
  let SuspendResumeStore: SuspendResumeStoreType;
}

export function getSuspendObservable() {
  const suspendingMobXObservable = getMobxObservable(
    SuspendResumeStore,
    "m_bSuspending"
  );
  return suspendingMobXObservable;
}

export function getResumeObservable() {
  const resumingMobXObservable = getMobxObservable(
    SuspendResumeStore,
    "m_bResuming"
  );

  return resumingMobXObservable;
}
