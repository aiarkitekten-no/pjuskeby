import type { APIRoute } from 'astro';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export const POST: APIRoute = async ({ params }) => {
  const { id } = params;
  
  try {
    // In production, read from content/data instead of src/content/data
    const dataPath = join(process.cwd(), 'content/data/rumors.normalized.json');
    const fileContent = await readFile(dataPath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    const rumor = data.rumors.find((r: any) => r.id === id);
    
    if (!rumor) {
      return new Response(JSON.stringify({ error: 'Rumor not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Increment view count
    rumor.interactions.views++;
    
    await writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    
    return new Response(JSON.stringify({ 
      success: true, 
      views: rumor.interactions.views 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error tracking view:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
