// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Shape of async hook callbacks. Provided for compatibility with node:async_hooks.
 */
export interface IAsyncHookCallbacks {
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
