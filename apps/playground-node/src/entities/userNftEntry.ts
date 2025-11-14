// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property } from "@twin.org/entity";

/**
 * Class representing information for nft.
 */
@entity()
export class UserNftEntry {
	/**
	 * The id for the nft.
	 */
	@property({ type: "string", isPrimary: true })
	public id!: string;

	/**
	 * The nftId for the nft.
	 */
	@property({ type: "string", optional: true })
	public nftId?: string;

	/**
	 * The issuer for the nft.
	 */
	@property({ type: "string", optional: true })
	public issuer?: string;

	/**
	 * The owner for the nft.
	 */
	@property({ type: "string", optional: true })
	public owner?: string;

	/**
	 * The tag for the nft.
	 */
	@property({ type: "string", optional: true })
	public tag?: string;

	/**
	 * The user identity who created it.
	 */
	@property({ type: "string", isSecondary: true, optional: true })
	public userIdentity?: string;
}
