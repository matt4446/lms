<script lang="ts">
    import { fade, fly } from 'svelte/transition';

    type ToastType = 'info' | 'success' | 'error' | 'warning';

    let { message, type = 'info', duration = 3000, onclose } = $props<{
        message: string;
        type?: string;
        duration?: number;
        onclose?: () => void;
    }>();

    $effect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onclose?.();
            }, duration);
            return () => clearTimeout(timer);
        }
    });

    const colors: Record<string, string> = {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500'
    };
</script>

<div
    in:fly={{ y: 20, duration: 300 }}
    out:fade
    class="fixed bottom-4 right-4 z-50 flex items-center px-4 py-3 rounded shadow-lg text-white {colors[type] || colors.info}"
    role="alert"
>
    <span>{message}</span>
</div>
