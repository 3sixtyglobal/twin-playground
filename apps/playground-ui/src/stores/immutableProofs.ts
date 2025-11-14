// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import { EntityStorageRestClient } from "@twin.org/entity-storage-rest-client";
import type { IUserImmutableProofEntry } from "$models/IUserImmutableProofEntry";

let userImmutableProofEntryClient: EntityStorageRestClient<IUserImmutableProofEntry> | undefined;

/**
 * Initialise the immutable proof.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	userImmutableProofEntryClient = new EntityStorageRestClient<IUserImmutableProofEntry>({
		endpoint: apiUrl,
		pathPrefix: "user-immutable-proof"
	});
}

/**
 * Get a list of immutable proofs.
 * @param cursor The cursor to use for pagination.
 * @returns The list of immutable proofs.
 */
export async function immutableProofList(cursor?: string): Promise<
	| {
			error?: string;
			items?: IUserImmutableProofEntry[];
			cursor?: string;
	  }
	| undefined
> {
	if (Is.object(userImmutableProofEntryClient)) {
		try {
			const result = await userImmutableProofEntryClient.query(
				undefined,
				undefined,
				undefined,
				undefined,
				cursor
			);
			return {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
				items: result.entities as IUserImmutableProofEntry[],
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
 * Add an entry to the list of the immutable proof.
 * @param entry The entry to add.
 * @returns The nothing unless there was an error.
 */
export async function immutableProofsEntrySet(entry: IUserImmutableProofEntry): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(userImmutableProofEntryClient)) {
		try {
			await userImmutableProofEntryClient.set(entry);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Remove an entry from the list of immutable proof.
 * @param entryId The id of entry to remove.
 * @returns The nothing unless there was an error.
 */
export async function immutableProofEntryRemove(entryId: string): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(userImmutableProofEntryClient)) {
		try {
			await userImmutableProofEntryClient.remove(entryId);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
