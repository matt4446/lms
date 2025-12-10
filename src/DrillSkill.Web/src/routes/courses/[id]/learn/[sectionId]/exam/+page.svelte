<script lang="ts">
    import { enhance } from '$app/forms';
    import { fade } from 'svelte/transition';
    
    let { data, form } = $props();
    
    let submitting = $state(false);
</script>

<div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
            Exam: {data.exam.section.title}
        </h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Answer all questions to complete this section. Passing score is 70%.
        </p>
    </div>

    {#if form?.success}
        <div class="px-4 py-5 sm:p-6 text-center" in:fade>
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full {form.passed ? 'bg-green-100' : 'bg-red-100'}">
                {#if form.passed}
                    <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                {:else}
                    <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                {/if}
            </div>
            <h3 class="mt-2 text-lg font-medium text-gray-900">
                {form.passed ? 'Exam Passed!' : 'Exam Failed'}
            </h3>
            <p class="mt-1 text-sm text-gray-500">
                You scored {form.score.toFixed(1)}% ({form.correctCount}/{form.totalQuestions} correct).
            </p>
            <div class="mt-6">
                {#if form.passed}
                    <a href={`/courses/${data.exam.section.courseId}/learn/${data.exam.sectionId}`} class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Continue Learning
                    </a>
                {:else}
                    <button onclick={() => window.location.reload()} class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Try Again
                    </button>
                {/if}
            </div>
        </div>
    {:else}
        <form 
            method="POST" 
            action="?/submit" 
            use:enhance={() => {
                submitting = true;
                return async ({ update }) => {
                    submitting = false;
                    await update();
                };
            }}
        >
            <div class="border-t border-gray-200 px-4 py-5 sm:p-6 space-y-8">
                {#each data.exam.questions as question, i}
                    <div>
                        <h4 class="text-base font-medium text-gray-900 mb-4">
                            {i + 1}. {question.text}
                        </h4>
                        <div class="space-y-3">
                            {#each question.options as option}
                                <div class="flex items-center">
                                    <input
                                        id={`q${question.id}-${option.id}`}
                                        name={`question-${question.id}`}
                                        type="radio"
                                        value={option.id}
                                        required
                                        class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                    />
                                    <label for={`q${question.id}-${option.id}`} class="ml-3 block text-sm font-medium text-gray-700">
                                        {option.text}
                                    </label>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
            <div class="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button 
                    type="submit" 
                    disabled={submitting}
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {submitting ? 'Submitting...' : 'Submit Exam'}
                </button>
            </div>
        </form>
    {/if}
</div>
