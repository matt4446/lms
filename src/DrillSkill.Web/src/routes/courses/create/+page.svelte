<script lang="ts">
    import { enhance } from '$app/forms';
    import { env } from '$env/dynamic/public';
    import { goto } from '$app/navigation';
    import Toast from '$lib/components/Toast.svelte';
    import ExamEditor from '$lib/components/ExamEditor.svelte';
    
    let topic = $state("");
    let loading = $state(false);
    let error = $state("");
    let toast = $state<{ message: string; type: 'info' | 'success' | 'error' | 'warning' } | null>(null);

    const aiEnabled = env.PUBLIC_ENABLE_AI === 'true';

    let generatedCourse = $state<any>(aiEnabled ? null : {
        title: "",
        description: "",
        sections: [{ title: "", content: "", exam: null }]
    });

    function addSection() {
        if (generatedCourse) {
            generatedCourse.sections = [...generatedCourse.sections, { title: "", content: "", exam: null }];
        }
    }

    function toggleExam(sectionIndex: number) {
        if (!generatedCourse) return;
        
        const section = generatedCourse.sections[sectionIndex];
        if (section.exam) {
            // Remove exam
            section.exam = null;
        } else {
            // Add exam
            section.exam = { questions: [] };
        }
        // Trigger reactivity
        generatedCourse.sections = [...generatedCourse.sections];
    }

    async function generateCourse() {
        if (!topic) return;
        
        loading = true;
        error = "";
        generatedCourse = null;

        try {
            const response = await fetch('/api/courses/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ topic })
            });

            if (!response.ok) {
                throw new Error('Failed to generate course');
            }

            generatedCourse = await response.json();
        } catch (e) {
            error = "An error occurred while generating the course. Please try again.";
            console.error(e);
        } finally {
            loading = false;
        }
    }
</script>

{#if toast}
    <Toast 
        message={toast.message} 
        type={toast.type} 
        onclose={() => toast = null} 
    />
{/if}

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    {#if aiEnabled}
    <div class="text-center mb-12">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Create New Course with AI
        </h2>
        <p class="mt-4 text-lg text-gray-500">
            Enter a topic below and let our AI instructional designer build a comprehensive course structure for you in seconds.
        </p>
    </div>

    <div class="bg-white shadow-xl rounded-2xl overflow-hidden mb-12 transition-all duration-200 hover:shadow-2xl">
        <div class="p-8 sm:p-10">
            <div class="max-w-2xl mx-auto">
                <label for="topic" class="block text-sm font-medium text-gray-700 mb-2">What do you want to teach?</label>
                <div class="relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <input type="text" name="topic" id="topic" bind:value={topic} class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3" placeholder="e.g. Advanced React Patterns, Introduction to Pottery...">
                </div>
                
                <div class="mt-6 flex justify-center">
                    <button type="button" onclick={generateCourse} disabled={loading || !topic} class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 w-full sm:w-auto">
                        {#if loading}
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating Course Structure...
                        {:else}
                            Generate Outline
                        {/if}
                    </button>
                </div>
            </div>
        </div>
        
        {#if error}
            <div class="bg-red-50 border-t border-red-100 p-4">
                <div class="flex justify-center">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        {/if}
    </div>
    {:else}
    <div class="text-center mb-12">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Create New Course
        </h2>
        <p class="mt-4 text-lg text-gray-500">
            Manually create your course structure below.
        </p>
    </div>
    {/if}

    {#if generatedCourse}
        <form 
            method="POST" 
            action="?/save" 
            use:enhance={() => {
                toast = { message: 'Saving course...', type: 'info' };
                
                return async ({ result }) => {
                    if (result.type === 'success') {
                        toast = { message: 'Course saved successfully!', type: 'success' };
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        goto('/courses');
                    } else if (result.type === 'failure') {
                        toast = { message: (result.data?.error as string) || 'Failed to save course', type: 'error' };
                    } else if (result.type === 'error') {
                        toast = { message: 'An unexpected error occurred', type: 'error' };
                    }
                };
            }} 
            class="animate-fade-in-up"
        >
            <div class="bg-white shadow-xl rounded-2xl overflow-hidden mb-8 border border-gray-100">
                <div class="px-6 py-8 sm:px-10 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-xl leading-6 font-bold text-gray-900">{aiEnabled ? 'Course Preview' : 'Course Details'}</h3>
                            <p class="mt-1 max-w-2xl text-sm text-gray-500">
                                {aiEnabled ? 'Review and customize the generated content before saving.' : 'Enter the details for your new course.'}
                            </p>
                        </div>
                        {#if aiEnabled}
                        <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            AI Generated
                        </span>
                        {/if}
                    </div>
                </div>
                <div class="px-6 py-8 sm:px-10 space-y-8">
                    <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div class="sm:col-span-6">
                            <label for="title" class="block text-sm font-medium text-gray-700">Course Title</label>
                            <div class="mt-1">
                                <input type="text" name="title" id="title" bind:value={generatedCourse.title} class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3">
                            </div>
                        </div>
                        
                        <div class="sm:col-span-6">
                            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                            <div class="mt-1">
                                <textarea name="description" id="description" rows="3" bind:value={generatedCourse.description} class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3"></textarea>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <svg class="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Course Sections
                        </h4>
                        <div class="space-y-6">
                            {#each generatedCourse.sections as section, i}
                                <div class="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
                                    <div class="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                                        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Section {i + 1}</span>
                                    </div>
                                    <div class="p-4 space-y-4">
                                        <div>
                                            <label for={`section-title-${i}`} class="block text-sm font-medium text-gray-700">Title</label>
                                            <input type="text" name={`sections[${i}][title]`} id={`section-title-${i}`} bind:value={section.title} class="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3">
                                        </div>
                                        <div>
                                            <label for={`section-content-${i}`} class="block text-sm font-medium text-gray-700">Content (Markdown)</label>
                                            <textarea name={`sections[${i}][content]`} id={`section-content-${i}`} rows="6" bind:value={section.content} class="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md font-mono text-xs bg-white py-2 px-3"></textarea>
                                        </div>

                                        <div class="pt-4 border-t border-gray-200">
                                            <div class="flex items-center justify-between mb-4">
                                                <h5 class="text-sm font-medium text-gray-900">Assessment</h5>
                                                <button 
                                                    type="button" 
                                                    onclick={() => toggleExam(i)}
                                                    class="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
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
                        </div>
                        
                        <div class="mt-6 flex justify-center">
                            <button type="button" onclick={addSection} class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                                </svg>
                                Add Section
                            </button>
                        </div>
                    </div>
                </div>
                <div class="px-6 py-4 bg-gray-50 text-right sm:px-10 border-t border-gray-200">
                    <button type="submit" class="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
                        Save & Publish Course
                    </button>
                </div>
            </div>
            
            <!-- Hidden input to pass the raw JSON if needed, but individual fields are better for form handling -->
            <input type="hidden" name="courseData" value={JSON.stringify(generatedCourse)} />
        </form>
    {/if}
</div>
