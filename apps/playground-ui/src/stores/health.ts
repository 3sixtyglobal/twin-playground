// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HealthStatus, type IHealth } from "@twin.org/api-models";
import { HealthRestClient } from "@twin.org/api-rest-client";
import { Is } from "@twin.org/core";
import { writable } from "svelte/store";

export const serverHealthStatus = writable<HealthStatus | undefined>();
export const serverComponentHealth = writable<IHealth[]>([]);

let healthClient: HealthRestClient | undefined;
let healthInterval: NodeJS.Timeout | undefined;

/**
 * Initialise the API information.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	healthClient = new HealthRestClient({
		endpoint: apiUrl
	});

	await getHealth();

	if (Is.empty(healthInterval)) {
		healthInterval = setInterval(getHealth, 30000);
	}
}

/**
 * Get the health of the server.
 */
export async function getHealth(): Promise<void> {
	if (Is.object(healthClient)) {
		try {
			const result = await healthClient.healthStatus();
			serverHealthStatus.set(result.status);
			serverComponentHealth.set(result.components ?? []);
		} catch {
			serverHealthStatus.set(HealthStatus.Error);
			serverComponentHealth.set([]);
		}
	}
}
