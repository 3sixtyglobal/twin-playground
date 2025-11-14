<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is } from '@twin.org/core';
	import type { ILogEntry, LogLevel } from '@twin.org/logging-models';
	import {
		Heading,
		i18n,
		Spinner,
		P,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Pagination,
		Label,
		Input,
		Button,
		Select,
		Card,
		Icons,
		Tooltip,
		Clipboard
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { loggingQuery } from '$stores/logging';
	import { CursorStackHandler } from '$utils/shared/cursorStackHandler';

	const cursorHandler = new CursorStackHandler();
	const logLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

	let entities: ILogEntry[] | undefined = $state();
	let busy = $state(false);
	let status = $state('');
	let level: LogLevel | undefined = $state(undefined);
	let source: string | undefined = $state(undefined);
	let timeStart: string | undefined = $state(undefined);
	let timeEnd: string | undefined = $state(undefined);
	let limit = $state(50);
	let isError = $state(false);

	let canGoBackwards = $derived(cursorHandler.canGoBackwards());
	let canGoForwards = $derived(cursorHandler.canGoForwards());

	async function loadData(): Promise<void> {
		status = $i18n('pages.logging.loading');
		busy = true;
		isError = false;
		const validTimeStart = timeStart ? new Date(timeStart).getTime() : undefined;
		const validTimeEnd = timeEnd ? new Date(timeEnd).getTime() : undefined;

		const result = await loggingQuery(
			level,
			source,
			validTimeStart,
			validTimeEnd,
			cursorHandler.getCurrentCursor(),
			limit
		);

		if (Is.stringValue(result?.error)) {
			isError = true;
			status = result.error;
		} else {
			entities = result?.entities ?? [];
			cursorHandler.updateCursor(result?.cursor);

			canGoBackwards = cursorHandler.canGoBackwards();
			canGoForwards = cursorHandler.canGoForwards();

			if (entities.length === 0) {
				status = $i18n('pages.logging.noItems');
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

	async function action(): Promise<void> {
		cursorHandler.reset();

		if (source === '') {
			source = undefined;
		}
		if (!Is.number(limit) || limit < 1) {
			limit = 50;
		}
		if (timeStart === '') {
			timeStart = undefined;
		}
		if (timeEnd === '') {
			timeEnd = undefined;
		}

		await loadData();
	}

	async function copyData(data?: object): Promise<void> {
		if (!data) {
			return;
		}
		await Clipboard.copy(JSON.stringify(data));
	}

	onMount(async () => {
		await loadData();
	});
</script>

<section class="flex flex-col items-start justify-center gap-5">
	<Heading tag="h4">{$i18n('pages.logging.title')}</Heading>
	<div class="items-left flex flex-col justify-between gap-2 sm:w-full sm:flex-row sm:items-center">
		<div class="flex flex-row gap-2">
			{#if busy}
				<Spinner />
			{/if}
		</div>
	</div>

	<Card class="w-full max-w-full rounded-lg border border-gray-300 p-4">
		<div class="block flex-row gap-2 lg:flex">
			<Label>
				{$i18n('pages.loggingProperties.limit')}
				<Input
					name="limit"
					placeholder={$i18n('pages.loggingProperties.limit')}
					color="default"
					bind:value={limit}
					disabled={busy}
					type="number"
				></Input>
			</Label>
			<Label>
				{$i18n('pages.loggingProperties.level')}
				<Select bind:value={level} disabled={busy}>
					<option value={undefined}>ALL</option>
					{#each logLevels as logLevel}
						<option value={logLevel}>{logLevel.toUpperCase()}</option>
					{/each}
				</Select>
			</Label>
			<Label>
				{$i18n('pages.loggingProperties.source')}
				<Input
					name="source"
					placeholder={$i18n('pages.loggingProperties.source')}
					color="default"
					bind:value={source}
					disabled={busy}
				></Input>
			</Label>
			<Label>
				{$i18n('pages.loggingProperties.timeStart')}
				<Input
					name="timeStart"
					placeholder={$i18n('pages.loggingProperties.timeStart')}
					color="default"
					bind:value={timeStart}
					type="date"
					disabled={busy}
				></Input>
			</Label>
			<Label>
				{$i18n('pages.loggingProperties.timeEnd')}
				<Input
					name="timeEnd"
					placeholder={$i18n('pages.loggingProperties.timeEnd')}
					color="default"
					bind:value={timeEnd}
					type="date"
					disabled={busy}
				></Input>
			</Label>
			<Button class="mt-6 max-w-20" onclick={async () => action()} disabled={busy}>
				{$i18n('pages.logging.action')}
			</Button>
		</div>
	</Card>

	{#if Is.stringValue(status)}
		<P class={isError ? 'text-red-600' : ''}>{status}</P>
	{/if}

	{#if Is.arrayValue(entities)}
		<Table>
			<TableHead>
				<TableHeadCell>{$i18n('pages.loggingProperties.level')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.loggingProperties.source')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.loggingProperties.message')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.loggingProperties.error')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.loggingProperties.data')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.loggingProperties.ts')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.logging.actions')}</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each entities as item}
					<TableBodyRow>
						<TableBodyCell>{item.level}</TableBodyCell>
						<TableBodyCell>{item.source}</TableBodyCell>
						<TableBodyCell wrap>{item.message}</TableBodyCell>
						<TableBodyCell wrap>
							{#if item.error && JSON.stringify(item.error).length > 50}
								{JSON.stringify(item.error).slice(0, 50)}...
							{:else}
								{JSON.stringify(item.error)}
							{/if}
						</TableBodyCell>
						<TableBodyCell wrap>
							{#if item.data && JSON.stringify(item.data).length > 50}
								{JSON.stringify(item.data).slice(0, 50)}...
							{:else}
								{JSON.stringify(item.data)}
							{/if}
						</TableBodyCell>
						<TableBodyCell wrap>{item.ts ? new Date(item.ts).toLocaleString() : ''}</TableBodyCell>
						<TableBodyCell class="flex flex-row gap-2">
							<Button size="xs" color="plain" onclick={async () => copyData(item)}>
								<Icons.ClipboardListOutline />
							</Button>
							<Tooltip>{$i18n('pages.logging.copyAllClipboard')}</Tooltip>
							<Button size="xs" color="plain" onclick={async () => copyData(item.data)}>
								<Icons.ClipboardCheckOutline />
							</Button>
							<Tooltip>{$i18n('pages.logging.copyDataClipboard')}</Tooltip>
							<Button size="xs" color="plain" onclick={async () => copyData(item.error)}>
								<Icons.ExclamationCircleOutline />
							</Button>
							<Tooltip>{$i18n('pages.logging.copyErrorClipboard')}</Tooltip>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {loadNext} {loadPrevious} {canGoBackwards} {canGoForwards} disabled={busy} />
	{/if}
</section>
