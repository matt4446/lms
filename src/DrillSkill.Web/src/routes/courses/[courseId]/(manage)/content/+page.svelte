<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData, ActionData } from './$types';
    import ExamEditor from '$lib/components/ExamEditor.svelte';
    import Toast from '$lib/components/Toast.svelte';

    let { data, form } = $props<{ data: PageData, form: ActionData }>();

    type SectionState = {
        id: string | null;
        title: string;
        content: string | null;
        exam: { questions: any[] } | null;
    };

    // Initialize state from data
    // Use $state for reactivity
    let sections = $state<SectionState[]>(data.sections.map(s => ({
        id: s.id,
        title: s.title,
        content: s.content,
        exam: s.exam ? { questions: s.exam.questions as any[] } : null
    })));

    let toast = $state<{ message: string; type: 'info' | 'success' | 'error' | 'warning' } | null>(null);

    function addSection() {
        sections.push({ id: null, title: "", content: "", exam: null });
    }

    function removeSection(index: number) {
        if (confirm('Are you sure you want to remove this section?')) {
            sections.splice(index, 1);
        }
    }

    function toggleExam(index: number) {
        const section = sections[index];
        if (section.exam) {
            section.exam = null;
        } else {
            section.exam = { questions: [] };
        }
    }

    $effect(() => {
        if (form?.success) {
            toast = { message: 'Content saved successfully!', type: 'success' };
        } else if (form?.message) {
            toast = { message: form.message, type: 'error' };
        }
    });
</script>

{#if toast}
    <Toast 
        message={toast.message} 
        type={toast.type} 
        onclose={() => toast = null} 
    />
{/if}

<div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Course Content</h1>
        <button 
            type="button" 
            onclick={addSection}
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Section
        </button>
    </div>

    <form 
        method="POST" 
        action="?/save" 
        use:enhance={() => {
            toast = { message: 'Saving content...', type: 'info' };
            return async ({ update }) => {
                await update();
            };
        }}
        class="space-y-8"
    >
        <div class="space-y-6">
            {#each sections as section, i}
                <div class="bg-white shadow rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
                    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <div class="flex items-center">
                            <span class="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold mr-3">
                                {i + 1}
                            </span>
                            <h3 class="text-sm font-medium text-gray-900">
                                {section.title || 'Untitled Section'}
                            </h3>
                        </div>
                        <button 
                            type="button" 
                            onclick={() => removeSection(i)}
                            class="text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove Section"
                        >
                            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    
                    <div class="p-6 space-y-6">
                        <div>
                            <label for={`section-title-${i}`} class="block text-sm font-medium text-gray-700">Title</label>
                            <input 
                                type="text" 
                                id={`section-title-${i}`} 
                                bind:value={section.title} 
                                class="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3"
                                placeholder="Section Title"
                            >
                        </div>
                        
                        <div>
                            <label for={`section-content-${i}`} class="block text-sm font-medium text-gray-700">
                                Content <span class="text-gray-400 font-normal">(Markdown supported)</span>
                            </label>
                            <textarea 
                                id={`section-content-${i}`} 
                                rows="6" 
                                bind:value={section.content} 
                                class="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md font-mono text-sm bg-gray-50 py-2 px-3"
                                placeholder="# Introduction..."
                            ></textarea>
                        </div>

                        <div class="pt-4 border-t border-gray-100">
                            <div class="flex items-center justify-between mb-4">
                                <h5 class="text-sm font-medium text-gray-900 flex items-center">
                                    <svg class="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Assessment
                                </h5>
                                <button 
                                    type="button" 
                                    onclick={() => toggleExam(i)}
                                    class={`text-sm font-medium px-3 py-1 rounded-md transition-colors ${section.exam ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                                >
                                    {section.exam ? 'Remove Exam' : 'Add Exam'}
                                </button>
                            </div>
                            
                            {#if section.exam}
                                <div class="bg-indigo-50 p-4 rounded-md border border-indigo-100">
                                    <ExamEditor bind:questions={section.exam.questions} />
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}

            {#if sections.length === 0}
                <div class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No sections</h3>
                    <p class="mt-1 text-sm text-gray-500">Get started by adding a new section to your course.</p>
                    <div class="mt-6">
                        <button 
                            type="button" 
                            onclick={addSection}
                            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                            </svg>
                            Add Section
                        </button>
                    </div>
                </div>
            {/if}
        </div>

        <div class="flex justify-end pt-6 border-t border-gray-200">
            <button 
                type="submit" 
                class="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
                Save All Changes
            </button>
        </div>
        
        <input type="hidden" name="sections" value={JSON.stringify(sections)} />
    </form>
</div>
