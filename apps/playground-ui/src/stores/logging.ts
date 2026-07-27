// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import type { ILogEntry, LogLevel } from "@twin.org/logging-models";
import { LoggingRestClient } from "@twin.org/logging-rest-client";

let loggingClient: LoggingRestClient | undefined;

/**
 * Initialise the logging.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	loggingClient = new LoggingRestClient({
		endpoint: apiUrl
	});
}

/**
 * Query logging data.
 * @param level The level of the logging.
 * @param source The source of the logging.
 * @param timeStart The start time.
 * @param timeEnd The end time.
 * @param cursor The current cursor.
 * @param limit Limit the number of items to return.
 * @returns An array with the entities found and the current cursor.
 */
export async function loggingQuery(
	level?: LogLevel,
	source?: string,
	timeStart?: number,
	timeEnd?: number,
	cursor?: string,
	limit?: number
): Promise<
	| {
			error?: string;
			entities?: ILogEntry[];
			cursor?: string;
	  }
	| undefined
> {
	if (Is.object(loggingClient)) {
		try {
			const result = await loggingClient.query(level, source, timeStart, timeEnd, cursor, limit);
			return result;
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
