<script lang="ts">
    import { marked } from 'marked';
    import { enhance } from '$app/forms';
    let { data } = $props();
    
    let content = $derived(marked.parse(data.section.content || ''));
    
    let isCompleted = $derived(
        data.enrollment?.progress && 
        (data.enrollment.progress as any)[data.section.id]?.completed
    );
</script>

<div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
            {data.section.title}
        </h3>
    </div>
    <div class="border-t border-gray-200 px-4 py-5 sm:p-6 prose max-w-none">
        {@html content}
    </div>
    <div class="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200 flex justify-end">
        {#if isCompleted}
            <span class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100">
                <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Completed
            </span>
        {:else if data.section.exam}
            <a 
                href={`/courses/${data.section.courseId}/learn/${data.section.id}/exam`}
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Take Exam
            </a>
        {:else}
            <form method="POST" action="?/complete" use:enhance>
                <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Mark as Complete
                </button>
            </form>
        {/if}
    </div>
</div>
