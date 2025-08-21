// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { Is } from "@twin.org/core";
import { EngineConfigHelper } from "@twin.org/engine";
import type { IEngineConfig } from "@twin.org/engine-types";
import { EntitySchemaHelper } from "@twin.org/entity";
import { nameof } from "@twin.org/nameof";
import { run } from "@twin.org/node-core";
import { UserAttestationEntry } from "./entities/userAttestationEntry.js";
import { UserDocumentEntry } from "./entities/userDocumentEntry.js";
import { UserImmutableProofEntry } from "./entities/userImmutableProofEntry.js";
import { UserNftEntry } from "./entities/userNftEntry.js";
import { UserVerifiableStorageEntry } from "./entities/userVerifiableStorageEntry.js";

await run({
	serverName: "Playground Node",
	serverVersion: "0.0.2-next-0", // x-release-please-version
	envPrefix: "PLAYGROUND_",
	localesDirectory: path.resolve("dist/locales"),
	openApiSpecFile: path.resolve("docs/open-api/spec.json"),
	favIconFile: path.resolve("static/favicon.ico"),
	extendConfig
});

/**
 * Extends the engine config with types specific to playground.
 * @param engineConfig The engine configuration.
 */
export async function extendConfig(engineConfig: IEngineConfig): Promise<void> {
	// Add a custom entity storage type for the users attestations,
	// but only if the attestation connectors are available.
	if (Is.arrayValue(engineConfig.types.attestationConnector)) {
		EngineConfigHelper.addCustomEntityStorage<UserAttestationEntry>(
			engineConfig,
			nameof<UserAttestationEntry>(),
			EntitySchemaHelper.getSchema(UserAttestationEntry),
			"user-attestation"
		);
	}

	// Add a custom entity storage type for the users nfts,
	// but only if the nft connectors are available.
	if (Is.arrayValue(engineConfig.types.nftConnector)) {
		EngineConfigHelper.addCustomEntityStorage<UserNftEntry>(
			engineConfig,
			nameof<UserNftEntry>(),
			EntitySchemaHelper.getSchema(UserNftEntry),
			"user-nft"
		);
	}

	// Add a custom entity storage type for verifiable storage,
	// but only if the verifiable storage connectors are available.
	if (Is.arrayValue(engineConfig.types.verifiableStorageConnector)) {
		EngineConfigHelper.addCustomEntityStorage<UserVerifiableStorageEntry>(
			engineConfig,
			nameof<UserVerifiableStorageEntry>(),
			EntitySchemaHelper.getSchema(UserVerifiableStorageEntry),
			"user-verifiable-storage"
		);
	}

	// Add a custom entity storage type for immutable proofs
	if (Is.arrayValue(engineConfig.types.immutableProofComponent)) {
		EngineConfigHelper.addCustomEntityStorage<UserImmutableProofEntry>(
			engineConfig,
			nameof<UserImmutableProofEntry>(),
			EntitySchemaHelper.getSchema(UserImmutableProofEntry),
			"user-immutable-proof"
		);
	}

	// Add a custom entity storage type for document management
	if (Is.arrayValue(engineConfig.types.documentManagementComponent)) {
		EngineConfigHelper.addCustomEntityStorage<UserDocumentEntry>(
			engineConfig,
			nameof<UserDocumentEntry>(),
			EntitySchemaHelper.getSchema(UserDocumentEntry),
			"user-document"
		);
	}
}
