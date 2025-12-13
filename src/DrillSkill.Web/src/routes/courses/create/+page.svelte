<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;
</script>

<!-- Form -->
<div class="container mx-auto px-4 py-8 max-w-2xl">
  <h1 class="text-2xl font-bold text-gray-900 mb-6">Create New Course</h1>

  <form method="POST" use:enhance class="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-6">
    {#if form?.message}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{form.message}</span>
      </div>
    {/if}

    <div>
      <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
      <input 
        type="text" 
        id="title" 
        name="title" 
        value={form?.title ?? ''}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        placeholder="e.g. Advanced Drilling Techniques"
        required
      />
      {#if form?.missing}
        <p class="text-red-500 text-xs mt-1">Title is required</p>
      {/if}
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea 
        id="description" 
        name="description" 
        rows="4"
        value={form?.description ?? ''}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        placeholder="Briefly describe what this course is about..."
      ></textarea>
    </div>

    <div class="flex justify-end space-x-3">
      <a href="/courses" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</a>
      <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        Create Course
      </button>
    </div>
  </form>
</div>
