// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Coerce, ErrorHelper, Guards } from "@twin.org/core";
import { init as initApp } from "../stores/app";
import { env } from "$env/dynamic/public";

/**
 * Perform a load and initialise the application.
 * @param params The load params.
 * @param params.url The URL.
 */
export async function load(params: { url: URL }): Promise<void> {
	try {
		Guards.stringValue("init", "PUBLIC_PLAYGROUND_API_URL", env.PUBLIC_PLAYGROUND_API_URL);
		Guards.stringValue(
			"init",
			"PUBLIC_PLAYGROUND_PUBLIC_BASE_URL",
			env.PUBLIC_PLAYGROUND_PUBLIC_BASE_URL
		);
		Guards.stringValue(
			"init",
			"PUBLIC_PLAYGROUND_PRIVATE_BASE_URL",
			env.PUBLIC_PLAYGROUND_PRIVATE_BASE_URL
		);
		Guards.stringValue(
			"init",
			"PUBLIC_PLAYGROUND_IOTA_EXPLORER_URL",
			env.PUBLIC_PLAYGROUND_IOTA_EXPLORER_URL
		);
		Guards.stringValue(
			"init",
			"PUBLIC_PLAYGROUND_IOTA_NETWORK",
			env.PUBLIC_PLAYGROUND_IOTA_NETWORK
		);

		await initApp({
			rootUrl: params.url,
			localesIndex: [
				{
					label: "English",
					code: "en"
				}
			],
			apiUrl: env.PUBLIC_PLAYGROUND_API_URL,
			envPublicBaseUrl: env.PUBLIC_PLAYGROUND_PUBLIC_BASE_URL,
			envPrivateBaseUrl: env.PUBLIC_PLAYGROUND_PRIVATE_BASE_URL,
			debugLanguages: Coerce.boolean(env.PUBLIC_PLAYGROUND_DEBUG_LANGUAGES) ?? false,
			iotaExplorerUrl: env.PUBLIC_PLAYGROUND_IOTA_EXPLORER_URL,
			iotaNetwork: env.PUBLIC_PLAYGROUND_IOTA_NETWORK
		});
	} catch (err) {
		// Nothing else is initialised yet so we need to console log manually
		// eslint-disable-next-line no-console
		console.error("Error during initialisation", ErrorHelper.formatErrors(err, true).join("\n"));
	}
}
