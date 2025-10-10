// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationInformation } from "@twin.org/attestation-models";
import { AttestationRestClient } from "@twin.org/attestation-rest-client";
import { ErrorHelper, Is } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import type { DigitalDocument, WithContext } from "schema-dts";

let attestationClient: AttestationRestClient | undefined;

/**
 * Initialise the attestation.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	attestationClient = new AttestationRestClient({
		endpoint: apiUrl
	});
}

/**
 * Attest some data.
 * @param attestationObject The data to attest.
 * @returns The attestation information or an error if one occurred.
 */
export async function attestationCreate(attestationObject: WithContext<DigitalDocument>): Promise<
	| {
			error?: string;
			attestationId?: string;
	  }
	| undefined
> {
	if (Is.object(attestationClient)) {
		try {
			const attestationId = await attestationClient.create(attestationObject as IJsonLdNodeObject);
			return {
				attestationId
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Verify an attestation data.
 * @param attestationId The id of the attestation.
 * @returns The id of the attestation or an error if one occurred.
 */
export async function attestationGet(attestationId: string): Promise<
	| {
			error?: string;
			item?: IAttestationInformation;
	  }
	| undefined
> {
	if (Is.object(attestationClient)) {
		try {
			const result = await attestationClient.get(attestationId);
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
 * Transfer an attestation to a new holder.
 * @param attestationId The attestation to transfer.
 * @param holderIdentity The identity to transfer the attestation to.
 * @param holderAddress The address to transfer the attestation to.
 * @returns Nothing or an error if one occurred.
 */
export async function attestationTransfer(
	attestationId: string,
	holderIdentity: string,
	holderAddress: string
): Promise<{ error?: string } | undefined> {
	if (Is.object(attestationClient)) {
		try {
			await attestationClient.transfer(attestationId, holderIdentity, holderAddress);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Destroy an attestation.
 * @param attestationId The attestation to destroy.
 * @returns Nothing or an error if one occurred.
 */
export async function attestationDestroy(
	attestationId: string
): Promise<{ error?: string } | undefined> {
	if (Is.object(attestationClient)) {
		try {
			await attestationClient.destroy(attestationId);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
