// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property, SortDirection } from "@twin.org/entity";

/**
 * Interface representing an immutable proof.
 */
@entity()
export class UserImmutableProofEntry {
	/**
	 * The id for the proof.
	 */
	@property({ type: "string", isPrimary: true })
	public id!: string;

	/**
	 * The date it was created.
	 */
	@property({
		type: "string",
		format: "date-time",
		sortDirection: SortDirection.Descending,
		optional: true
	})
	public date?: string;

	/**
	 * The user identity who created it.
	 */
	@property({ type: "string", isSecondary: true, optional: true })
	public userIdentity?: string;
}
