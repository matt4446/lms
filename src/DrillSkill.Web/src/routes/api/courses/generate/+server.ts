import { json } from '@sveltejs/kit';
import { openai } from '$lib/server/ai';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';

export const POST: RequestHandler = async ({ request }) => {
    if (env.PUBLIC_ENABLE_AI !== 'true') {
        return json({ error: 'AI generation is disabled' }, { status: 403 });
    }

    const { topic } = await request.json();

    if (!topic) {
        return json({ error: 'Topic is required' }, { status: 400 });
    }

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an expert instructional designer. Create a comprehensive course outline based on the user's topic.
                    Return ONLY a valid JSON object with the following structure:
                    {
                        "title": "Course Title",
                        "description": "Brief course description",
                        "sections": [
                            {
                                "title": "Section Title",
                                "content": "Detailed educational content for this section in Markdown format. Include headers, bullet points, and code examples if relevant. Make it at least 300 words."
                            }
                        ]
                    }
                    Generate at least 3-5 sections.`
                },
                { role: "user", content: `Create a course about: ${topic}` }
            ],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error('No content generated');
        }

        const courseData = JSON.parse(content);
        return json(courseData);

    } catch (error) {
        console.error('AI Generation Error:', error);
        return json({ error: 'Failed to generate course' }, { status: 500 });
    }
};
