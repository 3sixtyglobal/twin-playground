<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is } from '@twin.org/core';
	import { Button, Heading, i18n, P, Spinner } from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import LineChart from '$components/graph/lineChart.svelte';
	import { metricValuesQuery } from '$stores/telemetry';

	interface Props {
		itemId: string;
	}

	let { itemId }: Props = $props();

	let busy = $state(false);
	let status = $state('');
	let isError = $state(false);
	let stats: { ts: number; value: number }[] = $state([]);

	async function loadData(loadId: string): Promise<void> {
		status = $i18n('pages.telemetryMetricValueChart.loading');
		busy = true;
		isError = false;
		stats = [];

		const values = [];
		let idx = 0;

		let cursor;
		do {
			const result = await metricValuesQuery(loadId, undefined, undefined, undefined, cursor);

			if (result?.error) {
				isError = true;
				status = result.error;
				break;
			} else if (Is.arrayValue(result?.entities)) {
				values.push(...result.entities.map(item => item.value));
			}
			cursor = result?.cursor;
		} while (!Is.empty(cursor));

		stats = values.map(value => ({
			ts: values.length - idx++,
			value
		}));

		busy = false;
		status = '';
	}

	onMount(async () => {
		await loadData(itemId);
	});
</script>

<section class="flex flex-col items-start justify-center gap-5">
	<Heading tag="h4"
		>{$i18n('pages.telemetryMetricValueChart.title')}: {decodeURIComponent(itemId ?? '')}</Heading
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
	{#if !busy}
		<LineChart {stats} />
	{/if}
	<div class="flex flex-row gap-2">
		<Button onclick={() => goto('/secure/telemetry/')}>{$i18n('actions.back')}</Button>
	</div>
</section>
