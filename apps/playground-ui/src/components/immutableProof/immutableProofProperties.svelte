<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is, Validation, type IValidationFailure } from '@twin.org/core';
	import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';
	import {
		Button,
		Card,
		Heading,
		i18n,
		Label,
		P,
		Select,
		Span,
		ValidatedForm,
		ValidationError,
		Textarea
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { immutableProofCreate } from '$stores/immutableProof';
	import { immutableProofsEntrySet } from '$stores/immutableProofs';

	interface Props {
		returnUrl: string;
	}

	let { returnUrl }: Props = $props();
	let validationErrors: {
		[field in 'proofObject']?: IValidationFailure[] | undefined;
	} = $state({});
	let busy = $state(false);
	let progress: string | undefined = $state();
	let proofId: string | undefined = $state();
	let proofObject: IJsonLdNodeObject | undefined = $state(undefined);
	let selectedType = $state('');
	let textAreaValue = $state('');
	const proofObjectExamples: IJsonLdNodeObject[] = [
		{
			'@context': 'https://schema.org',
			'@type': 'Person',
			familyName: 'Sample Report',
			givenName: 'Dr. Jane Doe',
			email: 'email@sample.com',
			birthDate: '1970-01-01'
		},
		{
			'@context': 'https://schema.org',
			'@type': 'DigitalDocument',
			name: 'Sample Report',
			author: {
				'@type': 'Person',
				name: 'Dr. Jane Doe'
			},
			hasDigitalDocumentPermission: {
				'@type': 'DigitalDocumentPermission',
				permissionType: 'read',
				grantee: {
					'@type': 'Audience',
					audienceType: 'public'
				}
			},
			license: 'https://creativecommons.org/licenses/by/4.0/'
		},
		{
			'@context': 'https://schema.org',
			'@type': 'Place',
			address: 'Example address',
			geo: {
				'@type': 'GeoCoordinates',
				latitude: 40.7128,
				longitude: -74.006
			}
		}
	];

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.notEmpty(
			'proofObject',
			Is.object(proofObject) ? JSON.stringify(proofObject) : undefined,
			validationFailures,
			$i18n('pages.immutableProofProperties.proofObject')
		);
	}

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	async function action(): Promise<string | undefined> {
		proofId = undefined;

		if (Is.object(proofObject)) {
			busy = true;
			proofObject = {
				...proofObject
			};

			progress = $i18n('pages.immutableProofProperties.progress');
			const result = await immutableProofCreate(proofObject);
			progress = '';

			if (Is.stringValue(result?.error)) {
				return result?.error;
			}
			immutableProofsEntrySet({
				id: result?.proofId ?? '',
				date: new Date().toISOString()
			});

			proofId = result?.proofId;
			busy = false;
		}
		return undefined;
	}

	function handleSelectChange(event: Event): void {
		const selected = (event.target as HTMLSelectElement).value;
		const example = proofObjectExamples.find(ex => ex['@type'] === selected);
		if (example) {
			proofObject = { ...example };
			selectedType = selected;
			textAreaValue = JSON.stringify(proofObject, null, 2);
		}
	}

	$effect(() => {
		if (!textAreaValue.trim()) {
			proofObject = undefined;
			selectedType = '';
		} else {
			try {
				proofObject = JSON.parse(textAreaValue);
				if (Is.object(proofObject)) {
					validationErrors.proofObject = [];
				}
			} catch {
				proofObject = undefined;
			}
		}
	});

	onMount(async () => {
		busy = false;
	});
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	{#if !Is.stringValue(proofId)}
		<ValidatedForm
			title={$i18n('pages.immutableProofProperties.title')}
			actionButtonLabel={$i18n('pages.immutableProofProperties.action')}
			actionSuccessLabel={$i18n('pages.immutableProofProperties.actionSuccess')}
			validationMethod={validate}
			actionMethod={action}
			closeMethod={close}
			bind:validationErrors
			bind:busy
		>
			{#snippet fields()}
				<Label>
					{$i18n('pages.immutableProofProperties.data')}
				</Label>
				<Textarea
					bind:value={textAreaValue}
					class="min-h-40 text-xs"
					color={Is.arrayValue(validationErrors.proofObject) ? 'error' : 'default'}
					disabled={busy}
				></Textarea>
				<ValidationError validationErrors={validationErrors.proofObject} />
				<Label>
					{$i18n('pages.immutableProofProperties.selectExample')}
					<Select bind:value={selectedType} onchange={handleSelectChange} disabled={busy}>
						{#each proofObjectExamples as example}
							<option value={example['@type']}>{example['@type']}</option>
						{/each}
					</Select>
				</Label>
			{/snippet}
			{#snippet afterAction()}
				{#if Is.stringValue(progress)}
					<P>{progress}</P>
				{/if}
			{/snippet}
		</ValidatedForm>
	{:else}
		<Card class="flex flex-col gap-5">
			<Heading tag="h5">{$i18n('pages.immutableProofProperties.resultTitle')}</Heading>
			{#if Is.stringValue(proofId)}
				<Label>
					{$i18n('pages.immutableProofProperties.proofId')}
					<Span>{proofId}</Span>
				</Label>
			{/if}
			<Button onclick={async () => close()}>{$i18n('actions.close')}</Button>
		</Card>
	{/if}
</section>
