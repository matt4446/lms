<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	
	let { children, data } = $props();
</script>

<div class="min-h-screen flex flex-col bg-gray-50">
	<Navbar session={data.session} />
	<main class="flex-grow">
		{@render children()}
	</main>
	<Footer />
</div>

