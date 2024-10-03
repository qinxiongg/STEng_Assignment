<script>
	import { customError, alertSuccess, handleError } from '$lib/errorHandler';
	import { toast, Toaster } from 'svelte-sonner';
</script>

<Toaster style="z-index: 20;" richColors/>

<slot></slot>
