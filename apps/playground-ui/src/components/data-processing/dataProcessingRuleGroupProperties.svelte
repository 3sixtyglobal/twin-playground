<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is, Validation, type IValidationFailure } from '@twin.org/core';
	import type { IRule } from '@twin.org/data-processing-models';
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
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { ruleGroupGet, ruleGroupSet } from '$stores/dataProcessing';

	interface Props {
		returnUrl: string;
		itemId?: string | undefined;
	}

	let { returnUrl, itemId = $bindable(undefined) }: Props = $props();
	let id = $state('');
	let label = $state('');
	let rules: IRule[] = [];
	const isUpdate = Is.stringValue(itemId);
	let validationErrors: {
		[field in 'id' | 'label']?: IValidationFailure[] | undefined;
	} = $state({});
	let busy = $state(false);
	let saved = $state(false);
	let error = $state('');
	let progress: string | undefined = $state();

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.notEmpty(
			'id',
			Is.stringValue(id) ? id : undefined,
			validationFailures,
			$i18n('pages.dataProcessingRuleGroupProperties.id')
		);
		Validation.notEmpty(
			'label',
			Is.stringValue(label) ? label : undefined,
			validationFailures,
			$i18n('pages.dataProcessingRuleGroupProperties.label')
		);
	}

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	async function action(): Promise<string | undefined> {
		progress = $i18n(
			`pages.dataProcessingRuleGroupProperties.progress${isUpdate ? 'Update' : 'Create'}`
		);
		busy = true;

		const result = await ruleGroupSet({
			id,
			label,
			rules
		});

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
		error = '';
		busy = true;
		const result = await ruleGroupGet(loadId);
		if (Is.stringValue(result?.error)) {
			error = result.error;
		} else if (Is.objectValue(result?.item)) {
			id = result.item.id;
			label = result.item.label;
			rules = result.item.rules;
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
			title={$i18n('pages.dataProcessingRuleGroupProperties.title')}
			actionButtonLabel={$i18n(
				`pages.dataProcessingRuleGroupProperties.action${isUpdate ? 'Update' : 'Create'}`
			)}
			actionSuccessLabel={$i18n('pages.dataProcessingRuleGroupProperties.actionSuccess')}
			validationMethod={validate}
			actionMethod={action}
			closeMethod={close}
			bind:validationErrors
			bind:busy
		>
			{#snippet fields()}
				<Label>
					{$i18n('pages.dataProcessingRuleGroupProperties.id')}
					<Input
						type="text"
						name="id"
						color={Is.arrayValue(validationErrors.id) ? 'error' : 'default'}
						bind:value={id}
						disabled={busy || isUpdate}
					/>
					<ValidationError validationErrors={validationErrors.id} />
				</Label>
				<Label>
					{$i18n('pages.dataProcessingRuleGroupProperties.label')}
					<Input
						name="label"
						color={Is.arrayValue(validationErrors.label) ? 'error' : 'default'}
						bind:value={label}
						disabled={busy}
					/>
					<ValidationError validationErrors={validationErrors.label} />
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
					`pages.dataProcessingRuleGroupProperties.resultTitle${isUpdate ? 'Update' : 'Create'}`
				)}</Heading
			>
			{#if Is.stringValue(itemId)}
				<Label>
					{$i18n('pages.dataProcessingRuleGroupProperties.id')}
					<Span>{itemId}</Span>
				</Label>
			{/if}
			<Button onclick={async () => close()}>{$i18n('actions.close')}</Button>
		</Card>
	{/if}
</section>
