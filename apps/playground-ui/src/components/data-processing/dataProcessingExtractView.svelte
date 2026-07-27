<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Converter, Is, Validation, type IValidationFailure } from '@twin.org/core';
	import type { IRuleGroup } from '@twin.org/data-processing-models';
	import {
		Code,
		i18n,
		Label,
		P,
		Textarea,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { extractData, ruleGroupGet } from '$stores/dataProcessing';

	interface Props {
		itemId: string;
		returnUrl: string;
	}

	let { itemId, returnUrl }: Props = $props();
	let status: string | undefined = $state();
	let busy = $state(false);
	let progress: string | undefined = $state();
	let ruleGroup: IRuleGroup | undefined = $state();
	let inputContent = $state('');
	let extractedData = $state('');
	let validationErrors: {
		[field in 'inputContent']?: IValidationFailure[] | undefined;
	} = $state({});

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.stringValue(
			'inputContent',
			inputContent,
			validationFailures,
			$i18n('pages.dataProcessingExtractView.inputContent')
		);
	}

	async function action(): Promise<string | undefined> {
		busy = true;
		status = undefined;
		progress = $i18n('pages.dataProcessingExtractView.progress');

		if (Is.object(ruleGroup) && Is.stringValue(inputContent)) {
			const result = await extractData(ruleGroup.id, Converter.utf8ToBytes(inputContent));
			if (Is.stringValue(result?.error)) {
				status = result.error;
			} else if (Is.object(result?.data)) {
				extractedData = JSON.stringify(result.data, null, 2);
			}
		}

		progress = undefined;
		busy = false;

		return status;
	}

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	onMount(async () => {
		busy = true;
		const result = await ruleGroupGet(itemId);
		if (Is.stringValue(result?.error)) {
			status = result.error;
		} else if (Is.object(result?.item)) {
			ruleGroup = result.item;
		}
		busy = false;
	});
</script>

<ValidatedForm
	class="w-full max-w-none"
	title={`${$i18n('pages.dataProcessingExtractView.title')}: ${ruleGroup?.label}`}
	actionButtonLabel={$i18n('pages.dataProcessingExtractView.action')}
	actionSuccessLabel={$i18n('pages.dataProcessingExtractView.actionSuccess')}
	validationMethod={validate}
	actionMethod={action}
	closeMethod={close}
	result={status}
	bind:validationErrors
	bind:busy
>
	{#snippet fields()}
		<div class="flex w-full flex-row gap-4 align-top">
			<Label class="w-1/2">
				{$i18n('pages.dataProcessingExtractView.inputContent')}
				<Textarea
					bind:value={inputContent}
					class="mt-2 h-80 overflow-auto text-xs"
					color={Is.arrayValue(validationErrors.inputContent) ? 'error' : 'default'}
					disabled={busy}
				></Textarea>
				<ValidationError validationErrors={validationErrors.inputContent} />
			</Label>
			<Label class="w-1/2">
				{$i18n('pages.dataProcessingExtractView.extractedData')}
				<Code class="h-80 overflow-auto text-left">{extractedData}</Code>
			</Label>
		</div>
	{/snippet}
	{#snippet afterAction()}
		{#if Is.stringValue(progress)}
			<P>{progress}</P>
		{/if}
	{/snippet}
</ValidatedForm>
