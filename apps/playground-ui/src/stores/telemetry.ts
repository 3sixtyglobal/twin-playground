// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import type {
	ITelemetryMetric,
	ITelemetryMetricValue,
	MetricType
} from "@twin.org/telemetry-models";
import { TelemetryRestClient } from "@twin.org/telemetry-rest-client";

let telemetryClient: TelemetryRestClient | undefined;

/**
 * Initialise the telemetry.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	telemetryClient = new TelemetryRestClient({
		endpoint: apiUrl
	});
}

/**
 * Create new metric.
 * @param metric The metric to store.
 * @returns An error if one occurred.
 */
export async function createMetric(metric: ITelemetryMetric): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(telemetryClient)) {
		try {
			await telemetryClient.createMetric(metric);
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Query telemetry data.
 * @param type The type of the metric.
 * @param cursor The current cursor.
 * @param limit Limit the number of items to return.
 * @returns An array with the entities found and the current cursor.
 */
export async function telemetryQuery(
	type?: MetricType,
	cursor?: string,
	limit?: number
): Promise<
	| {
			error?: string;
			entities?: ITelemetryMetric[];
			cursor?: string;
	  }
	| undefined
> {
	if (Is.object(telemetryClient)) {
		try {
			const result = await telemetryClient.query(type, cursor, limit);
			return result;
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Update a metric.
 * @param metric The metric to modify.
 * @returns An error if one occurred.
 */
export async function updateMetric(metric: ITelemetryMetric): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(telemetryClient)) {
		try {
			await telemetryClient.updateMetric(metric);
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Get the data from verifiable storage.
 * @param id The if of the immutable data to get.
 * @returns The metric data and it's values
 */
export async function metricGet(id: string): Promise<
	| {
			error?: string;
			metric?: ITelemetryMetric;
			value?: ITelemetryMetricValue;
	  }
	| undefined
> {
	if (Is.object(telemetryClient)) {
		try {
			const result = await telemetryClient.getMetric(id);
			return result;
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Remove a Telemetry metric.
 * @param metricId The id of the metric to remove.
 * @returns The nothing unless there was an error.
 */
export async function metricRemove(metricId: string): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(telemetryClient)) {
		try {
			await telemetryClient.removeMetric(metricId);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Create new metric.
 * @param id The id of the metric to add the value to.
 * @param value The value to add.
 * @param customData The custom data to add.
 * @returns An error if one occurred.
 */
export async function addValueToMetric(
	id: string,
	value: number | "inc" | "dec",
	customData?: { [key: string]: unknown }
): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(telemetryClient)) {
		try {
			await telemetryClient.addMetricValue(id, value, customData);
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Get the data from verifiable storage.
 * @param id The if of the immutable data to get.
 * @param limit Limit the number of items to return.
 * @param timeStart The start time.
 * @param timeEnd The end time.
 * @param cursor The current cursor.
 * @returns The metric data and it's values
 */
export async function metricValuesQuery(
	id: string,
	limit?: number,
	timeStart?: number,
	timeEnd?: number,
	cursor?: string
): Promise<
	| {
			error?: string;
			metric?: ITelemetryMetric;
			entities?: ITelemetryMetricValue[];
			cursor?: string;
	  }
	| undefined
> {
	if (Is.object(telemetryClient)) {
		try {
			const result = await telemetryClient.queryValues(id, timeStart, timeEnd, cursor, limit);
			return result;
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
