// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { InformationRestClient } from "@twin.org/api-rest-client";
import { Is } from "@twin.org/core";
import { writable } from "svelte/store";

export const serverVersion = writable<string>("");
export const serverName = writable<string>("");

let informationClient: InformationRestClient | undefined;

/**
 * Initialise the API information.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	informationClient = new InformationRestClient({
		endpoint: apiUrl
	});
}

/**
 * Get the information from the server.
 */
export async function getInfo(): Promise<void> {
	if (Is.object(informationClient)) {
		try {
			const result = await informationClient.info();
			serverVersion.set(result.version);
			serverName.set(result.name);
		} catch {}
	}
}
