<script lang="ts">
    let { questions = $bindable([]) } = $props();

    function addQuestion() {
        questions = [
            ...questions,
            {
                id: crypto.randomUUID(),
                text: '',
                options: [
                    { id: 'a', text: '' },
                    { id: 'b', text: '' },
                    { id: 'c', text: '' },
                    { id: 'd', text: '' }
                ],
                correctOptionId: 'a'
            }
        ];
    }

    function removeQuestion(index: number) {
        questions = questions.filter((_, i) => i !== index);
    }

    function addOption(questionIndex: number) {
        const question = questions[questionIndex];
        const newOptionId = String.fromCharCode(97 + question.options.length); // a, b, c, ...
        question.options = [...question.options, { id: newOptionId, text: '' }];
        questions[questionIndex] = question;
    }

    function removeOption(questionIndex: number, optionIndex: number) {
        const question = questions[questionIndex];
        question.options = question.options.filter((_: any, i: number) => i !== optionIndex);
        questions[questionIndex] = question;
    }
</script>

<div class="space-y-6">
    {#each questions as question, qIndex}
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
            <button
                type="button"
                onclick={() => removeQuestion(qIndex)}
                class="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Remove Question"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L10 8.586 5.707 4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>

            <div class="mb-4">
                <label for={`question-${qIndex}`} class="block text-sm font-medium text-gray-700 mb-1">Question {qIndex + 1}</label>
                <input
                    id={`question-${qIndex}`}
                    type="text"
                    bind:value={question.text}
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3"
                    placeholder="Enter question text"
                />
            </div>

            <div class="space-y-2 pl-4 border-l-2 border-indigo-100">
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Options</label>
                {#each question.options as option, oIndex}
                    <div class="flex items-center space-x-2">
                        <input
                            type="radio"
                            name={`correct-option-${qIndex}`}
                            value={option.id}
                            bind:group={question.correctOptionId}
                            class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                            title="Mark as correct answer"
                        />
                        <input
                            type="text"
                            bind:value={option.text}
                            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-1 px-2"
                            placeholder={`Option ${option.id}`}
                        />
                        {#if question.options.length > 2}
                            <button
                                type="button"
                                onclick={() => removeOption(qIndex, oIndex)}
                                class="text-gray-400 hover:text-red-500"
                                aria-label="Remove Option"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L10 8.586 5.707 4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        {/if}
                    </div>
                {/each}
                <button
                    type="button"
                    onclick={() => addOption(qIndex)}
                    class="text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2"
                >
                    + Add Option
                </button>
            </div>
        </div>
    {/each}

    <button
        type="button"
        onclick={addQuestion}
        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
        <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Question
    </button>
</div>
