// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property, SortDirection } from "@twin.org/entity";

/**
 * Class representing information for verifiable storage.
 */
@entity()
export class UserVerifiableStorageEntry {
	/**
	 * The id for the entry.
	 */
	@property({ type: "string", isPrimary: true })
	public id!: string;

	/**
	 * The description for the entry.
	 */
	@property({ type: "string", optional: true })
	public description?: string;

	/**
	 * The data it was created.
	 */
	@property({ type: "string", optional: true })
	public data?: string;

	/**
	 * The date it was created.
	 */
	@property({
		type: "string",
		format: "date-time",
		sortDirection: SortDirection.Descending,
		optional: true
	})
	public dateCreated?: string;

	/**
	 * The user identity who created it.
	 */
	@property({ type: "string", isSecondary: true, optional: true })
	public userIdentity?: string;
}
