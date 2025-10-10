<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is } from '@twin.org/core';
	import type { ITelemetryMetricValue } from '@twin.org/telemetry-models';
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
		Card,
		Icons,
		Clipboard
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { metricValuesQuery } from '$stores/telemetry';
	import { CursorStackHandler } from '$utils/shared/cursorStackHandler';

	export let itemId: string | undefined = undefined;

	const cursorHandler = new CursorStackHandler();

	let entities: ITelemetryMetricValue[] | undefined;
	let busy = false;
	let status = '';
	let limit = 50;
	let timeStart: string | undefined = undefined;
	let timeEnd: string | undefined = undefined;
	let isError = false;

	$: canGoBackwards = cursorHandler.canGoBackwards();
	$: canGoForwards = cursorHandler.canGoForwards();

	async function loadData(): Promise<void> {
		status = $i18n('pages.telemetry.loading');
		busy = true;
		isError = false;
		const validTimeStart = timeStart ? new Date(timeStart).getTime() : undefined;
		const validTimeEnd = timeEnd ? new Date(timeEnd).getTime() : undefined;

		if (Is.stringValue(itemId)) {
			const result = await metricValuesQuery(
				itemId,
				limit,
				validTimeStart,
				validTimeEnd,
				cursorHandler.getCurrentCursor()
			);

			if (Is.stringValue(result?.error)) {
				isError = true;
				status = result.error;
			} else {
				entities = result?.entities ?? [];
				cursorHandler.updateCursor(result?.cursor);

				canGoBackwards = cursorHandler.canGoBackwards();
				canGoForwards = cursorHandler.canGoForwards();
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

		if (timeStart === '') {
			timeStart = undefined;
		}
		if (timeEnd === '') {
			timeEnd = undefined;
		}

		await loadData();
	}

	async function copyData(data?: ITelemetryMetricValue): Promise<void> {
		if (!data) {
			return;
		}
		await Clipboard.copy(JSON.stringify(data));
	}

	onMount(async () => {
		if (Is.stringValue(itemId)) {
			itemId = encodeURIComponent(itemId);
			await loadData();
		}
	});
</script>

<section class="flex flex-col items-start justify-center gap-5">
	<Heading tag="h4"
		>{$i18n('pages.telemetryMetricValueList.title')}: {decodeURIComponent(itemId ?? '')}</Heading
	>
	<div class="items-left flex flex-col justify-between gap-2 sm:w-full sm:flex-row sm:items-center">
		<div class="flex flex-row gap-2">
			{#if busy}
				<Spinner />
			{/if}
			{#if Is.stringValue(status)}
				<P class={isError ? 'text-red-600' : ''}>{status}</P>
			{/if}
		</div>
	</div>

	<Card class="w-full max-w-full rounded-lg border border-gray-300 p-4">
		<div class="flex flex-col gap-4 lg:flex-row">
			<Label>
				{$i18n('pages.telemetryMetricValueList.limit')}
				<Input
					name="limit"
					placeholder={$i18n('pages.telemetryMetricValueList.limit')}
					color="default"
					bind:value={limit}
					disabled={busy}
					type="number"
				></Input>
			</Label>
			<Label>
				{$i18n('pages.telemetryMetricValueList.timeStart')}
				<Input
					name="timeStart"
					placeholder={$i18n('pages.telemetryMetricValueList.timeStart')}
					color="default"
					bind:value={timeStart}
					type="date"
					disabled={busy}
				></Input>
			</Label>
			<Label>
				{$i18n('pages.telemetryMetricValueList.timeEnd')}
				<Input
					name="timeEnd"
					placeholder={$i18n('pages.telemetryMetricValueList.timeEnd')}
					color="default"
					bind:value={timeEnd}
					type="date"
					disabled={busy}
				></Input>
			</Label>
			<Button on:click={async () => action()} disabled={busy} class="lg:mt-6">
				{$i18n('pages.telemetry.search')}
			</Button>
		</div>
	</Card>

	<div class="flex w-full justify-end gap-4">
		<Button on:click={() => goto(`/secure/telemetry/${itemId}/values/create`)} disabled={busy}
			>{$i18n('pages.telemetryMetricValueList.createMetricValue')}</Button
		>
	</div>

	{#if Is.arrayValue(entities)}
		<Table>
			<TableHead>
				<TableHeadCell>{$i18n('pages.telemetryMetricValueList.id')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.telemetryMetricValueList.value')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.telemetryMetricValueList.timestamp')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.telemetryMetricValueList.customData')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.telemetry.actions')}</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each entities as item}
					<TableBodyRow>
						<TableBodyCell class="whitespace-normal">{item.id}</TableBodyCell>
						<TableBodyCell>{item.value}</TableBodyCell>
						<TableBodyCell>{new Date(item.ts).toLocaleString()}</TableBodyCell>
						<TableBodyCell>
							{#if item.customData && JSON.stringify(item.customData).length > 50}
								{JSON.stringify(item.customData).slice(0, 50)}...
							{:else}
								{JSON.stringify(item.customData)}
							{/if}
						</TableBodyCell>
						<TableBodyCell class="flex flex-row gap-2">
							<Button size="xs" color="plain" on:click={async () => copyData(item)}
								><Icons.ClipboardCheckOutline /></Button
							>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {loadNext} {loadPrevious} {canGoBackwards} {canGoForwards} disabled={busy} />
	{:else}
		{$i18n('pages.telemetryMetricValueList.noItems')}
	{/if}
	<div class="flex flex-row gap-2">
		<Button on:click={() => goto('/secure/telemetry/')}>{$i18n('actions.back')}</Button>
	</div>
</section>
