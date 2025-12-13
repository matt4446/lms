<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';

  export let data: PageData;
  export let form: ActionData;

  $: latestVersion = data.latestVersion;
  $: isPublished = latestVersion.status === 'PUBLISHED';
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Edit Course Details</h1>
    {#if isPublished}
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Published
      </span>
    {:else}
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Draft
      </span>
    {/if}
  </div>

  <form method="POST" action="?/update" use:enhance class="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-6">
    <input type="hidden" name="versionId" value={latestVersion.id} />

    {#if isPublished}
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              You are editing a published version. Changes will be live immediately.
            </p>
          </div>
        </div>
      </div>
    {/if}

    {#if form?.message}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{form.message}</span>
      </div>
    {/if}
    
    {#if form?.success}
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">Successfully saved!</span>
      </div>
    {/if}

    <div>
      <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
      <input
        type="text"
        name="title"
        id="title"
        value={latestVersion.title}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        required
      />
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea
        id="description"
        name="description"
        rows="4"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >{latestVersion.description || ''}</textarea>
    </div>

    <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
      <div>
        <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
        <input
          type="datetime-local"
          name="startDate"
          id="startDate"
          value={latestVersion.startDate ? new Date(latestVersion.startDate).toISOString().slice(0, 16) : ''}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
        <input
          type="datetime-local"
          name="endDate"
          id="endDate"
          value={latestVersion.endDate ? new Date(latestVersion.endDate).toISOString().slice(0, 16) : ''}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>

    <div class="flex justify-end pt-4 border-t border-gray-100">
      <button
        type="submit"
        class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium shadow-sm transition-colors"
      >
        Save Changes
      </button>
    </div>
  </form>
</div>
