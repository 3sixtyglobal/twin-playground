<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Converter, Is, Coerce, Urn } from '@twin.org/core';
	import type { IDocument } from '@twin.org/document-management-models';
	import { UneceDocumentCodes } from '@twin.org/standards-unece';
	import {
		Button,
		Card,
		Error,
		Heading,
		i18n,
		Icons,
		Label,
		QR,
		Span,
		Spinner,
		Modal,
		ModalYesNo,
		Table,
		TableHead,
		TableHeadCell,
		TableBody,
		TableBodyRow,
		TableBodyCell
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import BlobViewer from '$components/blob/blobViewer.svelte';
	import { createPrivateUrl } from '$stores/app';
	import { documentGet, documentRevisionGet, documentRemoveRevision } from '$stores/document';
	import { attestationIdToNftId, createExplorerNftUrl } from '$stores/iota';

	export let itemId: string | undefined = undefined;
	let documentData: IDocument | undefined;
	let documentId: string | undefined;
	let documentIdFormat: string | undefined;
	let documentCode: string | undefined;
	let error: string;
	let busy = true;
	let documentList: IDocument[] = [];
	let showDocumentModal = false;
	let selectedDocument: IDocument | undefined;
	let documentModalLoading = false;

	let showDeleteConfirmModal = false;
	let deleteModalIsBusy = false;
	let documentRevisionToDelete: number | undefined;

	let hasDeletedDocuments = false;
	let showDeletedDocuments = false;
	let filteredDocumentList: IDocument[] = [];
	let exploreUrl: string | undefined;

	const documentTypes = [
		{ value: UneceDocumentCodes.BillOfLading, label: 'BillOfLading' },
		{ value: UneceDocumentCodes.PhytosanitaryCertificate, label: 'PhytosanitaryCertificate' },
		{ value: UneceDocumentCodes.ExportLicence, label: 'ExportLicence' },
		{ value: UneceDocumentCodes.CustomsClearanceNotice, label: 'CustomsClearanceNotice' },
		{ value: UneceDocumentCodes.DeclarationOfOrigin, label: 'DeclarationOfOrigin' }
	];

	async function loadData(cursor?: string): Promise<void> {
		if (!itemId) {
			return;
		}

		busy = true;
		error = '';

		const result = await documentGet(
			itemId,
			{
				includeBlobStorageMetadata: false,
				includeBlobStorageData: false,
				includeAttestation: false,
				includeRemoved: true
			},
			cursor,
			20
		);

		if (Is.stringValue(result?.error)) {
			error = result.error;
			busy = false;
			return;
		} else if (Is.arrayValue(result?.item?.itemListElement)) {
			documentList = [...result.item.itemListElement];

			hasDeletedDocuments = documentList.some(doc => Is.stringValue(doc.dateDeleted));
			updateFilteredDocuments();

			let targetDocument;

			if (Is.stringValue(cursor)) {
				const cursorNum = Coerce.integer(cursor);
				if (Is.number(cursorNum)) {
					targetDocument = documentList.find(doc => doc.documentRevision === cursorNum);
				}
			} else {
				targetDocument = documentList[0];
			}

			if (targetDocument) {
				documentData = targetDocument;
			} else {
				error = $i18n('pages.documentView.noDocumentsFound');
				busy = false;
				return;
			}
		} else {
			error = $i18n('pages.documentView.noDocumentsFound');
			busy = false;
			return;
		}

		documentId = documentData?.documentId;
		documentIdFormat = documentData?.documentIdFormat;
		documentCode = documentData?.documentCode;

		busy = false;
	}

	function updateFilteredDocuments(): void {
		if (showDeletedDocuments) {
			filteredDocumentList = [...documentList];
		} else {
			filteredDocumentList = documentList.filter(doc => !Is.stringValue(doc.dateDeleted));
		}
	}

	function toggleDeletedDocuments(): void {
		showDeletedDocuments = !showDeletedDocuments;
		updateFilteredDocuments();
	}

	onMount(async () => {
		await loadData();
	});

	function openExplorer(): void {
		window.open(exploreUrl, '_blank');
	}

	async function viewDocumentDetails(document: IDocument): Promise<void> {
		selectedDocument = document;
		showDocumentModal = true;
		documentModalLoading = true;
		exploreUrl = undefined;

		if (!itemId) {
			documentModalLoading = false;
			return;
		}

		try {
			const revision = await documentRevisionGet(itemId, document.documentRevision, {
				includeBlobStorageMetadata: true,
				includeBlobStorageData: true,
				includeAttestation: true,
				includeRemoved: false
			});

			document.blobStorageEntry = revision?.item?.blobStorageEntry;

			if (revision?.item?.attestationInformation?.id) {
				const attestationId = revision.item.attestationInformation.id;
				const nftId = attestationIdToNftId(attestationId);
				const urn = Urn.fromValidString(nftId);

				if (urn.namespaceMethod() === 'iota') {
					exploreUrl = createExplorerNftUrl(nftId);
				}
			}
		} finally {
			documentModalLoading = false;
		}
	}

	function downloadSelectedDocument(document?: IDocument): void {
		if (!document?.blobStorageEntry?.blob) {
			return;
		}

		const a = globalThis.document.createElement('a');
		const blob = new Blob(
			[new Uint8Array(Converter.base64ToBytes(document.blobStorageEntry.blob))],
			{
				type: document.blobStorageEntry.encodingFormat ?? 'application/octet-stream'
			}
		);
		const url = URL.createObjectURL(blob);
		a.href = url;
		const encodingFormat = document.blobStorageEntry.encodingFormat ?? '';
		const extension = encodingFormat.split('/').pop() ?? 'bin';
		a.download = `${document.documentId}.${extension}`;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function removePrompt(revision?: number): Promise<void> {
		if (!revision) {
			return;
		}
		documentRevisionToDelete = revision;
		showDeleteConfirmModal = true;
	}

	async function removeCancel(): Promise<void> {
		documentRevisionToDelete = undefined;
		showDeleteConfirmModal = false;
		deleteModalIsBusy = false;
	}

	async function remove(): Promise<void> {
		if (!itemId || !documentRevisionToDelete) {
			return;
		}

		deleteModalIsBusy = true;
		const result = await documentRemoveRevision(itemId, documentRevisionToDelete);

		if (Is.stringValue(result?.error)) {
			error = result.error;
		} else {
			await loadData();
		}

		documentRevisionToDelete = undefined;
		showDeleteConfirmModal = false;
		deleteModalIsBusy = false;
	}
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('pages.documentView.title')}</Heading>
		{#if busy}
			<Spinner />
		{/if}
	</div>
	{#if !busy}
		<div class="flex flex-col justify-between gap-4">
			<div class="flex flex-col justify-between gap-4 md:flex-row">
				<div class="flex flex-col gap-4">
					<Label>
						{$i18n('pages.documentView.id')}
						<Span>{documentId}</Span>
					</Label>
					{#if Is.stringValue(documentIdFormat)}
						<Label>
							{$i18n('pages.documentView.documentIdFormat')}
							<Span>{documentIdFormat}</Span>
						</Label>
					{/if}
					{#if Is.stringValue(documentCode)}
						<Label>
							{$i18n('pages.documentView.documentCode')}
							<Span
								>{documentTypes.find(type => type.value === documentCode)?.label ??
									documentCode}</Span
							>
						</Label>
					{/if}
				</div>
				{#if Is.stringValue(itemId)}
					<QR
						qrData={createPrivateUrl(`document/${itemId}`)}
						label={$i18n('pages.documentView.qr')}
						dimensions={128}
					/>
				{/if}
			</div>
		</div>

		{#if documentList && documentList.length > 0}
			<div class="mt-4">
				<div class="mb-2 flex flex-row items-center justify-between">
					<Heading tag="h6">{$i18n('pages.documentView.revisionHistory')}</Heading>
					{#if hasDeletedDocuments}
						<div class="flex items-center gap-3">
							<Label>{$i18n('pages.documentView.showDeletedDocuments')}</Label>
							<div
								class="relative inline-block h-6 w-12 cursor-pointer rounded-full transition-colors duration-200 ease-in-out {showDeletedDocuments
									? 'bg-brand-primary-dark'
									: 'bg-neutral-700'}"
								on:click={toggleDeletedDocuments}
								on:keydown={e => {
									if (e.key === 'Enter' || e.key === ' ') {
										toggleDeletedDocuments();
									}
								}}
								role="switch"
								aria-checked={showDeletedDocuments}
								tabindex="0"
							>
								<span
									class="absolute top-0.5 h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out {showDeletedDocuments
										? 'right-0.5'
										: 'left-0.5'}"
								></span>
							</div>
						</div>
					{/if}
				</div>
				<Table>
					<TableHead>
						<TableHeadCell>{$i18n('pages.documentView.documentRevision')}</TableHeadCell>
						<TableHeadCell>{$i18n('common.labels.dateCreated')}</TableHeadCell>
						{#if showDeletedDocuments}
							<TableHeadCell>{$i18n('common.labels.dateDeleted')}</TableHeadCell>
						{/if}
						<TableHeadCell>{$i18n('common.labels.actions')}</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each filteredDocumentList as document}
							<TableBodyRow>
								<TableBodyCell>{document.documentRevision}</TableBodyCell>
								<TableBodyCell>{new Date(document.dateCreated).toLocaleString()}</TableBodyCell>
								{#if showDeletedDocuments}
									<TableBodyCell>
										{Is.stringValue(document.dateDeleted)
											? new Date(document.dateDeleted).toLocaleString()
											: '-'}
									</TableBodyCell>
								{/if}
								<TableBodyCell class="flex flex-row gap-2">
									<Button
										size="xs"
										color="plain"
										on:click={async () => viewDocumentDetails(document)}
									>
										<Icons.EyeOutline />
									</Button>
									{#if document.documentRevision !== 0 && !Is.stringValue(document.dateDeleted)}
										<Button
											size="xs"
											color="plain"
											on:click={async () => {
												await removePrompt(document.documentRevision);
											}}
										>
											<Icons.TrashBinOutline />
										</Button>
									{/if}
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
			</div>
		{/if}
		<Error {error} />
	{/if}
</Card>

<ModalYesNo
	title={$i18n('pages.documentView.deleteTitle')}
	open={showDeleteConfirmModal}
	message={$i18n('pages.documentView.deleteMessage')}
	busy={deleteModalIsBusy}
	yesColor="error"
	yesAction={async () => remove()}
	noAction={async () => removeCancel()}
/>

<Modal open={showDocumentModal} title={$i18n('pages.documentView.documentDetails')}>
	<div class="flex flex-col gap-4">
		{#if documentModalLoading}
			<div class="flex items-center justify-center p-4">
				<Spinner />
			</div>
		{:else if selectedDocument}
			<div class="flex flex-col gap-4">
				<Label>
					{$i18n('pages.documentView.documentId')}
					<Span>{selectedDocument.documentId}</Span>
				</Label>
				<Label>
					{$i18n('pages.documentView.documentRevision')}
					<Span>{selectedDocument.documentRevision}</Span>
				</Label>
				{#if Is.stringValue(selectedDocument.dateDeleted)}
					<Label>
						{$i18n('common.labels.dateDeleted')}
						<Span>{new Date(selectedDocument.dateDeleted).toLocaleString()}</Span>
					</Label>
				{/if}
				{#if selectedDocument.blobStorageEntry}
					{#if selectedDocument.blobStorageEntry.fileExtension}
						<Label>
							{$i18n('pages.documentView.fileExtension')}
							<Span>{selectedDocument.blobStorageEntry.fileExtension}</Span>
						</Label>
					{/if}
					{#if selectedDocument.blobStorageEntry.encodingFormat}
						<Label>
							{$i18n('pages.documentView.encodingFormat')}
							<Span>{selectedDocument.blobStorageEntry.encodingFormat}</Span>
						</Label>
					{/if}
					<div class="flex flex-row gap-2">
						<Button size="xs" on:click={() => downloadSelectedDocument(selectedDocument)}>
							<Icons.DownloadOutline />
						</Button>
						{#if Is.stringValue(exploreUrl)}
							<Button size="xs" on:click={openExplorer} color="plain" class="gap-2">
								{$i18n('components.attestationView.exploreNft')}<Icons.LinkOutline size="sm" />
							</Button>
						{/if}
					</div>
				{/if}
			</div>

			<div class="flex flex-col gap-4">
				<Label>
					{$i18n('pages.documentView.fileContent')}
				</Label>
				<BlobViewer
					blob={selectedDocument.blobStorageEntry?.blob}
					encodingFormat={selectedDocument.blobStorageEntry?.encodingFormat}
				/>
			</div>
			<div class="flex flex-row justify-end gap-2 pt-2">
				<Button on:click={() => (showDocumentModal = false)}>
					{$i18n('actions.close')}
				</Button>
			</div>
		{/if}
	</div>
</Modal>
