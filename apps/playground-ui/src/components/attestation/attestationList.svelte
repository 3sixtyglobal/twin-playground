<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is } from '@twin.org/core';
	import {
		Button,
		Heading,
		i18n,
		Icons,
		Spinner,
		P,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		ModalYesNo,
		Pagination
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import type { IUserAttestationEntry } from '$models/IUserAttestationEntry';
	import { attestationDestroy } from '$stores/attestation';
	import { attestationEntryList, attestationsEntryRemove } from '$stores/attestations';
	import { profileIdentity } from '$stores/identityProfile';
	import { CursorStackHandler } from '$utils/shared/cursorStackHandler';

	// Define the confirmation action types as resources directly in the component
	const confirmationTypes = {
		DESTROY: 'destroy',
		REMOVE: 'remove'
	};

	// Define template objects for different confirmation dialogs
	const confirmationTemplates = {
		[confirmationTypes.DESTROY]: {
			title: 'pages.attestation.destroyTitle',
			message: 'pages.attestation.destroyMessage'
		},
		[confirmationTypes.REMOVE]: {
			title: 'pages.attestation.deleteTitle',
			message: 'pages.attestation.deleteMessage'
		}
	};

	const cursorHandler = new CursorStackHandler();

	let items: IUserAttestationEntry[] | undefined = $state();
	let busy = $state(false);
	let status = $state('');
	let isError = $state(false);
	let confirmationId: string = $state('');
	let modalIsBusy = $state(false);
	const userIdentity = $profileIdentity;

	let canGoBackwards = $derived(cursorHandler.canGoBackwards());
	let canGoForwards = $derived(cursorHandler.canGoForwards());

	async function loadData(): Promise<void> {
		status = $i18n('pages.attestation.loading');
		busy = true;
		isError = false;
		const result = await attestationEntryList(cursorHandler.getCurrentCursor());

		if (Is.stringValue(result?.error)) {
			isError = true;
			status = result.error;
		} else {
			items = result?.items ?? [];
			cursorHandler.updateCursor(result?.cursor);

			canGoBackwards = cursorHandler.canGoBackwards();
			canGoForwards = cursorHandler.canGoForwards();

			if (items.length === 0) {
				status = $i18n('pages.attestation.noItems');
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

	async function removePrompt(id: string): Promise<void> {
		confirmationId = id;
	}

	async function confirmationCancel(): Promise<void> {
		confirmationId = '';
		modalIsBusy = false;
	}

	async function confirmationAction(): Promise<void> {
		if (Is.stringValue(confirmationId)) {
			modalIsBusy = true;

			await attestationDestroy(confirmationId);
			await attestationsEntryRemove(confirmationId);

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
	<Heading tag="h4">{$i18n('pages.attestation.title')}</Heading>
	<div class="items-left flex flex-col justify-between gap-2 sm:w-full sm:flex-row sm:items-center">
		<div class="flex flex-row gap-2">
			{#if busy}
				<Spinner />
			{/if}
		</div>
		<Button onclick={() => goto('/secure/attestation/create')} disabled={busy}
			>{$i18n('pages.attestation.createItem')}</Button
		>
	</div>

	{#if Is.stringValue(status)}
		<P class={isError ? 'text-red-600' : ''}>{status}</P>
	{/if}

	{#if Is.arrayValue(items)}
		<Table>
			<TableHead>
				<TableHeadCell>{$i18n('common.labels.description')}</TableHeadCell>
				<TableHeadCell>{$i18n('common.labels.dateCreated')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.attestation.currentHolder')}</TableHeadCell>
				<TableHeadCell>{$i18n('common.labels.actions')}</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each items as item}
					<TableBodyRow>
						<TableBodyCell class="break-all whitespace-normal">{item.description}</TableBodyCell>
						<TableBodyCell>{new Date(item.dateCreated).toLocaleString()}</TableBodyCell>
						<TableBodyCell class="break-all whitespace-normal">{item.ownerIdentity}</TableBodyCell>
						<TableBodyCell class="flex flex-row gap-2">
							<Button
								size="xs"
								color="plain"
								onclick={() => goto(`/secure/attestation/${item.id}`)}
							>
								<Icons.EyeOutline />
							</Button>
							{#if userIdentity === item.ownerIdentity}
								<Button
									size="xs"
									color="plain"
									onclick={() => goto(`/secure/attestation/${item.id}/transfer`)}
								>
									<Icons.ArrowRightOutline />
								</Button>
								<Button size="xs" color="plain" onclick={async () => removePrompt(item.id)}>
									<Icons.TrashBinOutline />
								</Button>
							{/if}
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {loadNext} {loadPrevious} {canGoBackwards} {canGoForwards} disabled={busy} />
		<ModalYesNo
			title={$i18n(confirmationTemplates[confirmationTypes.DESTROY].title)}
			open={Is.stringValue(confirmationId)}
			message={$i18n(confirmationTemplates[confirmationTypes.DESTROY].message)}
			busy={modalIsBusy}
			yesColor="error"
			yesAction={async () => confirmationAction()}
			noAction={async () => confirmationCancel()}
		/>
	{/if}
</section>
