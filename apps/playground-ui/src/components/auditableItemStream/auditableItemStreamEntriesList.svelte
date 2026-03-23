<script lang="ts">
	import { goto } from '$app/navigation';
	import { Is } from '@twin.org/core';
	import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';
	import {
		Button,
		Clipboard,
		Error,
		Heading,
		i18n,
		Icons,
		Label,
		ModalYesNo,
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
	import {
		auditableItemStreamGetEntries,
		auditableItemStreamRemoveEntry
	} from '$stores/auditableItemStreams';
	import { CursorStackHandler } from '$utils/shared/cursorStackHandler';

	interface Props {
		streamId: string;
	}

	let { streamId }: Props = $props();
	let busy = $state(false);
	let error = $state('');
	let entries: { entryId: string; entryObject: IJsonLdNodeObject }[] = $state([]);
	let confirmationId: string | undefined = $state();
	let modalIsBusy = $state(false);

	const cursorHandler = new CursorStackHandler();

	let canGoBackwards = $derived(cursorHandler.canGoBackwards());
	let canGoForwards = $derived(cursorHandler.canGoForwards());

	async function loadData(): Promise<void> {
		busy = true;
		const result = await auditableItemStreamGetEntries(streamId, {
			limit: 10,
			cursor: cursorHandler.getCurrentCursor()
		});

		if (result?.error) {
			error = result.error;
		} else if (result?.entries) {
			entries = result.entries;
			cursorHandler.updateCursor(result?.cursor);

			canGoBackwards = cursorHandler.canGoBackwards();
			canGoForwards = cursorHandler.canGoForwards();
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

	async function close(): Promise<void> {
		await goto('/secure/auditable-item-stream');
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
			await auditableItemStreamRemoveEntry(streamId, confirmationId);
			await loadData();
			confirmationId = '';
			modalIsBusy = false;
		}
	}

	async function copyEntryData(entry: IJsonLdNodeObject): Promise<void> {
		await Clipboard.copy(JSON.stringify(entry));
	}

	onMount(async () => {
		await loadData();
	});
</script>

<section class="flex flex-col items-start justify-center gap-5">
	<div class="flex w-full flex-row justify-between">
		<div class="flex flex-col">
			<Heading tag="h5">{$i18n('pages.auditableItemStreamEntriesList.title')}</Heading>
		</div>
		{#if busy}
			<Spinner />
		{/if}
	</div>

	<Error {error} />

	<div class="mt-4 mb-4 flex w-full flex-row justify-end gap-2">
		<Button
			onclick={async () => {
				await goto(`/secure/auditable-item-stream/${streamId}/entries/create`);
			}}
		>
			<Icons.PlusOutline class="mr-2" />
			{$i18n('pages.auditableItemStreamEntriesList.addEntry')}
		</Button>
	</div>

	{#if Is.arrayValue(entries)}
		<Table>
			<TableHead>
				<TableHeadCell>{$i18n('pages.auditableItemStreamEntriesList.entryId')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.auditableItemStreamEntriesList.entryType')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.auditableItemStreamEntriesList.details')}</TableHeadCell>
				<TableHeadCell>{$i18n('common.labels.actions')}</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each entries as entry}
					<TableBodyRow>
						<TableBodyCell wrap>
							{entry.entryId}
						</TableBodyCell>
						<TableBodyCell>
							{entry.entryObject?.['@type'] ?? 'Unknown'}
						</TableBodyCell>
						<TableBodyCell wrap>
							{JSON.stringify(entry.entryObject)}
						</TableBodyCell>
						<TableBodyCell class="flex flex-row gap-2">
							<Button
								size="xs"
								color="plain"
								onclick={() =>
									goto(`/secure/auditable-item-stream/${streamId}/entries/${entry.entryId}`)}
							>
								<Icons.EditOutline />
							</Button>
							<Button size="xs" color="plain" onclick={async () => copyEntryData(entry)}>
								<Icons.ClipboardOutline />
							</Button>
							<Button size="xs" color="plain" onclick={async () => removePrompt(entry.entryId)}
								><Icons.TrashBinOutline /></Button
							>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>

		<Pagination {loadNext} {loadPrevious} {canGoBackwards} {canGoForwards} disabled={busy} />
		<ModalYesNo
			title={$i18n('pages.auditableItemStreamEntriesList.deleteTitle')}
			open={Is.stringValue(confirmationId)}
			message={$i18n('pages.auditableItemStreamEntriesList.deleteMessage')}
			busy={modalIsBusy}
			yesColor="error"
			yesAction={async () => remove()}
			noAction={async () => removeCancel()}
		/>
	{:else}
		<Label>
			{$i18n('pages.auditableItemStreamEntriesList.noEntries')}
		</Label>
	{/if}

	<div class="flex w-full justify-start">
		<Button onclick={close}>{$i18n('actions.close')}</Button>
	</div>
</section>
