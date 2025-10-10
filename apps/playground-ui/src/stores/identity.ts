// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { IdentityRestClient } from "@twin.org/identity-rest-client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let identityClient: IdentityRestClient | undefined;

/**
 * Initialise the identity.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	identityClient = new IdentityRestClient({
		endpoint: apiUrl
	});
}
