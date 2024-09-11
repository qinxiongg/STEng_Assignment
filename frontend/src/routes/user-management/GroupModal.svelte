<script>
	export let showGroupModal; //boolean

	let dialog; // HTML dialog Element

	$: if (dialog && showGroupModal) dialog.showModal();
</script>

<dialog
	bind:this={dialog}
	on:close={() => (showGroupModal = false)}
	on:click|self={() => dialog.close()}
>
	<div on:click|stopPropagation>
		<slot></slot>
	</div>
</dialog>

<style>
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		width: 500px;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        border: none;
    }
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
		button {
			display: flex;
			justify-content: center;
			gap: 20px;
		}
	}
</style>
