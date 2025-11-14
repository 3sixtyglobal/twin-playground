<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import type { IAttestationInformation } from '@twin.org/attestation-models';
	import { Is, Validation, type IValidationFailure } from '@twin.org/core';
	import {
		i18n,
		Label,
		P,
		Input,
		Span,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import type { IUserAttestationEntry } from '$models/IUserAttestationEntry';
	import { attestationGet, attestationTransfer } from '$stores/attestation';
	import { attestationsEntrySet, attestationsEntryGet } from '$stores/attestations';

	// Define form field validation templates - resource defined directly in component
	const validationTemplates = {
		recipientIdentity: {
			field: 'recipientIdentity',
			label: 'pages.attestationTransfer.recipientIdentity'
		},
		recipientAddress: {
			field: 'recipientAddress',
			label: 'pages.attestationTransfer.recipientAddress'
		}
	};

	interface Props {
		itemId: string | undefined;
		returnUrl: string;
	}

	let { itemId, returnUrl }: Props = $props();

	let validationErrors: {
		[field in 'recipientIdentity' | 'recipientAddress']?: IValidationFailure[] | undefined;
	} = $state({});
	let busy = $state(false);
	let progress: string | undefined = $state();
	let recipientIdentity: string | undefined = $state('');
	let recipientAddress: string | undefined = $state('');
	let item: Partial<IAttestationInformation> | undefined = $state();
	let itemEntry: IUserAttestationEntry | undefined;

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.stringValue(
			validationTemplates.recipientIdentity.field,
			recipientIdentity,
			validationFailures,
			$i18n(validationTemplates.recipientIdentity.label)
		);

		Validation.stringValue(
			validationTemplates.recipientAddress.field,
			recipientAddress,
			validationFailures,
			$i18n(validationTemplates.recipientAddress.label)
		);
	}

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	async function action(): Promise<string | undefined> {
		if (
			Is.stringValue(itemId) &&
			Is.stringValue(recipientIdentity) &&
			Is.stringValue(recipientAddress)
		) {
			progress = $i18n('pages.attestationTransfer.progress');

			const result = await attestationTransfer(itemId, recipientIdentity, recipientAddress);
			progress = '';

			if (Is.stringValue(result?.error)) {
				return result?.error;
			}

			if (Is.objectValue(itemEntry)) {
				await attestationsEntrySet({
					id: itemId,
					ownerIdentity: recipientIdentity,
					description: itemEntry?.description,
					dateCreated: itemEntry?.dateCreated
				});
			}

			await goto('/secure/attestation');
		}

		return undefined;
	}

	onMount(async () => {
		busy = true;
		if (!Is.undefined(itemId)) {
			const result = await attestationGet(itemId);
			item = result?.item;
			const resultEntry = await attestationsEntryGet(itemId);
			itemEntry = resultEntry?.item;
		}
		busy = false;
	});
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	<ValidatedForm
		title={$i18n('pages.attestationTransfer.title')}
		actionButtonLabel={$i18n('pages.attestationTransfer.transfer')}
		actionSuccessLabel={$i18n('pages.attestationTransfer.transferSuccess')}
		validationMethod={validate}
		actionMethod={action}
		closeMethod={close}
		bind:validationErrors
		bind:busy
	>
		{#snippet fields()}
			{#if Is.stringValue(item?.ownerIdentity)}
				<Label>
					{$i18n('pages.attestationTransfer.currentOwner')}:
					<Span>{item?.ownerIdentity}</Span>
				</Label>
			{/if}
			<Label>
				{$i18n('pages.attestationTransfer.recipientIdentity')}
				<Input
					name="recipientIdentity"
					placeholder={$i18n('pages.attestationTransfer.recipientIdentity')}
					color={Is.arrayValue(validationErrors.recipientIdentity) ? 'error' : 'default'}
					bind:value={recipientIdentity}
					disabled={busy}
				></Input>
				<ValidationError validationErrors={validationErrors.recipientIdentity} />
			</Label>
			<Label>
				{$i18n('pages.attestationTransfer.recipientAddress')}
				<Input
					name="recipientAddress"
					placeholder={$i18n('pages.attestationTransfer.recipientAddress')}
					color={Is.arrayValue(validationErrors.recipientAddress) ? 'error' : 'default'}
					bind:value={recipientAddress}
					disabled={busy}
				></Input>
				<ValidationError validationErrors={validationErrors.recipientAddress} />
			</Label>
		{/snippet}
		{#snippet afterAction()}
			{#if Is.stringValue(progress)}
				<P>{progress}</P>
			{/if}
		{/snippet}
	</ValidatedForm>
</section>
