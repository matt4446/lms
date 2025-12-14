<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Export Course: {data.course?.title}</h1>
    <a href="/dashboard/courses/{data.course?.id}" class="text-blue-600 hover:underline">Back to Course</a>
  </div>

  {#if form?.message}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      {form.message}
    </div>
  {/if}

  {#if form?.success}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
      Export started! Refresh the page to see status.
    </div>
  {/if}

  <div class="bg-white shadow overflow-hidden sm:rounded-md">
    <ul class="divide-y divide-gray-200">
      {#each data.versions as version}
        <li class="px-4 py-4 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-medium text-gray-900">
                Version {version.versionNumber}
                {#if version.status === 'PUBLISHED'}
                  <span class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Published</span>
                {:else}
                  <span class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Draft</span>
                {/if}
              </h3>
              <p class="text-sm text-gray-500 truncate">{version.description || 'No description'}</p>
              
              {#if version.exports.length > 0}
                <div class="mt-2">
                  {#each version.exports as exp}
                    <div class="text-sm text-gray-500">
                      Last export: {exp.status} at {new Date(exp.createdAt).toLocaleString()}
                      {#if exp.status === 'COMPLETED'}
                        <a href="/api/downloads/{exp.id}" class="ml-2 text-blue-600 hover:underline" target="_blank">Download ZIP</a>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
            
            <div class="ml-4 flex-shrink-0">
              <form method="POST" use:enhance>
                <input type="hidden" name="versionId" value={version.id} />
                <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm">
                  Generate Export
                </button>
              </form>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </div>
</div>
