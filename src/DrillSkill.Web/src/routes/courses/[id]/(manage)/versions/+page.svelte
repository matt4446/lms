<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';

  export let data: PageData;

  $: course = data.course;
  $: versions = course.versions;
  $: hasDraft = versions.some(v => v.status === 'DRAFT');
  $: publishedVersionId = course.publishedVersionId;

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <div>
      <h2 class="text-lg font-medium text-gray-900">Version History</h2>
      <p class="mt-1 text-sm text-gray-500">Manage course versions and publication status.</p>
    </div>
    
    {#if !hasDraft}
      <form action="?/createDraft" method="POST" use:enhance>
        <button
          type="submit"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create New Draft
        </button>
      </form>
    {/if}
  </div>

  <div class="bg-white shadow overflow-hidden sm:rounded-md">
    <ul class="divide-y divide-gray-200">
      {#each versions as version}
        <li class="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-blue-600 truncate">
                  Version {version.versionNumber}
                  {#if version.title !== course.title}
                    <span class="text-gray-500 font-normal ml-2">- {version.title}</span>
                  {/if}
                </p>
                <div class="ml-2 flex-shrink-0 flex">
                  {#if version.id === publishedVersionId}
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Live
                    </span>
                  {/if}
                  <span class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    {version.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 
                     version.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-800' : 
                     'bg-gray-100 text-gray-800'}">
                    {version.status}
                  </span>
                </div>
              </div>
              <div class="mt-2 sm:flex sm:justify-between">
                <div class="sm:flex">
                  <p class="flex items-center text-sm text-gray-500">
                    Updated {formatDate(version.updatedAt)}
                  </p>
                </div>
                <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <!-- Actions -->
                    {#if version.status === 'DRAFT'}
                        <form action="?/publish" method="POST" use:enhance class="ml-4">
                            <input type="hidden" name="versionId" value={version.id} />
                            <button type="submit" class="text-blue-600 hover:text-blue-900 font-medium">
                                Publish
                            </button>
                        </form>
                        <a href="/courses/{course.id}/edit" class="ml-4 text-gray-600 hover:text-gray-900">
                            Edit
                        </a>
                    {/if}
                    
                    {#if version.status === 'PUBLISHED' && version.id !== publishedVersionId}
                        <!-- Previously published versions -->
                        <span class="ml-4 text-gray-400">Previous Release</span>
                    {/if}
                </div>
              </div>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </div>
</div>
