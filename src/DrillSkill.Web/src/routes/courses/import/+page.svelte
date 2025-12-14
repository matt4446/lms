<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  let { data } = $props<{ data: PageData }>();

  let files = $state<FileList>();
  let uploading = $state(false);
  let progress = $state(0);
  let status = $state('');
  let error = $state('');

  // Options
  let strategy = $state<'CREATE' | 'OVERWRITE'>('CREATE');
  let targetCourseId = $state('');
  let includeMetadata = $state(true);
  let includeContent = $state(true);
  let includeUsers = $state(false);
  let includeResults = $state(false);

  const CHUNK_SIZE = 1024 * 1024; // 1MB

  async function handleUpload() {
    const file = files?.[0];
    if (!file) return;

    if (strategy === 'OVERWRITE' && !targetCourseId) {
        error = 'Please select a course to overwrite.';
        return;
    }

    uploading = true;
    progress = 0;
    status = 'Initializing upload...';
    error = '';

    try {
      // 1. Init
      const initRes = await fetch('/api/uploads/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/zip'
        })
      });

      if (!initRes.ok) throw new Error('Failed to initialize upload');
      const { uploadId } = await initRes.json();

      // 2. Upload Chunks
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      
      for (let i = 0; i < totalChunks; i++) {
        status = `Uploading chunk ${i + 1} of ${totalChunks}...`;
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const chunkRes = await fetch('/api/uploads/chunk', {
          method: 'POST',
          headers: {
            'X-Upload-Id': uploadId,
            'Content-Type': 'application/octet-stream'
          },
          body: chunk
        });

        if (!chunkRes.ok) throw new Error(`Failed to upload chunk ${i + 1}`);
        
        progress = Math.round(((i + 1) / totalChunks) * 100);
      }

      // 3. Finalize
      status = 'Processing import...';
      const finalizeRes = await fetch('/api/courses/import/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            uploadId,
            options: {
                strategy,
                targetCourseId: strategy === 'OVERWRITE' ? targetCourseId : undefined,
                include: {
                    metadata: includeMetadata,
                    content: includeContent,
                    users: includeUsers,
                    results: includeResults
                }
            }
        })
      });

      if (!finalizeRes.ok) {
          const errData = await finalizeRes.json();
          throw new Error(errData.error || 'Import failed');
      }

      const { courseId } = await finalizeRes.json();
      
      status = 'Import complete!';
      setTimeout(() => {
        goto(`/courses/${courseId}`);
      }, 1000);

    } catch (e: any) {
      error = e.message;
      uploading = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto p-6">
  <h1 class="text-2xl font-bold mb-6">Import Course</h1>

  <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
    
    <!-- File Selection -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2" for="file">
        Select Course Package (.zip)
      </label>
      <input
        bind:files
        type="file"
        accept=".zip"
        disabled={uploading}
        class="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
    </div>

    <!-- Import Strategy -->
    <div class="border-t pt-4">
        <h3 class="text-lg font-medium text-gray-900 mb-3">Import Options</h3>
        
        <div class="space-y-4">
            <div class="flex items-center">
                <input 
                    id="strategy-create" 
                    name="strategy" 
                    type="radio" 
                    value="CREATE" 
                    bind:group={strategy}
                    disabled={uploading}
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                >
                <label for="strategy-create" class="ml-3 block text-sm font-medium text-gray-700">
                    Create New Course
                </label>
            </div>
            
            <div class="flex items-center">
                <input 
                    id="strategy-overwrite" 
                    name="strategy" 
                    type="radio" 
                    value="OVERWRITE" 
                    bind:group={strategy}
                    disabled={uploading}
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                >
                <label for="strategy-overwrite" class="ml-3 block text-sm font-medium text-gray-700">
                    Overwrite Existing Course
                </label>
            </div>

            {#if strategy === 'OVERWRITE'}
                <div class="ml-7">
                    <select 
                        bind:value={targetCourseId} 
                        disabled={uploading}
                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="" disabled selected>Select a course to overwrite...</option>
                        {#each data.courses as course}
                            <option value={course.id}>{course.title}</option>
                        {/each}
                    </select>
                </div>
            {/if}
        </div>
    </div>

    <!-- Include Options -->
    <div class="border-t pt-4">
        <h4 class="text-sm font-medium text-gray-900 mb-3">Include Data</h4>
        <div class="space-y-2">
            <div class="flex items-start">
                <div class="flex items-center h-5">
                    <input 
                        id="include-metadata" 
                        type="checkbox" 
                        bind:checked={includeMetadata}
                        disabled={uploading}
                        class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    >
                </div>
                <div class="ml-3 text-sm">
                    <label for="include-metadata" class="font-medium text-gray-700">Course Metadata</label>
                    <p class="text-gray-500">Title, description, etc.</p>
                </div>
            </div>

            <div class="flex items-start">
                <div class="flex items-center h-5">
                    <input 
                        id="include-content" 
                        type="checkbox" 
                        bind:checked={includeContent}
                        disabled={uploading}
                        class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    >
                </div>
                <div class="ml-3 text-sm">
                    <label for="include-content" class="font-medium text-gray-700">Course Content</label>
                    <p class="text-gray-500">Sections, modules, and lessons.</p>
                </div>
            </div>

            <div class="flex items-start">
                <div class="flex items-center h-5">
                    <input 
                        id="include-users" 
                        type="checkbox" 
                        bind:checked={includeUsers}
                        disabled={uploading}
                        class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    >
                </div>
                <div class="ml-3 text-sm">
                    <label for="include-users" class="font-medium text-gray-700">Enrolled Users</label>
                    <p class="text-gray-500">Student enrollments (if available in package).</p>
                </div>
            </div>

            <div class="flex items-start">
                <div class="flex items-center h-5">
                    <input 
                        id="include-results" 
                        type="checkbox" 
                        bind:checked={includeResults}
                        disabled={uploading}
                        class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    >
                </div>
                <div class="ml-3 text-sm">
                    <label for="include-results" class="font-medium text-gray-700">Exam Results</label>
                    <p class="text-gray-500">Student grades and progress (if available in package).</p>
                </div>
            </div>
        </div>
    </div>

    {#if error}
      <div class="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    {/if}

    {#if uploading}
      <div class="mb-4">
        <div class="flex justify-between text-sm font-medium text-gray-700 mb-1">
          <span>{status}</span>
          <span>{progress}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-blue-600 h-2.5 rounded-full" style="width: {progress}%"></div>
        </div>
      </div>
    {:else}
      <button
        onclick={handleUpload}
        disabled={!files?.length || (strategy === 'OVERWRITE' && !targetCourseId)}
        class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Start Import
      </button>
    {/if}
  </div>
</div>
