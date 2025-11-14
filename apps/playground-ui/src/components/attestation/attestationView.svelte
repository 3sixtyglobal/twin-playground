<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import type { IAttestationInformation } from '@twin.org/attestation-models';
	import { Is, Urn } from '@twin.org/core';
	import {
		Button,
		Card,
		Code,
		Error,
		Heading,
		Icons,
		Label,
		QR,
		Span,
		Spinner,
		i18n
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { createPublicUrl } from '$stores/app';
	import { attestationGet } from '$stores/attestation';
	import { attestationIdToNftId, createExplorerNftUrl } from '$stores/iota';

	interface Props {
		itemId: string;
		returnUrl?: string | undefined;
	}

	let { itemId, returnUrl = undefined }: Props = $props();
	let error: string | undefined = $state();
	let busy = $state(true);
	let item: Partial<IAttestationInformation> | undefined = $state();
	let exploreUrl: string | undefined = $state();

	onMount(async () => {
		error = '';
		const resultVerify = await attestationGet(itemId);
		if (Is.stringValue(resultVerify?.error)) {
			error = resultVerify.error;
		} else {
			item = resultVerify?.item;

			if (Is.stringValue(item?.id)) {
				const nftId = attestationIdToNftId(item.id);
				const urn = Urn.fromValidString(nftId);

				if (urn.namespaceMethod() === 'iota') {
					exploreUrl = createExplorerNftUrl(nftId);
				}
			}
		}
		busy = false;
	});

	function openExplorer(): void {
		window.open(exploreUrl, '_blank');
	}

	function openProof(): void {
		const a = document.createElement('a');
		a.href = `/public/proof/${item?.proof?.type}:${item?.proof?.value}`;
		a.target = '_blank';
		a.click();
	}

	function openIdentity(id?: string): void {
		if (Is.stringValue(id)) {
			const a = document.createElement('a');
			a.href = `/public/identity/${id}`;
			a.target = '_blank';
			a.click();
		}
	}
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('components.attestationView.title')}</Heading>
		{#if busy}
			<Spinner />
		{/if}
	</div>
	<Error {error} />
	{#if !busy}
		<div class="flex flex-col justify-between gap-4">
			<div class="flex flex-col justify-between gap-4 md:flex-row">
				<div class="flex flex-col gap-4">
					<Label>
						{$i18n('components.attestationView.id')}
						<Span>{itemId}</Span>
					</Label>
					{#if Is.stringValue(exploreUrl)}
						<div>
							<Button size="xs" onclick={openExplorer} color="plain" class="gap-2"
								>{$i18n('components.attestationView.exploreNft')}<Icons.LinkOutline
									size="sm"
								/></Button
							>
						</div>
					{/if}
				</div>
				<QR
					qrData={createPublicUrl(`attestation/${itemId}`)}
					label={$i18n('components.attestationView.attestationQr')}
					dimensions={128}
				/>
			</div>
			{#if !Is.empty(item?.verified)}
				<Label>
					{$i18n('components.attestationView.verified')}
					<Span>{item?.verified}</Span>
				</Label>
			{/if}
			{#if Is.stringValue(item?.verificationFailure)}
				<Label>
					{$i18n('components.attestationView.verifyFailure')}
					<Span class="text-error dark:text-error-dark">{item.verificationFailure}</Span>
				</Label>
			{/if}
			{#if Is.stringValue(item?.dateCreated)}
				<Label>
					{$i18n('components.attestationView.created')}
					<Span>{new Date(item.dateCreated).toLocaleString()}</Span>
				</Label>
			{/if}
			{#if Is.stringValue(item?.ownerIdentity)}
				<Label>
					<div class="flex flex-row items-center gap-2">
						{$i18n('components.attestationView.ownerIdentity')}
						<Button
							onclick={() => openIdentity(item?.ownerIdentity)}
							size="xs"
							color="plain"
							class="gap-2"
						>
							{$i18n('actions.view')}
							<Icons.ArrowUpRightFromSquareOutline size="sm" />
						</Button>
					</div>
					<Span>{item.ownerIdentity}</Span>
				</Label>
			{/if}
			{#if Is.stringValue(item?.dateTransferred)}
				<Label>
					{$i18n('components.attestationView.transferred')}
					<Span>{new Date(item.dateTransferred)}</Span>
				</Label>
			{/if}
			{#if Is.stringValue(item?.holderIdentity)}
				<Label>
					<div class="flex flex-row items-center gap-2">
						{$i18n('components.attestationView.holderIdentity')}
						<Button
							onclick={() => openIdentity(item?.holderIdentity)}
							size="xs"
							color="plain"
							class="gap-2"
						>
							{$i18n('actions.view')}
							<Icons.ArrowUpRightFromSquareOutline size="sm" />
						</Button>
					</div>
					<Span>{item.holderIdentity}</Span>
				</Label>
			{/if}
			{#if Is.object(item?.attestationObject)}
				<Label>
					{$i18n('components.attestationView.attestationObject')}
					<Code>{JSON.stringify(item.attestationObject, undefined, 2)}</Code>
				</Label>
			{/if}
			{#if Is.object(item?.proof)}
				<Label>
					<div class="flex flex-row items-center gap-2">
						{$i18n('components.attestationView.proof')}
						<Button onclick={openProof} size="xs" color="plain" class="gap-2">
							{$i18n('actions.decode')}
							<Icons.ArrowUpRightFromSquareOutline size="sm" />
						</Button>
					</div>
					<Code>{JSON.stringify(item.proof, undefined, 2)}</Code>
				</Label>
			{/if}
		</div>
	{/if}
	{#if Is.stringValue(returnUrl)}
		<div class="flex flex-row gap-2">
			<Button onclick={() => goto(returnUrl)}>{$i18n('actions.back')}</Button>
		</div>
	{/if}
</Card>
