// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import type { IRuleGroup } from "@twin.org/data-processing-models";
import { DataProcessingRestClient } from "@twin.org/data-processing-rest-client";

let dataProcessingClient: DataProcessingRestClient | undefined;

/**
 * Initialise the telemetry.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	dataProcessingClient = new DataProcessingRestClient({
		endpoint: apiUrl
	});
}

/**
 * Set the rule group.
 * @param ruleGroup The rule group to store.
 * @returns An error if one occurred.
 */
export async function ruleGroupSet(ruleGroup: IRuleGroup): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(dataProcessingClient)) {
		try {
			await dataProcessingClient.ruleGroupSet(ruleGroup);
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Query rule group data.
 * @param cursor The current cursor.
 * @param limit Limit the number of items to return.
 * @returns An array with the entities found and the current cursor.
 */
export async function ruleGroupQuery(
	cursor?: string,
	limit?: number
): Promise<
	| {
			error?: string;
			entities?: IRuleGroup[];
			cursor?: string;
	  }
	| undefined
> {
	if (Is.object(dataProcessingClient)) {
		try {
			const result = await dataProcessingClient.query(cursor, limit);
			return result;
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Query rule group data.
 * @param ruleGroupId The id of the rule group to get.
 * @returns An item if found or an error if one occurred.
 */
export async function ruleGroupGet(ruleGroupId: string): Promise<
	| {
			error?: string;
			item?: IRuleGroup;
	  }
	| undefined
> {
	if (Is.object(dataProcessingClient)) {
		try {
			const result = await dataProcessingClient.ruleGroupGet(ruleGroupId);
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
 * Remove a Data processing rule group.
 * @param ruleGroupId The id of the rule group to remove.
 * @returns The nothing unless there was an error.
 */
export async function ruleGroupRemove(ruleGroupId: string): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(dataProcessingClient)) {
		try {
			await dataProcessingClient.ruleGroupRemove(ruleGroupId);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
/**
 * Extract data using the data processing client.
 * @param ruleGroupId The rule group id.
 * @param inputData The input data.
 * @param overrideExtractorType An optional override for the extractor type.
 * @returns The extracted data or an error if one occurred.
 */
export async function extractData(
	ruleGroupId: string,
	inputData: Uint8Array,
	overrideExtractorType?: string
): Promise<
	| {
			error?: string;
			data?: unknown;
	  }
	| undefined
> {
	if (Is.object(dataProcessingClient)) {
		try {
			const data = await dataProcessingClient.extract(
				ruleGroupId,
				inputData,
				overrideExtractorType
			);
			return { data };
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
