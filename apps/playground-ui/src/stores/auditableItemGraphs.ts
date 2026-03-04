// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	VerifyDepth,
	type IAuditableItemGraphVertex,
	type IAuditableItemGraphVertexList
} from "@twin.org/auditable-item-graph-models";
import { AuditableItemGraphRestClient } from "@twin.org/auditable-item-graph-rest-client";
import { ErrorHelper, Is } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";

let auditableItemGraphClient: AuditableItemGraphRestClient | undefined;

/**
 * Initialise the auditable item graphs.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	auditableItemGraphClient = new AuditableItemGraphRestClient({
		endpoint: apiUrl,
		pathPrefix: "aig"
	});
}

/**
 * Create an auditable item graph.
 * @param annotationObject Object for the graph stored as a json ld document.
 * @param aliases Optional aliases for the graph.
 * @param resources Optional resources for the graph.
 * @param edges Optional edges for the graph.
 * @returns The id of the auditable item graph or an error if one occurred.
 */
export async function auditableItemGraphCreate(
	annotationObject?: IJsonLdNodeObject,
	aliases?: {
		id: string;
		aliasFormat?: string;
		annotationObject?: IJsonLdNodeObject;
	}[],
	resources?: {
		id?: string;
		resourceObject?: IJsonLdNodeObject;
	}[],
	edges?: {
		targetId: string;
		edgeRelationships: string[];
		annotationObject?: IJsonLdNodeObject;
	}[]
): Promise<
	| {
			error?: string;
			id?: string;
	  }
	| undefined
> {
	if (Is.object(auditableItemGraphClient)) {
		try {
			const id = await auditableItemGraphClient.create({
				annotationObject,
				aliases,
				resources,
				edges
			});
			return {
				id
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Update an auditable item graph.
 * @param id The id of the graph to update.
 * @param annotationObject Object for the graph stored as a json ld document.
 * @param aliases Optional aliases for the graph.
 * @param resources Optional resources for the graph.
 * @param edges Optional edges for the graph.
 * @returns The id of the auditable item graph or an error if one occurred.
 */
export async function auditableItemGraphUpdate(
	id: string,
	annotationObject?: IJsonLdNodeObject,
	aliases?: {
		id: string;
		aliasFormat?: string;
		annotationObject?: IJsonLdNodeObject;
	}[],
	resources?: {
		id?: string;
		resourceObject?: IJsonLdNodeObject;
	}[],
	edges?: {
		id?: string;
		targetId: string;
		edgeRelationships: string[];
		annotationObject?: IJsonLdNodeObject;
	}[]
): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(auditableItemGraphClient)) {
		try {
			await auditableItemGraphClient.update({ id, annotationObject, aliases, resources, edges });
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Get a list of the auditable item graphs.
 * @param cursor The cursor to use for pagination.
 * @returns The list of auditable item graphs.
 */
export async function auditableItemGraphList(cursor?: string): Promise<
	| {
			error?: string;
			items?: IAuditableItemGraphVertexList;
			cursor?: string;
	  }
	| undefined
> {
	if (Is.object(auditableItemGraphClient)) {
		try {
			const result = await auditableItemGraphClient.query(
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				cursor
			);
			return {
				items: result.entries,
				cursor: result.cursor
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Get an auditable item graph.
 * @param id The id of graph to get.
 * @param extraData Optional flag to get extra data.
 * @returns The nothing unless there was an error.
 */
export async function auditableItemGraphGet(
	id: string,
	extraData?: boolean
): Promise<
	| {
			error?: string;
			item?: IAuditableItemGraphVertex;
	  }
	| undefined
> {
	if (Is.object(auditableItemGraphClient)) {
		try {
			const result = await auditableItemGraphClient.get(
				id,
				extraData
					? {
							includeDeleted: true,
							verifySignatureDepth: VerifyDepth.All
						}
					: undefined
			);
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
 * Get a list of available auditable items for edges.
 * @returns The list of auditable items.
 */
export async function auditableItemGraphListForEdges(): Promise<
	| {
			error?: string;
			items?: IAuditableItemGraphVertex[];
	  }
	| undefined
> {
	if (Is.object(auditableItemGraphClient)) {
		try {
			const result = await auditableItemGraphClient.query();
			return {
				items: result.entries.itemListElement
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
