// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Handles cursor-based pagination state and navigation.
 */
export class CursorStackHandler {
	/**
	 * Stack of cursors for pagination navigation.
	 * @internal
	 */
	private readonly _cursorStack: string[];

	/**
	 * Current index in the cursor stack.
	 * @internal
	 */
	private _cursorStackIndex: number;

	/**
	 * Creates a new instance of CursorStackHandler.
	 */
	constructor() {
		this._cursorStack = ["@start"];
		this._cursorStackIndex = 0;
	}

	/**
	 * Gets the current cursor for pagination.
	 * @returns The current cursor if it's not a special marker (@start/@end), undefined otherwise.
	 */
	public getCurrentCursor(): string | undefined {
		return this._cursorStack[this._cursorStackIndex]?.startsWith("@")
			? undefined
			: this._cursorStack[this._cursorStackIndex];
	}

	/**
	 * Updates the cursor stack with a new cursor value.
	 * @param newCursor - The new cursor value to add to the stack.
	 */
	public updateCursor(newCursor?: string): void {
		if (this._cursorStackIndex === this._cursorStack.length - 1) {
			this._cursorStack.push(newCursor ?? "@end");
		}
	}

	/**
	 * Checks if backwards navigation is possible.
	 * @returns True if backwards navigation is possible, false otherwise.
	 */
	public canGoBackwards(): boolean {
		return this._cursorStack[this._cursorStackIndex] !== "@start";
	}

	/**
	 * Checks if forwards navigation is possible.
	 * @returns True if forwards navigation is possible, false otherwise.
	 */
	public canGoForwards(): boolean {
		return this._cursorStack[this._cursorStackIndex + 1] !== "@end";
	}

	/**
	 * Moves the cursor index backwards if possible.
	 */
	public goBackwards(): void {
		if (this.canGoBackwards()) {
			this._cursorStackIndex--;
		}
	}

	/**
	 * Moves the cursor index forwards if possible.
	 */
	public goForwards(): void {
		if (this.canGoForwards()) {
			this._cursorStackIndex++;
		}
	}

	/**
	 * Resets the cursor stack to the initial state.
	 */
	public reset(): void {
		this._cursorStack.length = 1;
		this._cursorStackIndex = 0;
	}
}
