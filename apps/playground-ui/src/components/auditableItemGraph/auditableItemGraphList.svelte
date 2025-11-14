<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import type {
		IAuditableItemGraphVertex,
		IAuditableItemGraphVertexList
	} from '@twin.org/auditable-item-graph-models';
	import { Is } from '@twin.org/core';
	import {
		Button,
		Heading,
		i18n,
		Icons,
		P,
		Pagination,
		Spinner,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { auditableItemGraphList } from '$stores/auditableItemGraphs';
	import { CursorStackHandler } from '$utils/shared/cursorStackHandler';

	const cursorHandler = new CursorStackHandler();

	let items: IAuditableItemGraphVertex[] | undefined = $state();
	let auditableItemGraphInfo: IAuditableItemGraphVertexList | undefined;
	let busy = $state(false);
	let status = $state('');
	let isError = $state(false);

	let canGoBackwards = $derived(cursorHandler.canGoBackwards());
	let canGoForwards = $derived(cursorHandler.canGoForwards());

	async function loadData(): Promise<void> {
		status = $i18n('pages.auditableItemGraphList.loading');
		busy = true;
		isError = false;
		const result = await auditableItemGraphList(cursorHandler.getCurrentCursor());

		if (Is.stringValue(result?.error)) {
			isError = true;
			status = result.error;
		} else {
			auditableItemGraphInfo = result?.items ?? undefined;
			items = auditableItemGraphInfo?.itemListElement;
			cursorHandler.updateCursor(result?.cursor);

			canGoBackwards = cursorHandler.canGoBackwards();
			canGoForwards = cursorHandler.canGoForwards();

			if (!Is.arrayValue(items)) {
				status = $i18n('pages.auditableItemGraphList.noItems');
			} else {
				status = '';
			}
		}

		busy = false;
	}

	async function loadPrevious(): Promise<void> {
		cursorHandler.goBackwards();
		await loadData();
	}

	async function loadNext(): Promise<void> {
		cursorHandler.goForwards();
		await loadData();
	}

	onMount(async () => {
		await loadData();
	});
</script>

<section class="flex flex-col items-start justify-center gap-5">
	<Heading tag="h4">{$i18n('pages.auditableItemGraphList.title')}</Heading>
	<div class="items-left flex flex-col justify-between gap-2 sm:w-full sm:flex-row sm:items-center">
		<div class="flex flex-row gap-2">
			{#if busy}
				<Spinner />
			{/if}
		</div>
		<Button onclick={() => goto('/secure/auditable-item-graph/create')} disabled={busy}
			>{$i18n('pages.auditableItemGraphList.createItem')}</Button
		>
	</div>

	{#if Is.stringValue(status)}
		<P class={isError ? 'text-red-600' : ''}>{status}</P>
	{/if}

	{#if Is.arrayValue(items)}
		<Table>
			<TableHead>
				<TableHeadCell>{$i18n('pages.auditableItemGraphList.vertexId')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.auditableItemGraphList.annotationObjectType')}</TableHeadCell>
				<TableHeadCell>{$i18n('common.labels.actions')}</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each items as item}
					<TableBodyRow>
						<TableBodyCell wrap>{item.id}</TableBodyCell>
						<TableBodyCell>{item.annotationObject?.['@type']}</TableBodyCell>
						<TableBodyCell class="flex flex-row gap-2"
							><Button
								size="xs"
								color="plain"
								onclick={() => goto(`/secure/auditable-item-graph/${item.id}`)}
								><Icons.EditOutline /></Button
							><Button
								size="xs"
								color="plain"
								onclick={() => goto(`/secure/auditable-item-graph/${item.id}/changesets`)}
								><Icons.OrderedListOutline /></Button
							></TableBodyCell
						>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {loadNext} {loadPrevious} {canGoBackwards} {canGoForwards} disabled={busy} />
	{/if}
</section>
