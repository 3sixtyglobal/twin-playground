<!-- Copyright 2024 IOTA Stiftung. -->
<!-- SPDX-License-Identifier: Apache-2.0. -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { IAuditableItemGraphVertex } from '@twin.org/auditable-item-graph-models';
	import { Is } from '@twin.org/core';
	import {
		Button,
		Heading,
		i18n,
		Icons,
		Spinner,
		P,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Pagination,
		Card,
		Input,
		Label
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import type { IUserDocumentEntry } from '$models/IUserDocumentEntry';
	import { documentQuery } from '$stores/document';
	import { documentEntryList } from '$stores/documents';
	import { CursorStackHandler } from '$utils/shared/cursorStackHandler';

	const cursorHandler = new CursorStackHandler();

	let items: IUserDocumentEntry[] | undefined = $state();
	let busy = $state(false);
	let status = $state('');
	let isError = $state(false);
	let searchDocumentId = $state('');
	let isSearchMode = $state(false);

	let canGoBackwards = $derived(cursorHandler.canGoBackwards());
	let canGoForwards = $derived(cursorHandler.canGoForwards());

	async function loadData(): Promise<void> {
		status = $i18n('pages.document.loading');
		busy = true;
		isError = false;

		try {
			if (isSearchMode && searchDocumentId.trim()) {
				const result = await documentQuery(searchDocumentId, cursorHandler.getCurrentCursor());

				if (Is.stringValue(result?.error)) {
					isError = true;
					status = result.error;
				} else if (result?.item?.itemListElement) {
					items = result.item.itemListElement.map((vertex: IAuditableItemGraphVertex) => {
						let documentId = '';

						if (Is.arrayValue(vertex.resources)) {
							documentId = (vertex.resources[0]?.resourceObject?.documentId as string) ?? '';
						}

						return {
							id: vertex.id,
							documentId,
							dateCreated: vertex.dateCreated ?? new Date().toISOString()
						};
					});

					cursorHandler.updateCursor(result.cursor);
					canGoBackwards = cursorHandler.canGoBackwards();
					canGoForwards = cursorHandler.canGoForwards();

					if (!Is.arrayValue(items)) {
						status = $i18n('pages.document.noSearchResults');
					} else {
						status = '';
					}
				} else {
					items = [];
					status = $i18n('pages.document.noSearchResults');
				}
			} else {
				isSearchMode = false;
				const result = await documentEntryList(cursorHandler.getCurrentCursor());

				if (Is.stringValue(result?.error)) {
					isError = true;
					status = result.error;
				} else {
					items = result?.items ?? [];
					cursorHandler.updateCursor(result?.cursor);

					canGoBackwards = cursorHandler.canGoBackwards();
					canGoForwards = cursorHandler.canGoForwards();

					if (!Is.arrayValue(items)) {
						status = $i18n('pages.document.noItems');
					} else {
						status = '';
					}
				}
			}
		} finally {
			busy = false;
		}
	}

	async function loadPrevious(): Promise<void> {
		cursorHandler.goBackwards();
		await loadData();
	}

	async function loadNext(): Promise<void> {
		cursorHandler.goForwards();
		await loadData();
	}

	async function search(): Promise<void> {
		try {
			isSearchMode = Boolean(searchDocumentId.trim());
			cursorHandler.reset();
			await loadData();
		} catch (error) {
			isError = true;
			status = error?.toString() ?? 'Search failed';
			busy = false;
		}
	}

	async function clearSearch(): Promise<void> {
		isSearchMode = false;
		searchDocumentId = '';
		cursorHandler.reset();
		await loadData();
		busy = false;
	}

	onMount(async () => {
		await loadData();
	});
</script>

<section class="flex flex-col items-start justify-center gap-5">
	<Heading tag="h4">{$i18n('pages.document.title')}</Heading>
	<Card class="w-full max-w-full rounded-lg border border-gray-300 p-4">
		<div class="flex flex-col gap-4 md:flex-row md:items-end">
			<Label class="w-full">
				{$i18n('pages.document.searchById')}
				<Input
					name="searchDocumentId"
					placeholder={$i18n('pages.document.searchPlaceholder')}
					bind:value={searchDocumentId}
					disabled={busy}
				/>
			</Label>
			<div class="flex flex-row gap-2">
				<Button onclick={search} disabled={busy || !searchDocumentId.trim()}>
					{$i18n('common.labels.search')}
				</Button>
				{#if isSearchMode}
					<Button onclick={clearSearch} disabled={busy}>
						{$i18n('common.labels.clear')}
					</Button>
				{/if}
			</div>
		</div>
	</Card>
	<div class="items-left flex flex-col justify-between gap-2 sm:w-full sm:flex-row sm:items-center">
		<div class="flex flex-row gap-2">
			{#if busy}
				<Spinner />
			{/if}
		</div>
		<Button onclick={() => goto('/secure/document/create')} disabled={busy}
			>{$i18n('pages.document.createItem')}</Button
		>
	</div>

	{#if Is.stringValue(status)}
		<P class={isError ? 'text-red-600' : ''}>{status}</P>
	{/if}

	{#if Is.arrayValue(items)}
		<Table>
			<TableHead>
				<TableHeadCell>{$i18n('pages.document.documentId')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.document.graphId')}</TableHeadCell>
				<TableHeadCell>{$i18n('common.labels.dateCreated')}</TableHeadCell>
				<TableHeadCell>{$i18n('common.labels.actions')}</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each items as item}
					<TableBodyRow>
						<TableBodyCell wrap>
							{item.documentId}
						</TableBodyCell>
						<TableBodyCell wrap>{item.id}</TableBodyCell>
						<TableBodyCell>{new Date(item.dateCreated ?? '').toLocaleString()}</TableBodyCell>
						<TableBodyCell class="flex flex-row gap-2">
							<Button
								size="xs"
								color="plain"
								onclick={() => goto(`/secure/document/${item.id}?edit=true`)}
								><Icons.EditOutline /></Button
							>
							<Button
								size="xs"
								color="plain"
								onclick={() => goto(`/secure/document/${item.id}/view`)}><Icons.EyeSolid /></Button
							><Button
								size="xs"
								color="plain"
								onclick={() => goto(`/secure/document/${item.id}/extract`)}
								><Icons.ArrowRightAltOutline /></Button
							>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {loadNext} {loadPrevious} {canGoBackwards} {canGoForwards} disabled={busy} />
	{/if}
</section>
