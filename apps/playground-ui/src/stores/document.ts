// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAuditableItemGraphVertexList } from "@twin.org/auditable-item-graph-models";
import { ErrorHelper, Is } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import type { IDocumentHydrated, IDocumentList } from "@twin.org/document-management-models";
import { DocumentManagementRestClient } from "@twin.org/document-management-rest-client";
import type { UneceDocumentCodeList } from "@twin.org/standards-unece";

let documentClient: DocumentManagementRestClient | undefined;

/**
 * Initialise the document management.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	documentClient = new DocumentManagementRestClient({
		endpoint: apiUrl,
		pathPrefix: "documents"
	});
}

/**
 * Create a new document.
 * @param documentId The document id to create.
 * @param documentIdFormat The format of the document identifier.
 * @param documentCode The code for the document type.
 * @param blob The data to create the document with.
 * @param annotationObject Additional information to associate with the document.
 * @param auditableItemGraphEdges The auditable item graph vertices to connect the document to.
 * @param options Additional options for the set operation.
 * @param options.createAttestation Flag to create an attestation for the document.
 * @param options.addAlias Flag to add the document id as an alias to the aig vertex.
 * @param options.aliasAnnotationObject Annotation object for the alias.
 * @returns The auditable item graph vertex id or an error if one occurred.
 */
export async function documentCreate(
	documentId: string,
	documentIdFormat: string | undefined,
	documentCode: UneceDocumentCodeList,
	blob: Uint8Array,
	annotationObject?: IJsonLdNodeObject,
	auditableItemGraphEdges?: {
		targetId: string;
		addAlias?: boolean;
		aliasAnnotationObject?: IJsonLdNodeObject;
	}[],
	options?: {
		createAttestation?: boolean;
		addAlias?: boolean;
		aliasAnnotationObject?: IJsonLdNodeObject;
	}
): Promise<{ error?: string; id?: string } | undefined> {
	if (Is.object(documentClient)) {
		try {
			const id = await documentClient.create(
				{
					documentId,
					documentIdFormat,
					documentCode,
					annotationObject
				},
				blob,
				auditableItemGraphEdges,
				options
			);
			return { id };
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Update an existing document.
 * @param auditableItemGraphDocumentId The auditable item graph vertex id which contains the document.
 * @param blob The data to update the document with.
 * @param annotationObject Additional information to associate with the document.
 * @param auditableItemGraphEdges The auditable item graph vertices to connect the document to.
 * @returns Nothing unless there was an error.
 */
export async function documentUpdate(
	auditableItemGraphDocumentId: string,
	blob?: Uint8Array,
	annotationObject?: IJsonLdNodeObject,
	auditableItemGraphEdges?: {
		id?: string;
		targetId: string;
		addAlias?: boolean;
		aliasAnnotationObject?: IJsonLdNodeObject;
	}[]
): Promise<{ error?: string; id?: string } | undefined> {
	if (Is.object(documentClient)) {
		try {
			await documentClient.updatePartial(auditableItemGraphDocumentId, { annotationObject }, blob, {
				add: auditableItemGraphEdges
			});
			return { id: auditableItemGraphDocumentId };
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Get a document by its auditable item graph vertex id.
 * @param auditableItemGraphDocumentId The auditable item graph vertex id which contains the document.
 * @param options Additional options for the get operation.
 * @param options.includeBlobStorageMetadata Flag to include the blob storage metadata for the document.
 * @param options.includeBlobStorageData Flag to include the blob storage data for the document.
 * @param options.includeAttestation Flag to include the attestation information for the document.
 * @param options.includeRemoved Flag to include deleted documents.
 * @param cursor The cursor to get the next chunk of revisions.
 * @param limit Limit the number of items to return.
 * @returns The document list and its properties or an error if one occurred.
 */
export async function documentGet(
	auditableItemGraphDocumentId: string,
	options?: {
		includeBlobStorageMetadata?: boolean;
		includeBlobStorageData?: boolean;
		includeAttestation?: boolean;
		includeRemoved?: boolean;
	},
	cursor?: string,
	limit?: number
): Promise<{ error?: string; item?: IDocumentList } | undefined> {
	if (Is.object(documentClient)) {
		try {
			const result = await documentClient.get(auditableItemGraphDocumentId, options, cursor, limit);
			return { item: result.entries };
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Remove a specific revision of a document.
 * @param auditableItemGraphDocumentId The auditable item graph vertex id which contains the document.
 * @param revision The revision of the document to remove.
 * @returns Nothing unless there was an error.
 */
export async function documentRemoveRevision(
	auditableItemGraphDocumentId: string,
	revision: number
): Promise<{ error?: string } | undefined> {
	if (Is.object(documentClient)) {
		try {
			await documentClient.removeRevision(auditableItemGraphDocumentId, revision);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Query for documents with a specific id.
 * @param documentId The document id to find in the graph.
 * @param cursor The cursor to get the next chunk of documents.
 * @param limit The limit to get the next chunk of documents.
 * @returns The graph vertices list or an error if one occurred.
 */
export async function documentQuery(
	documentId: string,
	cursor?: string,
	limit?: number
): Promise<{ error?: string; item?: IAuditableItemGraphVertexList; cursor?: string } | undefined> {
	if (Is.object(documentClient)) {
		try {
			const result = await documentClient.query(documentId, cursor, limit);
			return { item: result.entries, cursor: result.cursor };
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Get a document revision by its auditable item graph vertex id.
 * @param documentId The document id to find in the graph.
 * @param revisionNumber The revision number of the document to get.
 * @param options Additional options for the get operation.
 * @param options.includeBlobStorageMetadata Flag to include the blob storage metadata for the document.
 * @param options.includeBlobStorageData Flag to include the blob storage data for the document.
 * @param options.includeAttestation Flag to include the attestation information for the document.
 * @param options.includeRemoved Flag to include deleted documents.
 * @param options.extractRuleGroupId The rule group id to extract the document from.
 * @returns The graph vertices list or an error if one occurred.
 */
export async function documentRevisionGet(
	documentId: string,
	revisionNumber: number,
	options?: {
		includeBlobStorageMetadata?: boolean;
		includeBlobStorageData?: boolean;
		includeAttestation?: boolean;
		includeRemoved?: boolean;
		extractRuleGroupId?: string;
	}
): Promise<{ error?: string; item?: IDocumentHydrated } | undefined> {
	if (Is.object(documentClient)) {
		try {
			const result = await documentClient.getRevision(documentId, revisionNumber, options);
			return { item: result };
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
