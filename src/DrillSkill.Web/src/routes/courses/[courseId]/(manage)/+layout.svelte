<script lang="ts">
  import type { LayoutData } from './$types';
  import { page } from '$app/stores';

  export let data: LayoutData;

  $: course = data.course;
  $: activeTab = $page.url.pathname.split('/').pop();
</script>

<div class="flex h-full flex-col">
  <header class="border-b bg-white px-6 py-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{course.title}</h1>
        <p class="text-sm text-gray-500">
          {#if course.publishedVersion}
            <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              Published
            </span>
          {:else}
            <span class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
              Draft
            </span>
          {/if}
        </p>
      </div>
      <div class="flex space-x-3">
        <a
          href="/courses"
          class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Back to Courses
        </a>
      </div>
    </div>

    <nav class="-mb-px flex space-x-8 mt-4" aria-label="Tabs">
      <a
        href="/courses/{course.id}/edit"
        class:border-indigo-500={activeTab === 'edit'}
        class:text-indigo-600={activeTab === 'edit'}
        class:border-transparent={activeTab !== 'edit'}
        class:text-gray-500={activeTab !== 'edit'}
        class="whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium hover:border-gray-300 hover:text-gray-700"
      >
        General
      </a>
      <a
        href="/courses/{course.id}/content"
        class:border-indigo-500={activeTab === 'content'}
        class:text-indigo-600={activeTab === 'content'}
        class:border-transparent={activeTab !== 'content'}
        class:text-gray-500={activeTab !== 'content'}
        class="whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium hover:border-gray-300 hover:text-gray-700"
      >
        Content
      </a>
      <a
        href="/courses/{course.id}/settings"
        class:border-indigo-500={activeTab === 'settings'}
        class:text-indigo-600={activeTab === 'settings'}
        class:border-transparent={activeTab !== 'settings'}
        class:text-gray-500={activeTab !== 'settings'}
        class="whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium hover:border-gray-300 hover:text-gray-700"
      >
        Settings
      </a>
    </nav>
  </header>

  <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
    <slot />
  </main>
</div>
