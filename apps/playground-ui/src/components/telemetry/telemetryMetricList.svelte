<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is } from '@twin.org/core';
	import { MetricType, type ITelemetryMetric } from '@twin.org/telemetry-models';
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
		ModalYesNo
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { telemetryQuery, metricRemove } from '$stores/telemetry';
	import { CursorStackHandler } from '$utils/shared/cursorStackHandler';
	import { getMetricTypeLabels } from '$utils/telemetry/metricTypeLabels';

	const cursorHandler = new CursorStackHandler();
	const metricTypes: MetricType[] = Object.values(MetricType);
	const metricTypeLabels = getMetricTypeLabels();

	let entities: ITelemetryMetric[] | undefined;
	let busy = false;
	let status = '';
	let type: MetricType | undefined = undefined;
	let limit = 50;
	let isError = false;
	let confirmationId: string = '';
	let modalIsBusy = false;

	$: canGoBackwards = cursorHandler.canGoBackwards();
	$: canGoForwards = cursorHandler.canGoForwards();

	async function loadData(): Promise<void> {
		status = $i18n('pages.telemetry.loading');
		busy = true;
		isError = false;
		const result = await telemetryQuery(type, cursorHandler.getCurrentCursor(), limit);

		if (Is.stringValue(result?.error)) {
			isError = true;
			status = result.error;
		} else {
			entities = result?.entities ?? [];
			cursorHandler.updateCursor(result?.cursor);

			canGoBackwards = cursorHandler.canGoBackwards();
			canGoForwards = cursorHandler.canGoForwards();

			if (entities.length === 0) {
				status = $i18n('pages.telemetry.noItems');
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
			await metricRemove(confirmationId);
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
	<Heading tag="h4">{$i18n('pages.telemetry.title')}</Heading>

	<Card class="w-full max-w-full rounded-lg border border-gray-300 p-4">
		<div class="flex flex-col gap-4 lg:flex-row">
			<Label>
				{$i18n('pages.telemetry.limit')}
				<Input
					name="limit"
					placeholder={$i18n('pages.telemetry.limit')}
					color="default"
					bind:value={limit}
					disabled={busy}
					type="number"
				></Input>
			</Label>
			<Label>
				{$i18n('pages.telemetry.type')}
				<Select bind:value={type} disabled={busy}>
					<option value={undefined}>All</option>
					{#each metricTypes as metricType}
						<option value={metricType}>{metricTypeLabels[metricType]}</option>
					{/each}
				</Select>
			</Label>
			<Button on:click={async () => action()} disabled={busy} class="lg:mt-6">
				{$i18n('pages.telemetry.search')}
			</Button>
		</div></Card
	>

	<div class="items-left flex flex-col justify-between gap-2 sm:w-full sm:flex-row sm:items-center">
		<div class="flex flex-row gap-2">
			{#if busy}
				<Spinner />
			{/if}
		</div>
		<Button on:click={() => goto('/secure/telemetry/create')} disabled={busy}
			>{$i18n('pages.telemetry.createMetric')}</Button
		>
	</div>

	{#if Is.stringValue(status)}
		<P class={isError ? 'text-red-600' : ''}>{status}</P>
	{/if}

	{#if Is.arrayValue(entities)}
		<Table>
			<TableHead>
				<TableHeadCell>{$i18n('pages.telemetry.id')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.telemetry.label')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.telemetry.unit')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.telemetry.type')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.telemetry.actions')}</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each entities as item}
					<TableBodyRow>
						<TableBodyCell class="whitespace-normal">{item.id}</TableBodyCell>
						<TableBodyCell>{item.label}</TableBodyCell>
						<TableBodyCell>{item.unit}</TableBodyCell>
						<TableBodyCell>{metricTypeLabels[item.type]}</TableBodyCell>
						<TableBodyCell class="flex flex-row gap-2">
							<Button
								size="xs"
								color="plain"
								on:click={() => goto(`/secure/telemetry/${encodeURIComponent(item.id)}`)}
								><Icons.EditOutline /></Button
							><Button
								size="xs"
								color="plain"
								on:click={() => goto(`/secure/telemetry/${encodeURIComponent(item.id)}/values`)}
								><Icons.ListOutline /></Button
							><Button
								size="xs"
								color="plain"
								on:click={() =>
									goto(`/secure/telemetry/${encodeURIComponent(item.id)}/values/chart`)}
								><Icons.ChartLineUpOutline /></Button
							><Button size="xs" color="plain" on:click={async () => removePrompt(item.id)}
								><Icons.TrashBinOutline /></Button
							>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {loadNext} {loadPrevious} {canGoBackwards} {canGoForwards} disabled={busy} />
		<ModalYesNo
			title={$i18n('pages.telemetry.deleteTitle')}
			open={Is.stringValue(confirmationId)}
			message={$i18n('pages.telemetry.deleteMessage')}
			busy={modalIsBusy}
			yesColor="error"
			yesAction={async () => remove()}
			noAction={async () => removeCancel()}
		/>
	{/if}
</section>
