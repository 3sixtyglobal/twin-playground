// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import type { IImmutableProofCredential } from "@twin.org/immutable-proof-models";
import { ImmutableProofRestClient } from "@twin.org/immutable-proof-rest-client";

let immutableProofClient: ImmutableProofRestClient | undefined;

/**
 * Initialise the immutable proof.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	immutableProofClient = new ImmutableProofRestClient({
		endpoint: apiUrl
	});
}

/**
 * Get an immutable proof.
 * @param proofId The id of the immutable proof.
 * @returns The immutable proof or an error if one occurred.
 */
export async function immutableProofGet(proofId: string): Promise<
	| {
			error?: string;
			item?: IImmutableProofCredential;
	  }
	| undefined
> {
	if (Is.object(immutableProofClient)) {
		try {
			const result = await immutableProofClient.get(proofId);
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
 * Create a new immutable proof.
 * @param proofObject The proof object to create.
 * @returns The id of the created proof or an error if one occurred.
 */
export async function immutableProofCreate(proofObject: IJsonLdNodeObject): Promise<
	| {
			error?: string;
			proofId?: string;
	  }
	| undefined
> {
	if (Is.object(immutableProofClient)) {
		try {
			const proofId = await immutableProofClient.create(proofObject);
			return {
				proofId
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Remove the verifiable storage for a proof.
 * @param proofId The id of the proof to remove.
 * @returns Nothing or an error if one occurred.
 */
export async function immutableProofRemoveVerifiable(
	proofId: string
): Promise<undefined | { error: string }> {
	if (Is.object(immutableProofClient)) {
		try {
			await immutableProofClient.removeNotarization(proofId);
			return undefined;
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Verify an immutable proof.
 * @param proofId The id of the proof to verify.
 * @returns The verification result or an error if one occurred.
 */
export async function immutableProofVerify(proofId: string): Promise<
	| {
			error?: string;
			verified?: boolean;
			failure?: string;
	  }
	| undefined
> {
	if (Is.object(immutableProofClient)) {
		try {
			const result = await immutableProofClient.verify(proofId);
			return {
				verified: result.verified,
				failure: result.failure
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
