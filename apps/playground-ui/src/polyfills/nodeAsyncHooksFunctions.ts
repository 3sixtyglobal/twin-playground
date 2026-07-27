// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAsyncHookCallbacks } from "./IAsyncHookCallbacks";
import type { IAsyncHookHandle } from "./IAsyncHookHandle";

/**
 * Internal no-op used to satisfy async hook signatures in the browser.
 */
export function noop(): void {
	// intentionally empty
}

/**
 * Enables the async hook (no-op in browsers).
 */
export function enableHook(): void {
	noop();
}

/**
 * Disables the async hook (no-op in browsers).
 */
export function disableHook(): void {
	noop();
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
export function createHook(callbacks: IAsyncHookCallbacks): IAsyncHookHandle {
	if (callbacks) {
		// Explicitly acknowledge the callbacks argument; no-op for browser builds.
	}
	return {
		enable: enableHook,
		disable: disableHook
	};
}
