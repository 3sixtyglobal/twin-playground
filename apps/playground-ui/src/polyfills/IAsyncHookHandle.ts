// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Minimal async hook handle exposing enable/disable operations.
 */
export interface IAsyncHookHandle {
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
