// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property, SortDirection } from "@twin.org/entity";

/**
 * Class represents a user document entry.
 */
@entity()
export class UserDocumentEntry {
	/**
	 * The id is the combination of documentId.
	 */
	@property({ type: "string", isPrimary: true })
	public id!: string;

	/**
	 * The document id.
	 */
	@property({ type: "string", isSecondary: true })
	public documentId!: string;

	/**
	 * The document revision.
	 */
	@property({ type: "number", optional: true })
	public revision?: number;

	/**
	 * The date the document was created.
	 */
	@property({
		type: "string",
		format: "date-time",
		sortDirection: SortDirection.Descending
	})
	public dateCreated!: string;

	/**
	 * The date when the document was last updated.
	 */
	@property({
		type: "string",
		format: "date-time",
		sortDirection: SortDirection.Descending
	})
	public lastUpdated!: string;

	/**
	 * The user identity who created it.
	 */
	@property({ type: "string", isSecondary: true, optional: true })
	public userIdentity?: string;
}
