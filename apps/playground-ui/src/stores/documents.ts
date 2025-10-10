// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import { EntityStorageRestClient } from "@twin.org/entity-storage-rest-client";
import type { IUserDocumentEntry } from "$models/IUserDocumentEntry";

let userDocumentEntryClient: EntityStorageRestClient<IUserDocumentEntry> | undefined;

/**
 * Initialise the documents.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	userDocumentEntryClient = new EntityStorageRestClient<IUserDocumentEntry>({
		endpoint: apiUrl,
		pathPrefix: "user-document"
	});
}

/**
 * Get a list of the documents.
 * @param cursor The cursor to use for pagination.
 * @returns The list of documents.
 */
export async function documentEntryList(cursor?: string): Promise<
	| {
			error?: string;
			items?: IUserDocumentEntry[];
			cursor?: string;
	  }
	| undefined
> {
	if (Is.object(userDocumentEntryClient)) {
		try {
			const result = await userDocumentEntryClient.query(
				undefined,
				undefined,
				undefined,
				undefined,
				cursor
			);
			return {
				items: result.entities as IUserDocumentEntry[],
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
 * Add an entry to the list of the documents.
 * @param entry The entry to add.
 * @returns The nothing unless there was an error.
 */
export async function documentsEntrySet(entry: IUserDocumentEntry): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(userDocumentEntryClient)) {
		try {
			await userDocumentEntryClient.set(entry);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Remove an entry to the list of the documents.
 * @param entryId The id of entry to remove.
 * @returns The nothing unless there was an error.
 */
export async function documentsEntryRemove(entryId: string): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(userDocumentEntryClient)) {
		try {
			await userDocumentEntryClient.remove(entryId);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
