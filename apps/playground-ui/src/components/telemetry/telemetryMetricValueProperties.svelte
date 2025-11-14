<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is, Validation, type IValidationFailure } from '@twin.org/core';
	import { MetricType } from '@twin.org/telemetry-models';
	import {
		Button,
		Error,
		i18n,
		Icons,
		Input,
		Label,
		P,
		Select,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { addValueToMetric, metricGet } from '$stores/telemetry';

	interface Props {
		returnUrl: string;
		itemId?: string | undefined;
	}

	let { returnUrl, itemId = undefined }: Props = $props();
	let type: MetricType | undefined = $state();
	let error: string | undefined = $state();
	let busy = $state(false);
	let customData: { [key: string]: unknown } | undefined = $state(undefined);
	let progress: string | undefined = $state();
	let customDataKey: string | undefined = $state(undefined);
	let customDataValue: string | undefined = $state(undefined);
	let value: number | 'inc' | 'dec' | undefined = $state(undefined);
	let validationErrors: {
		[field in 'value']?: IValidationFailure[] | undefined;
	} = $state({});

	async function validateValue(validationFailures: IValidationFailure[]): Promise<void> {
		if (type === MetricType.Gauge) {
			Validation.number(
				'value',
				value,
				validationFailures,
				$i18n('pages.telemetryMetricValueProperties.value')
			);
		} else if (type === MetricType.IncDecCounter || type === MetricType.Counter) {
			Validation.arrayOneOf(
				'value',
				value,
				['inc', 'dec'],
				validationFailures,
				$i18n('pages.telemetryMetricValueProperties.value')
			);
		}
	}

	async function action(): Promise<undefined> {
		progress = $i18n('pages.telemetryMetricValueProperties.progress');
		busy = true;

		if (Is.stringValue(itemId) && !Is.empty(value)) {
			await addValueToMetric(itemId, value, customData);
		}

		busy = false;
		await goto(returnUrl);
	}

	function addCustomData(): void {
		if (Is.stringValue(customDataKey) && Is.stringValue(customDataValue)) {
			if (Is.undefined(customData)) {
				customData = {};
			}
			customData[customDataKey] = customDataValue;
			customDataKey = undefined;
			customDataValue = undefined;
		}
	}

	async function loadData(id: string): Promise<void> {
		error = '';
		busy = true;

		const result = await metricGet(id);
		if (Is.stringValue(result?.error)) {
			error = result.error;
		} else if (Is.objectValue(result?.metric)) {
			type = result.metric.type;
			if (type === MetricType.Counter) {
				value = 'inc';
			}
		}
		busy = false;
	}

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	onMount(async () => {
		if (Is.stringValue(itemId)) {
			await loadData(itemId);
		}
	});
</script>

<ValidatedForm
	title={$i18n('pages.telemetryMetricValueProperties.title')}
	actionButtonLabel={type === MetricType.Counter
		? $i18n('pages.telemetryMetricValueProperties.increment')
		: $i18n('pages.telemetryMetricValueProperties.action')}
	actionSuccessLabel={$i18n('pages.telemetryMetricValueProperties.actionSuccess')}
	actionMethod={action}
	validationMethod={validateValue}
	closeMethod={close}
	bind:busy
	bind:validationErrors
>
	{#snippet fields()}
		{#if type === MetricType.IncDecCounter}
			<Label>
				{$i18n('pages.telemetryMetricValueProperties.incDecSelector')}
			</Label>
			<Select
				bind:value
				disabled={busy}
				color={Is.arrayValue(validationErrors.value) ? 'error' : 'default'}
			>
				<option value="inc">{$i18n('pages.telemetryMetricValueProperties.increment')}</option>
				<option value="dec">{$i18n('pages.telemetryMetricValueProperties.decrement')}</option>
			</Select>
			<ValidationError validationErrors={validationErrors.value} />
		{:else if type === MetricType.Gauge}
			<Label>
				{$i18n('pages.telemetryMetricValueProperties.value')}
			</Label>
			<Input
				placeholder={$i18n('pages.telemetryMetricValueProperties.valueExample')}
				color={Is.arrayValue(validationErrors.value) ? 'error' : 'default'}
				bind:value
				disabled={busy}
				type="number"
			></Input>
			<ValidationError validationErrors={validationErrors.value} />
		{/if}
		<Label>
			{$i18n('pages.telemetryMetricValueProperties.customValues')}
		</Label>
		<div class="flex flex-row gap-2">
			<Label>
				{$i18n('pages.telemetryMetricValueProperties.customDataKey')}
				<Input type="text" name="customDataKey" bind:value={customDataKey} disabled={busy} />
			</Label>
			<Label>
				{$i18n('pages.telemetryMetricValueProperties.customDataValue')}
				<Input type="text" name="customDataValue" bind:value={customDataValue} disabled={busy} />
			</Label>
			<Button size="xs" class="mt-6 p-2" onclick={addCustomData} disabled={busy}>
				<Icons.PlusOutline />
			</Button>
		</div>
		{#if Is.objectValue(customData)}
			{#each Object.keys(customData) as key}
				<div>
					<Label class="flex flex-row gap-2">
						<b>{key}:</b>
						{customData[key]}
					</Label>
				</div>
			{/each}
		{/if}
	{/snippet}
	{#snippet afterAction()}
		{#if Is.stringValue(progress)}
			<P>{progress}</P>
		{/if}
	{/snippet}
</ValidatedForm>
<Error {error} />
