// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { VerifiableStorageRestClient } from "@twin.org/verifiable-storage-rest-client";

let verifiableStorageClient: VerifiableStorageRestClient | undefined;

/**
 * Initialise the verifiable storage.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	verifiableStorageClient = new VerifiableStorageRestClient({
		endpoint: apiUrl
	});
}

/**
 * Upload new data to verifiable storage.
 * @param data The data to store.
 * @returns The id of the uploaded document or an error if one occurred.
 */
export async function verifiableStorageUpload(data: Uint8Array): Promise<
	| {
			error?: string;
			id?: string;
			receipt?: IJsonLdNodeObject;
	  }
	| undefined
> {
	if (Is.object(verifiableStorageClient)) {
		try {
			const response = await verifiableStorageClient.create(data);
			return response;
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Get the data from verifiable storage.
 * @param id The id of the immutable data to get.
 * @param options Options for the request.
 * @param options.includeData Should the data be included.
 * @returns The receipt and data properties.
 */
export async function verifiableStorageGet(
	id: string,
	options?: { includeData: boolean }
): Promise<
	| {
			error?: string;
			data?: Uint8Array;
			receipt?: IJsonLdNodeObject;
	  }
	| undefined
> {
	if (Is.object(verifiableStorageClient)) {
		try {
			const result = await verifiableStorageClient.get(id, options);
			return {
				data: result.data,
				receipt: result.receipt
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Remove an entry to the list of the verifiable storage entries.
 * @param entryId The id of entry to remove.
 * @returns The nothing unless there was an error.
 */
export async function verifiableStorageRemove(entryId: string): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(verifiableStorageClient)) {
		try {
			await verifiableStorageClient.remove(entryId);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
