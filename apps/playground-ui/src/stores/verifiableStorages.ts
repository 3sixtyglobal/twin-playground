// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import { EntityStorageRestClient } from "@twin.org/entity-storage-rest-client";
import type { IUserVerifiableStorageEntry } from "$models/IUserVerifiableStorageEntry";

let userVerifiableStorageEntryClient:
	| EntityStorageRestClient<IUserVerifiableStorageEntry>
	| undefined;

/**
 * Initialise the verifiable storage.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	userVerifiableStorageEntryClient = new EntityStorageRestClient<IUserVerifiableStorageEntry>({
		endpoint: apiUrl,
		pathPrefix: "user-verifiable-storage"
	});
}

/**
 * Get a list of the verifiable storage data.
 * @param cursor The cursor to use for pagination.
 * @returns The list of immutable data stored.
 */
export async function verifiableStorageEntryList(cursor?: string): Promise<
	| {
			error?: string;
			items?: IUserVerifiableStorageEntry[];
			cursor?: string;
	  }
	| undefined
> {
	if (Is.object(userVerifiableStorageEntryClient)) {
		try {
			const result = await userVerifiableStorageEntryClient.query(
				undefined,
				undefined,
				undefined,
				undefined,
				cursor
			);
			return {
				items: result.entities as IUserVerifiableStorageEntry[],
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
 * Add an entry to the list of the verifiable storage.
 * @param entry The entry to add.
 * @returns The nothing unless there was an error.
 */
export async function verifiableStoragesEntrySet(entry: IUserVerifiableStorageEntry): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(userVerifiableStorageEntryClient)) {
		try {
			await userVerifiableStorageEntryClient.set(entry);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Remove an entry from the list of verifiable storage.
 * @param entryId The id of entry to remove.
 * @returns The nothing unless there was an error.
 */
export async function verifiableStorageEntryRemove(entryId: string): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(userVerifiableStorageEntryClient)) {
		try {
			await userVerifiableStorageEntryClient.remove(entryId);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
