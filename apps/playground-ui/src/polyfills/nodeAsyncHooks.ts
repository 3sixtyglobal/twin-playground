// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Shape of async hook callbacks. Provided for compatibility with node:async_hooks.
 */
interface AsyncHookCallbacks {
	/**
	 * Invoked when a new asynchronous resource is initialized.
	 * @param asyncId - Identifier for the asynchronous resource instance.
	 * @param type - The type name of the resource instance.
	 * @param triggerAsyncId - Identifier of the resource that triggered this instance.
	 * @param resource - Optional resource reference.
	 */
	init?(asyncId: number, type: string, triggerAsyncId: number, resource?: object): void;

	/**
	 * Invoked right before the asynchronous resource runs.
	 * @param asyncId - Identifier for the asynchronous resource instance.
	 */
	before?(asyncId: number): void;

	/**
	 * Invoked immediately after the asynchronous resource completes.
	 * @param asyncId - Identifier for the asynchronous resource instance.
	 */
	after?(asyncId: number): void;

	/**
	 * Invoked when the asynchronous resource is destroyed.
	 * @param asyncId - Identifier for the asynchronous resource instance.
	 */
	destroy?(asyncId: number): void;

	/**
	 * Invoked when a promise-based asynchronous resource resolves.
	 * @param asyncId - Identifier for the asynchronous resource instance.
	 */
	promiseResolve?(asyncId: number): void;
}

/**
 * Internal no-op used to satisfy async hook signatures in the browser.
 */
function noop(): void {
	// intentionally empty
}

/**
 * Minimal async hook handle exposing enable/disable operations.
 */
interface AsyncHookHandle {
	/**
	 * Enables the hook (no-op in browsers).
	 * @returns Nothing.
	 */
	enable(): void;

	/**
	 * Disables the hook (no-op in browsers).
	 * @returns Nothing.
	 */
	disable(): void;
}

/**
 * Enables the async hook (no-op in browsers).
 */
function enableHook(): void {
	noop();
}

/**
 * Disables the async hook (no-op in browsers).
 */
function disableHook(): void {
	noop();
}

/**
 * Lightweight AsyncLocalStorage implementation for browser builds.
 */
export class AsyncLocalStorage<T> {
	/**
	 * Holds the active store for the current execution context emulation.
	 */
	private _store: T | undefined;

	/**
	 * Clears any active store value.
	 */
	public disable(): void {
		this._store = undefined;
	}

	/**
	 * Retrieves the active store value.
	 * @returns The active store if set, otherwise undefined.
	 */
	public getStore(): T | undefined {
		return this._store;
	}

	/**
	 * Runs the supplied callback with the provided store value active.
	 * @param store - The store value to expose during callback execution.
	 * @param callback - The callback to execute.
	 * @param args - Optional arguments forwarded to the callback.
	 * @returns The callback result.
	 */
	public run<TResult, TArgs extends unknown[]>(
		store: T,
		callback: (...args: TArgs) => TResult,
		...args: TArgs
	): TResult {
		const previous = this._store;
		this._store = store;
		try {
			return callback(...args);
		} finally {
			this._store = previous;
		}
	}

	/**
	 * Runs the supplied callback temporarily clearing the active store.
	 * @param callback - The callback to execute.
	 * @param args - Optional arguments forwarded to the callback.
	 * @returns The callback result.
	 */
	public exit<TResult, TArgs extends unknown[]>(
		callback: (...args: TArgs) => TResult,
		...args: TArgs
	): TResult {
		const previous = this._store;
		this._store = undefined;
		try {
			return callback(...args);
		} finally {
			this._store = previous;
		}
	}

	/**
	 * Sets the active store without executing a callback.
	 * @param store - The store value to set as active.
	 */
	public enterWith(store: T): void {
		this._store = store;
	}
}

/**
 * Returns a placeholder async id for browser execution.
 * @returns Always returns 0.
 */
export function executionAsyncId(): number {
	return 0;
}

/**
 * Returns a placeholder trigger async id for browser execution.
 * @returns Always returns 0.
 */
export function triggerAsyncId(): number {
	return 0;
}

/**
 * Creates a no-op async hook that satisfies the node:async_hooks contract.
 * @param callbacks Callback definitions to satisfy the interface.
 * @returns A hook implementation exposing enable/disable no-ops.
 */
export function createHook(callbacks: AsyncHookCallbacks): AsyncHookHandle {
	if (callbacks) {
		// Explicitly acknowledge the callbacks argument; no-op for browser builds.
	}
	return {
		enable: enableHook,
		disable: disableHook
	};
}

export default {
	AsyncLocalStorage,
	executionAsyncId,
	triggerAsyncId,
	createHook
};
