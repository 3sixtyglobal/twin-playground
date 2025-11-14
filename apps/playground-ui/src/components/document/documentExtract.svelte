<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is } from '@twin.org/core';
	import type { IRuleGroup } from '@twin.org/data-processing-models';
	import type { IDocument } from '@twin.org/document-management-models';
	import {
		Button,
		Card,
		Error,
		Heading,
		i18n,
		Icons,
		Label,
		Span,
		Spinner,
		Select,
		Code,
		Clipboard
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import BlobViewer from '$components/blob/blobViewer.svelte';
	import { ruleGroupQuery } from '$stores/dataProcessing';
	import { documentGet, documentRevisionGet } from '$stores/document';

	interface Props {
		itemId?: string | undefined;
	}

	let { itemId = undefined }: Props = $props();
	let documentData: IDocument | undefined = $state();
	let error: string | undefined = $state();
	let busy = $state(true);
	let documentDataExtracted = $state(false);
	let dataExtracted: object | undefined = $state();

	let ruleGroups: IRuleGroup[] = $state([]);
	let selectedRuleGroupId = $state('');
	let ruleGroupsBusy = $state(false);
	let ruleGroupsError = $state('');

	async function loadData(cursor?: string): Promise<void> {
		if (!itemId) {
			return;
		}

		busy = true;
		error = '';

		const result = await documentGet(itemId, { includeBlobStorageData: true });

		if (Is.stringValue(result?.error)) {
			error = result.error;
		} else if (Is.arrayValue(result?.item?.itemListElement)) {
			documentData = result.item.itemListElement[0];
		}

		busy = false;
	}

	onMount(async () => {
		await loadData();

		ruleGroupsBusy = true;
		const ruleGroupsResult = await ruleGroupQuery();
		if (Is.stringValue(ruleGroupsResult?.error)) {
			ruleGroupsError = ruleGroupsResult.error;
		} else {
			ruleGroups = ruleGroupsResult?.entities ?? [];
		}
		ruleGroupsBusy = false;
	});

	async function extractDocumentData(documentRevision?: number): Promise<void> {
		if (!itemId) {
			documentDataExtracted = false;
			return;
		}

		const data = await documentRevisionGet(itemId, documentRevision ?? 0, {
			extractRuleGroupId: selectedRuleGroupId
		});

		if (Is.objectValue(data?.error)) {
			error = data.error;
			documentDataExtracted = false;
			return;
		}
		if (Is.objectValue(data?.item?.extractedData)) {
			dataExtracted = data.item.extractedData;
			documentDataExtracted = true;
		}
	}

	async function copyExtractedData(entry: unknown): Promise<void> {
		await Clipboard.copy(JSON.stringify(entry, null, 2));
	}
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('pages.documentExtract.title')}</Heading>
		{#if busy}
			<Spinner />
		{/if}
	</div>
	{#if !busy}
		<div class="flex flex-col justify-between gap-4">
			<div class="flex flex-col justify-between gap-4 md:flex-row">
				<div class="flex flex-col gap-4">
					<Label>
						{$i18n('pages.documentExtract.id')}
						<Span>{documentData?.id}</Span>
					</Label>
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-4">
			<Label>
				{$i18n('pages.documentExtract.fileContent')}
			</Label>
			<BlobViewer
				blob={documentData?.blobStorageEntry?.blob}
				encodingFormat={documentData?.blobStorageEntry?.encodingFormat}
			/>

			{#if Is.arrayValue(ruleGroups)}
				<Label>
					{$i18n('pages.documentExtract.chooseRule')}
					<div class="flex flex-col gap-2">
						<Select class="w-60" bind:value={selectedRuleGroupId}>
							<option value="">-- {$i18n('pages.documentExtract.selectOption')} --</option>
							{#each ruleGroups as ruleGroup}
								<option value={ruleGroup.id}>{ruleGroup.label}</option>
							{/each}
						</Select>
						{#if ruleGroupsBusy}
							<Spinner />
						{/if}
						{#if ruleGroupsError}
							<Error error={ruleGroupsError} />
						{/if}
					</div>
				</Label>
				<Button
					class="w-40"
					onclick={async () => extractDocumentData(documentData?.documentRevision)}
				>
					{$i18n('pages.documentExtract.extractData')}
				</Button>
			{/if}

			{#if documentDataExtracted}
				<Label>
					{$i18n('pages.documentExtract.dataExtracted')}
				</Label>
				<Code class="h-40 overflow-auto">{JSON.stringify(dataExtracted, null, 2)}</Code>
				<Button
					class="w-10"
					color="plain"
					size="xs"
					onclick={async () => copyExtractedData(dataExtracted)}
				>
					<Icons.ClipboardCleanSolid />
				</Button>
			{/if}
		</div>
		<Error {error} />
	{/if}
</Card>
