<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-900">My Courses</h1>
    <a href="/courses/create" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      Create Course
    </a>
  </div>

  {#if data.courses.length === 0}
    <div class="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
      <p class="text-gray-500 mb-4">You haven't created any courses yet.</p>
      <a href="/courses/create" class="text-blue-600 hover:underline">Get started by creating your first course</a>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each data.courses as course}
        <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div class="h-40 bg-gray-200 flex items-center justify-center">
            {#if course.coverImage}
              <img src={course.coverImage} alt={course.title} class="w-full h-full object-cover" />
            {:else}
              <span class="text-gray-400 text-4xl">📚</span>
            {/if}
          </div>
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-2">{course.title}</h2>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">{course.description || 'No description'}</p>
            
            <div class="flex justify-between items-center text-sm">
              <span class={`px-2 py-1 rounded ${course.publishedVersion ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {course.publishedVersion ? 'Published' : 'Draft'}
              </span>
              <a href="/courses/{course.id}/edit" class="text-blue-600 hover:underline">Manage</a>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
