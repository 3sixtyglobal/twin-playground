// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAsyncHookCallbacks } from "./IAsyncHookCallbacks.js";
import type { IAsyncHookHandle } from "./IAsyncHookHandle.js";
import { createHook, executionAsyncId, triggerAsyncId } from "./nodeAsyncHooksFunctions.js";

export type { IAsyncHookCallbacks, IAsyncHookHandle };

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

export default {
	AsyncLocalStorage,
	executionAsyncId,
	triggerAsyncId,
	createHook
};
