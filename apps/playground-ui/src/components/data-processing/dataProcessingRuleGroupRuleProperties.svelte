<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { CoerceType, Is, Validation, type IValidationFailure } from '@twin.org/core';
	import type { IRuleGroup } from '@twin.org/data-processing-models';
	import {
		Error,
		Icons,
		Input,
		Label,
		P,
		Select,
		ValidatedForm,
		ValidationError,
		i18n
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { ruleGroupGet, ruleGroupSet } from '$stores/dataProcessing';

	interface Props {
		itemId: string;
		ruleIndex?: number;
		returnUrl: string;
	}

	let { itemId, ruleIndex = -1, returnUrl }: Props = $props();
	const isUpdate = ruleIndex >= 0;
	let error: string | undefined = $state();
	let busy = $state(false);
	let ruleGroup: IRuleGroup | undefined;
	let progress: string | undefined = $state();
	let source: string = $state('');
	let target: string = $state('');
	let coerce: CoerceType | undefined = $state();
	let retainPathDepth: number | undefined = $state();
	let validationErrors: {
		[field in 'source' | 'target' | 'coerce' | 'retainPathDepth']?:
			| IValidationFailure[]
			| undefined;
	} = $state({});

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.stringValue(
			'source',
			source,
			validationFailures,
			$i18n('pages.dataProcessingRuleGroupRuleProperties.source')
		);
		Validation.stringValue(
			'target',
			target,
			validationFailures,
			$i18n('pages.dataProcessingRuleGroupRuleProperties.target')
		);
		if (Is.stringValue(coerce)) {
			Validation.arrayOneOf(
				'coerce',
				coerce,
				Object.values(CoerceType),
				validationFailures,
				$i18n('pages.dataProcessingRuleGroupRuleProperties.coerce')
			);
		}
		if (!Is.empty(retainPathDepth)) {
			Validation.integer(
				'retainPathDepth',
				retainPathDepth,
				validationFailures,
				$i18n('pages.dataProcessingRuleGroupRuleProperties.retainPathDepth')
			);
		}
	}

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	async function action(): Promise<string | undefined> {
		if (Is.object(ruleGroup)) {
			progress = $i18n(
				`pages.dataProcessingRuleGroupRuleProperties.progress${isUpdate ? 'Update' : 'Create'}`
			);
			busy = true;

			if (ruleIndex === -1) {
				ruleGroup.rules.push({
					source,
					target,
					retainPathDepth,
					coerce
				});
			} else {
				ruleGroup.rules[ruleIndex] = {
					source,
					target,
					retainPathDepth,
					coerce
				};
			}
			const result = await ruleGroupSet(ruleGroup);

			progress = undefined;
			busy = false;

			if (Is.stringValue(result?.error)) {
				return result?.error;
			}

			await goto(returnUrl);
		}

		return undefined;
	}

	async function loadData(loadId: string): Promise<void> {
		error = '';
		busy = true;

		const result = await ruleGroupGet(loadId);

		if (Is.stringValue(result?.error)) {
			error = result.error;
		} else if (Is.object(result?.item)) {
			ruleGroup = result.item;
			if (ruleIndex >= 0) {
				const rule = ruleGroup.rules[ruleIndex];
				source = rule.source;
				target = rule.target;
				coerce = rule.coerce;
				retainPathDepth = rule.retainPathDepth;
			}
		}
		busy = false;
	}

	onMount(async () => {
		await loadData(itemId);
	});
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	<ValidatedForm
		title={$i18n('pages.dataProcessingRuleGroupRuleProperties.title')}
		actionButtonLabel={$i18n(
			`pages.dataProcessingRuleGroupRuleProperties.action${isUpdate ? 'Update' : 'Create'}`
		)}
		actionSuccessLabel={$i18n('pages.dataProcessingRuleGroupRuleProperties.actionSuccess')}
		validationMethod={validate}
		actionMethod={action}
		closeMethod={close}
		bind:validationErrors
		bind:busy
	>
		{#snippet fields()}
			<Label>
				{$i18n('pages.dataProcessingRuleGroupRuleProperties.source')}
				<br />
				{$i18n('pages.dataProcessingRuleGroupRuleProperties.sourceDescription')}
				<a
					href="https://www.rfc-editor.org/rfc/rfc9535.html"
					target="_blank"
					class="flex flex-row items-center gap-2"
				>
					{$i18n('pages.dataProcessingRuleGroupRuleProperties.moreInformation')}
					<Icons.InfoCircleOutline />
				</a>
				<Input
					name="source"
					placeholder={$i18n('pages.dataProcessingRuleGroupRuleProperties.source')}
					color={Is.arrayValue(validationErrors.source) ? 'error' : 'default'}
					bind:value={source}
					disabled={busy}
				></Input>
				<ValidationError validationErrors={validationErrors.source} />
			</Label>
			<Label>
				{$i18n('pages.dataProcessingRuleGroupRuleProperties.target')}
				<Input
					name="target"
					placeholder={$i18n('pages.dataProcessingRuleGroupRuleProperties.target')}
					color={Is.arrayValue(validationErrors.target) ? 'error' : 'default'}
					bind:value={target}
					disabled={busy}
				></Input>
				<ValidationError validationErrors={validationErrors.target} />
			</Label>
			<Label>
				{$i18n('pages.dataProcessingRuleGroupRuleProperties.retainPathDepth')}
				<Input
					name="retainPathDepth"
					placeholder={$i18n('pages.dataProcessingRuleGroupRuleProperties.retainPathDepth')}
					color={Is.arrayValue(validationErrors.retainPathDepth) ? 'error' : 'default'}
					bind:value={retainPathDepth}
					disabled={busy}
					type="number"
				></Input>
				<ValidationError validationErrors={validationErrors.retainPathDepth} />
			</Label>
			<Label>
				{$i18n('pages.dataProcessingRuleGroupRuleProperties.coerce')}
				<Select
					name="coerce"
					bind:value={coerce}
					disabled={busy}
					color={Is.arrayValue(validationErrors.coerce) ? 'error' : 'default'}
				>
					<option value="" selected
						>{$i18n('pages.dataProcessingRuleGroupRuleProperties.coerceNone')}</option
					>
					{#each Object.values(CoerceType) as coerceOption}
						<option value={coerceOption}>{coerceOption}</option>
					{/each}
				</Select>
				<ValidationError validationErrors={validationErrors.coerce} />
			</Label>
		{/snippet}
		{#snippet afterAction()}
			{#if Is.stringValue(progress)}
				<P>{progress}</P>
			{/if}
		{/snippet}
	</ValidatedForm>
	<Error {error} />
</section>
