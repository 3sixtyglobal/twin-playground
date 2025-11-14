<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is, Validation, type IValidationFailure } from '@twin.org/core';
	import { MetricType } from '@twin.org/telemetry-models';
	import {
		Button,
		Card,
		Error,
		Heading,
		i18n,
		Input,
		Label,
		P,
		Span,
		ValidatedForm,
		ValidationError,
		Select
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { createMetric, metricGet, updateMetric } from '$stores/telemetry';
	import { getMetricTypeLabels } from '$utils/telemetry/metricTypeLabels';

	interface Props {
		returnUrl: string;
		itemId?: string | undefined;
	}

	let { returnUrl, itemId = $bindable(undefined) }: Props = $props();
	let id = $state('');
	let label = $state('');
	let description: string | undefined = $state('');
	let type: MetricType = $state(MetricType.Counter);
	let unit = $state('');
	let validationErrors: {
		[field in 'id' | 'label' | 'type']?: IValidationFailure[] | undefined;
	} = $state({});
	let busy = $state(false);
	let error: string | undefined = $state();
	let progress: string | undefined = $state();
	const isUpdate = Is.stringValue(itemId);
	let saved: boolean = $state(false);
	const metricTypes: MetricType[] = Object.values(MetricType);
	const metricTypeLabels = getMetricTypeLabels();

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.stringValue(
			'id',
			id,
			validationFailures,
			$i18n('pages.telemetryMetricProperties.id')
		);
		Validation.stringValue(
			'label',
			label,
			validationFailures,
			$i18n('pages.telemetryMetricProperties.label')
		);
		Validation.arrayOneOf(
			'type',
			type,
			Object.values(MetricType),
			validationFailures,
			$i18n('pages.telemetryMetricProperties.type')
		);
	}

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	async function action(): Promise<string | undefined> {
		progress = $i18n('pages.telemetry.progress');
		busy = true;

		let result;

		if (isUpdate) {
			result = await updateMetric({
				id,
				label,
				description,
				type,
				unit
			});
		} else {
			result = await createMetric({
				id,
				label,
				description,
				type,
				unit
			});
		}

		progress = undefined;
		busy = false;

		if (Is.stringValue(result?.error)) {
			return result?.error;
		}

		itemId = id;
		saved = true;

		return undefined;
	}

	async function loadData(loadId: string): Promise<void> {
		busy = true;
		error = '';

		const result = await metricGet(loadId);
		if (Is.stringValue(result?.error)) {
			error = result.error;
		} else if (Is.objectValue(result?.metric)) {
			id = result.metric.id;
			description = result.metric.description;
			label = result.metric.label;
			type = result.metric.type;
			unit = result.metric.unit ?? '';
		}

		busy = false;
	}

	onMount(async () => {
		if (isUpdate && Is.stringValue(itemId)) {
			await loadData(itemId);
		}
	});
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	{#if !saved}
		<ValidatedForm
			title={$i18n('pages.telemetryMetricProperties.title')}
			actionButtonLabel={$i18n(`actions.${isUpdate ? 'update' : 'create'}`)}
			actionSuccessLabel={$i18n(
				`pages.telemetryMetricProperties.${isUpdate ? 'actionUpdateSuccess' : 'actionCreateSuccess'}`
			)}
			validationMethod={validate}
			actionMethod={action}
			closeMethod={close}
			bind:validationErrors
			bind:busy
		>
			{#snippet fields()}
				<Label>
					{$i18n('pages.telemetryMetricProperties.id')}
					<Input
						type="text"
						name="id"
						color={Is.arrayValue(validationErrors.id) ? 'error' : 'default'}
						bind:value={id}
						disabled={busy}
					/>
					<ValidationError validationErrors={validationErrors.id} />
				</Label>
				<Label>
					{$i18n('pages.telemetryMetricProperties.label')}
					<Input
						name="label"
						color={Is.arrayValue(validationErrors.label) ? 'error' : 'default'}
						bind:value={label}
						disabled={busy}
					/>
					<ValidationError validationErrors={validationErrors.label} />
				</Label>
				<Label>
					{$i18n('pages.telemetryMetricProperties.type')}
					<Select bind:value={type} disabled={busy}>
						{#each metricTypes as metricType}
							<option value={metricType}>{metricTypeLabels[metricType]}</option>
						{/each}
					</Select>
				</Label>
				<Label>
					{$i18n('pages.telemetryMetricProperties.unit')}
					<Input name="unit" color="default" bind:value={unit} disabled={busy} />
				</Label>
				<Label>
					{$i18n('pages.telemetryMetricProperties.description')}
					<Input name="description" color="default" bind:value={description} disabled={busy} />
				</Label>
			{/snippet}
			{#snippet afterAction()}
				{#if Is.stringValue(progress)}
					<P>{progress}</P>
				{/if}
			{/snippet}
		</ValidatedForm>
		<Error {error} />
	{:else}
		<Card class="flex flex-col gap-5">
			<Heading tag="h5"
				>{$i18n(
					`pages.telemetryMetricProperties.resultTitle${isUpdate ? 'Update' : 'Create'}`
				)}</Heading
			>
			{#if Is.stringValue(id)}
				<Label>
					{$i18n('pages.telemetryMetricProperties.id')}
					<Span>{id}</Span>
				</Label>
			{/if}
			<Button onclick={async () => close()}>{$i18n('actions.close')}</Button>
		</Card>
	{/if}
</section>
