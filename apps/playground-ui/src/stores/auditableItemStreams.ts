// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type {
	IAuditableItemStream,
	IAuditableItemStreamEntry
} from "@twin.org/auditable-item-stream-models";
import { AuditableItemStreamRestClient } from "@twin.org/auditable-item-stream-rest-client";
import { ErrorHelper, Is } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";

let auditableItemStreamClient: AuditableItemStreamRestClient | undefined;

/**
 * Initialise the auditable item streams.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	auditableItemStreamClient = new AuditableItemStreamRestClient({
		endpoint: apiUrl,
		pathPrefix: "ais"
	});
}

/**
 * Create an auditable items stream.
 * @param annotationObject Object for the stream stored as a json ld document.
 * @param immutableInterval The interval for the stream.
 * @returns The id of the auditable item stream or an error if one occurred.
 */
export async function auditableItemStreamCreate(
	annotationObject?: IJsonLdNodeObject,
	immutableInterval?: number
): Promise<
	| {
			error?: string;
			id?: string;
	  }
	| undefined
> {
	if (Is.object(auditableItemStreamClient)) {
		try {
			const id = await auditableItemStreamClient.create(
				{
					annotationObject
				},
				{
					immutableInterval
				}
			);
			return {
				id
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Update an auditable items stream.
 * @param id The id of the stream to update.
 * @param annotationObject Object for the stream stored as a json ld document.
 * @returns The id of the auditable item stream or an error if one occurred.
 */
export async function auditableItemStreamUpdate(
	id: string,
	annotationObject?: IJsonLdNodeObject
): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(auditableItemStreamClient)) {
		try {
			await auditableItemStreamClient.update({ id, annotationObject });
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Get a list of the auditable item streams.
 * @param cursor The cursor to use for pagination.
 * @returns The list of auditable item streams.
 */
export async function auditableItemStreamList(cursor?: string): Promise<
	| {
			error?: string;
			items?: IAuditableItemStream[];
			cursor?: string;
	  }
	| undefined
> {
	if (Is.object(auditableItemStreamClient)) {
		try {
			const result = await auditableItemStreamClient.query(
				undefined,
				undefined,
				undefined,
				undefined,
				cursor
			);
			return {
				items: result.entries.itemListElement,
				cursor: result.cursor
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Remove an auditable item stream.
 * @param id The id of stream to remove.
 * @returns The nothing unless there was an error.
 */
export async function auditableItemStreamRemove(id: string): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(auditableItemStreamClient)) {
		try {
			await auditableItemStreamClient.remove(id);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Get an auditable item stream.
 * @param id The id of stream to get.
 * @param verifyStream Whether to verify the stream.
 * @param includeEntries Whether to include the entries.
 * @returns The nothing unless there was an error.
 */
export async function auditableItemStreamGet(
	id: string,
	verifyStream?: boolean,
	includeEntries?: boolean
): Promise<
	| {
			error?: string;
			item?: IAuditableItemStream;
	  }
	| undefined
> {
	if (Is.object(auditableItemStreamClient)) {
		try {
			const result = await auditableItemStreamClient.get(id, { verifyStream, includeEntries });
			return {
				item: result
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Create an entry in an auditable item stream.
 * @param id The id of the stream to add the entry to.
 * @param entryObject The entry object to add.
 * @returns The id of the created entry or an error if one occurred.
 */
export async function auditableItemStreamCreateEntry(
	id: string,
	entryObject: IJsonLdNodeObject
): Promise<{ error?: string; entryId?: string } | undefined> {
	if (Is.object(auditableItemStreamClient)) {
		try {
			const entryId = await auditableItemStreamClient.createEntry(id, entryObject);
			return { entryId };
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * UPdate an entry in an auditable item stream.
 * @param id The id of the stream to add the entry to.
 * @param entryId The id of the entry to update.
 * @param entryObject The entry object to add.
 * @returns The id of the created entry or an error if one occurred.
 */
export async function auditableItemStreamUpdateEntry(
	id: string,
	entryId: string,
	entryObject: IJsonLdNodeObject
): Promise<{ error?: string } | undefined> {
	if (Is.object(auditableItemStreamClient)) {
		try {
			await auditableItemStreamClient.updateEntry(id, entryId, entryObject);
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Get an entry in an auditable item stream.
 * @param id The id of the stream to get the entry from.
 * @param entryId The entry object to add.
 * @returns The id of the created entry or an error if one occurred.
 */
export async function auditableItemStreamGetEntry(
	id: string,
	entryId: string
): Promise<{ error?: string; item?: IAuditableItemStreamEntry } | undefined> {
	if (Is.object(auditableItemStreamClient)) {
		try {
			const entry = await auditableItemStreamClient.getEntry(id, entryId);
			return { item: entry };
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Remove an entry in an auditable item stream.
 * @param id The id of the stream to remove the entry from.
 * @param entryId The entry object to remove.
 * @returns An error if one occurred.
 */
export async function auditableItemStreamRemoveEntry(
	id: string,
	entryId: string
): Promise<{ error?: string } | undefined> {
	if (Is.object(auditableItemStreamClient)) {
		try {
			await auditableItemStreamClient.removeEntry(id, entryId);
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Get entries from an auditable item stream.
 * @param id The id of the stream to get entries from.
 * @param options Options for retrieving entries.
 * @param options.limit The number of entries to return.
 * @param options.cursor The cursor to use for pagination.
 * @returns The stream entries or an error if one occurred.
 */
export async function auditableItemStreamGetEntries(
	id: string,
	options?: {
		limit?: number;
		cursor?: string;
	}
): Promise<
	| {
			error?: string;
			entries?: {
				entryId: string;
				entryObject: IJsonLdNodeObject;
			}[];
			cursor?: string;
	  }
	| undefined
> {
	if (Is.object(auditableItemStreamClient)) {
		try {
			const result = await auditableItemStreamClient.getEntries(id, {
				limit: options?.limit,
				cursor: options?.cursor
			});
			return {
				entries: result.entries.itemListElement.map(entry => ({
					entryId: entry.id,
					entryObject: entry.entryObject
				})),
				cursor: result.cursor
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
