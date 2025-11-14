<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import type { IAuditableItemStream } from '@twin.org/auditable-item-stream-models';
	import { Is } from '@twin.org/core';
	import {
		Button,
		Heading,
		i18n,
		Icons,
		ModalYesNo,
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
	import { auditableItemStreamList, auditableItemStreamRemove } from '$stores/auditableItemStreams';
	import { CursorStackHandler } from '$utils/shared/cursorStackHandler';

	const cursorHandler = new CursorStackHandler();

	let items: IAuditableItemStream[] | undefined = $state();
	let busy = $state(false);
	let status = $state('');
	let isError = $state(false);
	let confirmationId: string = $state('');
	let modalIsBusy = $state(false);

	let canGoBackwards = $derived(cursorHandler.canGoBackwards());
	let canGoForwards = $derived(cursorHandler.canGoForwards());

	async function loadData(): Promise<void> {
		status = $i18n('pages.auditableItemStream.loading');
		busy = true;
		isError = false;
		const result = await auditableItemStreamList(cursorHandler.getCurrentCursor());

		if (Is.stringValue(result?.error)) {
			isError = true;
			status = result.error;
		} else {
			items = result?.items ?? [];

			cursorHandler.updateCursor(result?.cursor);

			canGoBackwards = cursorHandler.canGoBackwards();
			canGoForwards = cursorHandler.canGoForwards();

			if (items.length === 0) {
				status = $i18n('pages.auditableItemStream.noItems');
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

	async function removePrompt(id: string): Promise<void> {
		confirmationId = id;
	}

	async function removeCancel(): Promise<void> {
		confirmationId = '';
		modalIsBusy = false;
	}

	async function remove(): Promise<void> {
		if (Is.stringValue(confirmationId)) {
			modalIsBusy = true;
			await auditableItemStreamRemove(confirmationId);
			await loadData();
			confirmationId = '';
			modalIsBusy = false;
		}
	}

	onMount(async () => {
		await loadData();
	});
</script>

<section class="flex flex-col items-start justify-center gap-5">
	<Heading tag="h4">{$i18n('pages.auditableItemStream.title')}</Heading>
	<div class="items-left flex flex-col justify-between gap-2 sm:w-full sm:flex-row sm:items-center">
		<div class="flex flex-row gap-2">
			{#if busy}
				<Spinner />
			{/if}
		</div>
		<Button onclick={() => goto('/secure/auditable-item-stream/create')} disabled={busy}
			>{$i18n('pages.auditableItemStream.createItem')}</Button
		>
	</div>

	{#if Is.stringValue(status)}
		<P class={isError ? 'text-red-600' : ''}>{status}</P>
	{/if}

	{#if Is.arrayValue(items)}
		<Table>
			<TableHead>
				<TableHeadCell>{$i18n('pages.auditableItemStream.id')}</TableHeadCell>
				<TableHeadCell>{$i18n('common.labels.dateCreated')}</TableHeadCell>
				<TableHeadCell>{$i18n('common.labels.dateModified')}</TableHeadCell>
				<TableHeadCell>{$i18n('common.labels.actions')}</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each items as item}
					<TableBodyRow>
						<TableBodyCell wrap>{item.id}</TableBodyCell>
						<TableBodyCell wrap>{new Date(item.dateCreated).toLocaleString()}</TableBodyCell>
						<TableBodyCell wrap
							>{Is.stringValue(item.dateModified)
								? new Date(item.dateModified).toLocaleString()
								: ''}</TableBodyCell
						>
						<TableBodyCell class="flex flex-row gap-2"
							><Button
								size="xs"
								color="plain"
								onclick={() => goto(`/secure/auditable-item-stream/${item.id}`)}
								><Icons.EditOutline /></Button
							><Button
								size="xs"
								color="plain"
								onclick={() => goto(`/secure/auditable-item-stream/${item.id}/entries`)}
								><Icons.ListOutline /></Button
							><Button
								size="xs"
								color="plain"
								onclick={() => goto(`/secure/auditable-item-stream/${item.id}/view`)}
								><Icons.EyeOutline /></Button
							><Button size="xs" color="plain" onclick={async () => removePrompt(item.id)}
								><Icons.TrashBinOutline /></Button
							>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {loadNext} {loadPrevious} {canGoBackwards} {canGoForwards} disabled={busy} />
		<ModalYesNo
			title={$i18n('pages.auditableItemStream.deleteTitle')}
			open={Is.stringValue(confirmationId)}
			message={$i18n('pages.auditableItemStream.deleteMessage')}
			busy={modalIsBusy}
			yesColor="error"
			yesAction={async () => remove()}
			noAction={async () => removeCancel()}
		/>
	{/if}
</section>
