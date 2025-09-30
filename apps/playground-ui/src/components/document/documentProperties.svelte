<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Coerce, Is, Validation, type IValidationFailure } from '@twin.org/core';
	import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';
	import type { IDocument } from '@twin.org/document-management-models';
	import { UneceDocumentCodes } from '@twin.org/standards-unece';
	import {
		Button,
		Card,
		Checkbox,
		Error,
		Fileupload,
		Heading,
		i18n,
		Input,
		Label,
		P,
		Select,
		Span,
		Spinner,
		Textarea,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { auditableItemGraphListForEdges } from '$stores/auditableItemGraphs';
	import { documentCreate, documentGet, documentUpdate } from '$stores/document';
	import { documentsEntrySet } from '$stores/documents';

	export let itemId: string | undefined = undefined;
	export let returnUrl: string | undefined = undefined;

	const isUpdate = Is.stringValue(itemId);

	let validationErrors: {
		[field in
			| 'documentId'
			| 'documentCode'
			| 'file'
			| 'annotationObject'
			| 'vertexId'
			| 'edgeAliasAnnotationObject'
			| 'options']?: IValidationFailure[] | undefined;
	} = {};
	let busy = false;
	let loadingBusy = false;
	let progress: string | undefined;
	let error: string | undefined;
	let documentData: IDocument | undefined;
	let documentId: string = '';
	let documentIdFormat: string = '';
	let documentCode = UneceDocumentCodes.BillOfLading;
	let fileData: Uint8Array | undefined;
	let files: FileList | undefined;
	let availableVertices: string[] = [];

	// Advanced options variables
	let annotationObjectStr: string = '';
	let selectedAnnotationExample: string = '';

	// Annotation object examples
	const annotationObjectExamples = [
		{
			value: 'default',
			label: 'Default Document',
			object: {
				'@context': 'https://schema.org',
				'@type': 'DigitalDocument',
				namespaceSpecific: ['default']
			}
		},
		{
			value: 'invoice',
			label: 'Invoice',
			object: {
				'@context': 'https://schema.org',
				'@type': 'Invoice',
				name: 'Invoice #INV-2025-0042',
				accountId: 'ACC-29381',
				billingPeriod: 'April 2025',
				paymentDue: '2025-05-30T00:00:00Z',
				paymentMethod: 'Credit Card',
				totalPaymentDue: {
					'@type': 'PriceSpecification',
					price: 1250,
					priceCurrency: 'USD'
				},
				provider: {
					'@type': 'Organization',
					name: 'Tech Supplies Inc.',
					legalName: 'Tech Supplies Corporation'
				},
				namespaceSpecific: ['invoice', 'finance']
			}
		},
		{
			value: 'shipping',
			label: 'Shipping Document',
			object: {
				'@context': 'https://schema.org',
				'@type': 'DeliveryEvent',
				deliveryAddress: {
					'@type': 'PostalAddress',
					streetAddress: '123 Shipping Lane',
					addressLocality: 'Logistics City',
					postalCode: '12345',
					addressCountry: 'US'
				},
				deliveryStatus: 'InTransit',
				trackingNumber: 'TRACK-987654321',
				originAddress: {
					'@type': 'PostalAddress',
					streetAddress: '456 Warehouse Blvd',
					addressLocality: 'Storage Town',
					postalCode: '67890',
					addressCountry: 'US'
				},
				expectedArrivalFrom: '2025-05-10T09:00:00Z',
				expectedArrivalUntil: '2025-05-10T17:00:00Z',
				namespaceSpecific: ['logistics', 'shipping']
			}
		},
		{
			value: 'compliance',
			label: 'Compliance Report',
			object: {
				'@context': 'https://schema.org',
				'@type': 'DigitalDocument',
				name: 'Environmental Compliance Report',
				description: 'Annual environmental compliance declaration',
				dateCreated: '2025-04-15T14:22:00Z',
				about: {
					'@type': 'GovernmentService',
					serviceType: 'Environmental Regulation',
					provider: {
						'@type': 'GovernmentOrganization',
						name: 'Environmental Protection Agency'
					}
				},
				complianceType: 'Annual Report',
				reportingPeriod: '2024-01-01/2024-12-31',
				complianceStatus: 'Compliant',
				namespaceSpecific: ['regulatory', 'environmental']
			}
		}
	];

	// Edge alias annotation object examples
	const edgeAliasAnnotationObjectExamples = [
		{
			value: 'default',
			label: 'Default Document',
			object: {
				'@context': 'https://schema.org',
				'@type': 'DigitalDocument',
				namespaceSpecific: ['default']
			}
		},
		{
			value: 'relationship',
			label: 'Document Relationship',
			object: {
				'@context': 'https://schema.org',
				'@type': 'DigitalDocument',
				name: 'Related Document',
				relationship: 'Supporting Document',
				relationshipType: 'supporting',
				dateCreated: '2025-05-07T09:30:00Z',
				namespaceSpecific: ['document', 'relationship']
			}
		},
		{
			value: 'approval',
			label: 'Approval Information',
			object: {
				'@context': 'https://schema.org',
				'@type': 'DigitalDocument',
				name: 'Document Approval',
				approver: {
					'@type': 'Organization',
					name: 'Regulatory Authority'
				},
				approvalStatus: 'Approved',
				dateApproved: '2025-05-05T14:20:00Z',
				approvalNumber: 'APR-123456',
				namespaceSpecific: ['document', 'approval']
			}
		},
		{
			value: 'tracking',
			label: 'Tracking Information',
			object: {
				'@context': 'https://schema.org',
				'@type': 'TrackAction',
				agent: {
					'@type': 'Organization',
					name: 'Supply Chain Tracker'
				},
				location: {
					'@type': 'Place',
					address: {
						'@type': 'PostalAddress',
						addressCountry: 'US',
						addressLocality: 'Warehouse District'
					},
					geo: {
						'@type': 'GeoCoordinates',
						latitude: '37.7749',
						longitude: '-122.4194'
					}
				},
				startTime: '2025-05-07T00:00:00Z',
				namespaceSpecific: ['tracking', 'logistics']
			}
		}
	];

	// Alias annotation object examples
	const aliasAnnotationObjectExamples = [
		{
			value: 'default',
			label: 'Default Document',
			object: {
				'@context': 'https://schema.org',
				'@type': 'DigitalDocument',
				namespaceSpecific: ['default']
			}
		},
		{
			value: 'metadata',
			label: 'Metadata Record',
			object: {
				'@context': 'https://schema.org',
				'@type': 'Dataset',
				name: 'Document Metadata',
				description: 'Metadata record for linked document',
				dateCreated: '2025-05-07T11:45:00Z',
				creator: {
					'@type': 'Organization',
					name: 'Document Management System'
				},
				keywords: ['metadata', 'document', 'record'],
				namespaceSpecific: ['metadata', 'document']
			}
		},
		{
			value: 'version',
			label: 'Version Control',
			object: {
				'@context': 'https://schema.org',
				'@type': 'CreativeWork',
				name: 'Version Record',
				version: '1.0.0',
				dateModified: '2025-05-07T11:45:00Z',
				contentReferenceTime: '2025-05-07T11:45:00Z',
				author: {
					'@type': 'Person',
					name: 'Document Editor'
				},
				namespaceSpecific: ['version', 'control']
			}
		},
		{
			value: 'indexing',
			label: 'Search Indexing',
			object: {
				'@context': 'https://schema.org',
				'@type': 'DigitalDocument',
				name: 'Search Index Entry',
				keywords: ['document', 'data', 'search'],
				abstract: 'Indexed content for document search system',
				contentRating: 'Unclassified',
				dateCreated: '2025-05-07T12:00:00Z',
				namespaceSpecific: ['search', 'indexing']
			}
		}
	];

	let vertexId: string = '';
	let vertexAddAlias: boolean = false;
	let edgeAliasAnnotationObjectStr: string = '';
	let selectedEdgeAliasAnnotationExample: string = '';
	let createAttestation: boolean = false;
	let addAlias: boolean = false;
	let aliasAnnotationObjectStr: string = '';
	let selectedAliasAnnotationExample: string = '';

	const documentTypes = [
		{ value: UneceDocumentCodes.BillOfLading, label: 'BillOfLading' },
		{ value: UneceDocumentCodes.PhytosanitaryCertificate, label: 'PhytosanitaryCertificate' },
		{ value: UneceDocumentCodes.ExportLicence, label: 'ExportLicence' },
		{ value: UneceDocumentCodes.CustomsClearanceNotice, label: 'CustomsClearanceNotice' },
		{ value: UneceDocumentCodes.DeclarationOfOrigin, label: 'DeclarationOfOrigin' }
	];

	$: {
		const example = annotationObjectExamples.find(ex => ex.value === selectedAnnotationExample);
		if (example) {
			annotationObjectStr = JSON.stringify(example.object, null, 2);
		}
	}

	$: {
		const example = edgeAliasAnnotationObjectExamples.find(
			ex => ex.value === selectedEdgeAliasAnnotationExample
		);
		if (example) {
			edgeAliasAnnotationObjectStr = JSON.stringify(example.object, null, 2);
		}
	}

	$: {
		const example = aliasAnnotationObjectExamples.find(
			ex => ex.value === selectedAliasAnnotationExample
		);
		if (example) {
			aliasAnnotationObjectStr = JSON.stringify(example.object, null, 2);
		}
	}

	async function loadDocumentData(): Promise<void> {
		if (!itemId) {
			return;
		}

		loadingBusy = true;
		error = undefined;

		const result = await documentGet(itemId, {
			includeBlobStorageMetadata: true,
			includeBlobStorageData: false,
			includeAttestation: false,
			includeRemoved: false
		});

		if (Is.stringValue(result?.error)) {
			error = result.error;
			return;
		}

		if (Is.object(result?.item) && Is.arrayValue(result.item.itemListElement)) {
			documentData = result.item.itemListElement[0];

			documentId = documentData.documentId ?? '';
			documentIdFormat = documentData.documentIdFormat ?? '';
			documentCode = documentData.documentCode ?? UneceDocumentCodes.BillOfLading;

			if (Is.object(documentData.annotationObject)) {
				annotationObjectStr = JSON.stringify(documentData.annotationObject, null, 2);
			}
		} else {
			error = $i18n('pages.documentProperties.noDocumentsFound');
		}

		if (Is.arrayValue(result?.item?.edges)) {
			vertexId = result.item.edges[0];
		}

		loadingBusy = false;
	}

	async function loadAvailableVertices(): Promise<void> {
		const result = await auditableItemGraphListForEdges();
		availableVertices = [];
		edgeAliasAnnotationObjectStr = '';

		if (Is.arrayValue(result?.items)) {
			const filteredAvailableVertices = Is.stringValue(itemId)
				? result.items.filter(v => v.id !== itemId).map(v => v.id)
				: result.items.map(v => v.id);
			if (filteredAvailableVertices.length > 0) {
				availableVertices = filteredAvailableVertices;
			}
		}
	}

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		if (!isUpdate) {
			Validation.stringValue(
				'documentId',
				documentId,
				validationFailures,
				$i18n('pages.documentProperties.documentId')
			);

			Validation.arrayOneOf(
				'documentCode',
				documentCode,
				Object.values(UneceDocumentCodes),
				validationFailures,
				$i18n('pages.documentProperties.documentCode')
			);

			Validation.notEmpty(
				'file',
				Is.stringValue(files?.[0]?.name) ? files[0].name : undefined,
				validationFailures,
				$i18n('pages.documentProperties.file')
			);
		}

		if (Is.stringValue(annotationObjectStr)) {
			Validation.json(
				'annotationObject',
				annotationObjectStr,
				validationFailures,
				$i18n('pages.documentProperties.annotationObject')
			);
		}

		if (Is.stringValue(edgeAliasAnnotationObjectStr)) {
			Validation.json(
				'edgeAliasAnnotationObject',
				edgeAliasAnnotationObjectStr,
				validationFailures,
				$i18n('pages.documentProperties.edgeAliasAnnotationObject')
			);
		}

		if (Is.stringValue(aliasAnnotationObjectStr)) {
			Validation.json(
				'options',
				aliasAnnotationObjectStr,
				validationFailures,
				$i18n('pages.documentProperties.aliasAnnotationObject')
			);
		}
	}

	async function close(): Promise<void> {
		if (Is.stringValue(returnUrl)) {
			await goto(returnUrl);
		}
	}

	async function action(): Promise<string | undefined> {
		busy = true;
		progress = isUpdate
			? $i18n('pages.documentProperties.updateProgress')
			: $i18n('pages.documentProperties.progress');

		try {
			if (!isUpdate) {
				itemId = undefined;
			}

			if (isUpdate && !Is.stringValue(itemId)) {
				busy = false;
				return undefined;
			}

			if (!isUpdate && (!Is.stringValue(documentId) || !Is.objectValue(files))) {
				busy = false;
				return undefined;
			}

			if (Is.objectValue(files)) {
				const file = files[0];
				fileData = new Uint8Array(await file.arrayBuffer());
			}

			let annotationObject: IJsonLdNodeObject | undefined;
			if (isUpdate) {
				annotationObject = Coerce.object(annotationObjectStr);
			} else if (Is.json(annotationObjectStr)) {
				annotationObject = JSON.parse(annotationObjectStr) as IJsonLdNodeObject;
			}

			let auditableItemGraphEdges:
				| {
						id?: string;
						targetId: string;
						addAlias?: boolean;
						aliasAnnotationObject?: IJsonLdNodeObject;
				  }[]
				| undefined = undefined;

			if (Is.stringValue(vertexId)) {
				const edgeAliasAnnotationObject: IJsonLdNodeObject | undefined = Coerce.object(
					edgeAliasAnnotationObjectStr
				);

				auditableItemGraphEdges = [
					{
						targetId: vertexId,
						addAlias: vertexAddAlias,
						aliasAnnotationObject: edgeAliasAnnotationObject
					}
				];
			}

			let options:
				| {
						createAttestation?: boolean;
						addAlias?: boolean;
						aliasAnnotationObject?: IJsonLdNodeObject;
				  }
				| undefined;

			if (!isUpdate) {
				let aliasAnnotationObject: IJsonLdNodeObject | undefined = undefined;
				if (Is.json(aliasAnnotationObjectStr)) {
					aliasAnnotationObject = JSON.parse(aliasAnnotationObjectStr) as IJsonLdNodeObject;
				}

				options =
					createAttestation || addAlias || Is.stringValue(aliasAnnotationObjectStr)
						? {
								createAttestation,
								addAlias,
								aliasAnnotationObject
							}
						: undefined;
			}

			const result =
				isUpdate && Is.stringValue(itemId)
					? await documentUpdate(itemId, fileData, annotationObject, auditableItemGraphEdges)
					: await documentCreate(
							documentId,
							documentIdFormat,
							documentCode,
							fileData ?? new Uint8Array(),
							annotationObject,
							auditableItemGraphEdges,
							options
						);

			progress = '';

			if (Is.stringValue(result?.error)) {
				busy = false;
				return result.error;
			}

			if (!isUpdate) {
				itemId = result?.id;
			}

			if (Is.stringValue(itemId)) {
				await documentsEntrySet({
					id: itemId,
					documentId,
					revision: isUpdate ? (files?.length ?? 1) : undefined,
					dateCreated: isUpdate
						? (documentData?.dateCreated ?? new Date().toISOString())
						: new Date().toISOString(),
					lastUpdated: new Date().toISOString()
				});

				if (isUpdate) {
					await goto('/secure/document');
				}
			}

			busy = false;
			return undefined;
		} catch {
			progress = '';
			busy = false;
			return String(error);
		}
	}

	onMount(async () => {
		busy = false;
		await loadAvailableVertices();
		if (isUpdate) {
			await loadDocumentData();
		}
	});
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	{#if loadingBusy}
		<Card class="flex w-full flex-col gap-4">
			<div class="flex items-center justify-center p-4">
				<Spinner />
			</div>
		</Card>
	{:else if error}
		<Card class="flex w-full flex-col gap-4">
			<Error {error} />
		</Card>
	{:else if !Is.stringValue(itemId) || isUpdate}
		<ValidatedForm
			title={isUpdate
				? $i18n('pages.documentProperties.updateTitle')
				: $i18n('pages.documentProperties.title')}
			actionButtonLabel={isUpdate
				? $i18n('pages.documentProperties.actionUpdate')
				: $i18n('pages.documentProperties.action')}
			actionSuccessLabel={isUpdate
				? $i18n('pages.documentProperties.updateSuccess')
				: $i18n('pages.documentProperties.actionSuccess')}
			validationMethod={validate}
			actionMethod={action}
			closeMethod={close}
			bind:validationErrors
			bind:busy
		>
			{#snippet fields()}
				<Label>
					{$i18n('pages.documentProperties.documentId')}
					<Input
						name="documentId"
						placeholder={$i18n('pages.documentProperties.documentId')}
						color={Is.arrayValue(validationErrors.documentId) ? 'error' : 'default'}
						bind:value={documentId}
						disabled={busy || isUpdate}
					/>
					<ValidationError validationErrors={validationErrors.documentId} />
				</Label>

				<Label>
					{$i18n('pages.documentProperties.documentIdFormat')}
					<Input
						name="documentIdFormat"
						placeholder={$i18n('pages.documentProperties.documentIdFormat')}
						color="default"
						bind:value={documentIdFormat}
						disabled={busy || isUpdate}
					/>
				</Label>

				<Label>
					{$i18n('pages.documentProperties.documentCode')}
					<Select
						bind:value={documentCode}
						color={Is.arrayValue(validationErrors.documentCode) ? 'error' : 'default'}
						disabled={busy || isUpdate}
					>
						{#each documentTypes as type}
							<option value={type.value}>{type.label}</option>
						{/each}
					</Select>
					<ValidationError validationErrors={validationErrors.documentCode} />
				</Label>

				<Label>
					{$i18n('pages.documentProperties.file')}
					{#if isUpdate}
						<P class="text-sm text-gray-500"
							>{$i18n('pages.documentProperties.fileUpdateOptional')}</P
						>
					{/if}
					<Fileupload
						name="file"
						color={Is.arrayValue(validationErrors.file) ? 'error' : 'default'}
						bind:files
						disabled={busy}
					/>
					<ValidationError validationErrors={validationErrors.file} />
				</Label>

				<Label>
					{$i18n('pages.documentProperties.annotationObject')}
					<div class="mb-2">
						<Select bind:value={selectedAnnotationExample} disabled={busy}>
							{#each annotationObjectExamples as example}
								<option value={example.value}>{example.label}</option>
							{/each}
						</Select>
					</div>
					<Textarea
						name="annotationObject"
						bind:value={annotationObjectStr}
						disabled={busy}
						color={Is.arrayValue(validationErrors.annotationObject) ? 'error' : 'default'}
						class="min-h-40 text-sm"
					/>
					<ValidationError validationErrors={validationErrors.annotationObject} />
				</Label>

				{#if !isUpdate}
					<Heading tag="h6">{$i18n('pages.documentProperties.documentOptions')}</Heading>

					<Checkbox bind:checked={createAttestation} disabled={busy}
						>{$i18n('pages.documentProperties.createAttestation')}</Checkbox
					>

					<Checkbox bind:checked={addAlias} disabled={busy}>
						{$i18n('pages.documentProperties.addAlias')}
					</Checkbox>

					<Label>
						{$i18n('pages.documentProperties.aliasAnnotationObject')}
						<div class="mb-2">
							<Select bind:value={selectedAliasAnnotationExample} disabled={busy}>
								{#each aliasAnnotationObjectExamples as example}
									<option value={example.value}>{example.label}</option>
								{/each}
							</Select>
						</div>
						<Textarea
							name="aliasAnnotationObject"
							bind:value={aliasAnnotationObjectStr}
							disabled={busy}
							color={Is.arrayValue(validationErrors.options) ? 'error' : 'default'}
							class="min-h-40 text-sm"
						/>
						<ValidationError validationErrors={validationErrors.options} />
					</Label>
				{/if}

				<Heading tag="h6">{$i18n('pages.documentProperties.auditableItemGraphEdges')}</Heading>
				<Label>
					{$i18n('pages.documentProperties.vertexId')}
					{#if Is.arrayValue(availableVertices)}
						<Select
							name="vertexId"
							bind:value={vertexId}
							color={Is.arrayValue(validationErrors.vertexId) ? 'error' : 'default'}
							disabled={busy}
						>
							{#each availableVertices as availableVertexId}
								<option value={availableVertexId}>
									{availableVertexId}
								</option>
							{/each}
						</Select>
					{:else}
						<div class="flex flex-row">
							<P class="text-sm text-neutral-900 dark:text-neutral-400">
								{$i18n('pages.documentProperties.createVertexFirst')}
							</P>
							<Button
								on:click={() => goto('/secure/auditable-item-graph')}
								size="sm"
								class="whitespace-nowrap"
							>
								{$i18n('pages.documentProperties.createVertexLink')}
							</Button>
						</div>
					{/if}
					<ValidationError validationErrors={validationErrors.vertexId} />
				</Label>

				<Checkbox bind:checked={vertexAddAlias} disabled={busy}>
					{$i18n('pages.documentProperties.vertexAddAlias')}
				</Checkbox>

				<Label>
					{$i18n('pages.documentProperties.edgeAliasAnnotationObject')}
					<div class="mb-2">
						<Select bind:value={selectedEdgeAliasAnnotationExample} disabled={busy}>
							{#each edgeAliasAnnotationObjectExamples as example}
								<option value={example.value}>{example.label}</option>
							{/each}
						</Select>
					</div>
					<Textarea
						name="edgeAliasAnnotationObject"
						bind:value={edgeAliasAnnotationObjectStr}
						disabled={busy}
						color={Is.arrayValue(validationErrors.edgeAliasAnnotationObject) ? 'error' : 'default'}
						class="min-h-40 text-sm"
					/>
					<ValidationError validationErrors={validationErrors.edgeAliasAnnotationObject} />
				</Label>
			{/snippet}

			{#snippet afterAction()}
				{#if Is.stringValue(progress)}
					<P>{progress}</P>
				{/if}
			{/snippet}
		</ValidatedForm>
	{:else}
		<Card class="flex flex-col gap-5">
			<Heading tag="h5">{$i18n('pages.documentProperties.resultTitle')}</Heading>
			{#if Is.stringValue(itemId)}
				<Label>
					{$i18n('pages.documentProperties.documentId')}
					<Span>{documentId}</Span>
				</Label>
				<Label>
					{$i18n('pages.documentProperties.auditableItemGraphId')}
					<Span>{itemId}</Span>
				</Label>
			{/if}
			<Button on:click={async () => close()}>{$i18n('actions.close')}</Button>
		</Card>
	{/if}
</section>
