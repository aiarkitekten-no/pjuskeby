import type { APIRoute } from 'astro';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface RumorData {
  rumors: Array<{
    id: string;
    interactions: {
      views: number;
      confirmed: number;
      debunked: number;
      shared: number;
    };
  }>;
}

export const POST: APIRoute = async ({ params, request }) => {
  const { id } = params;
  
  try {
    const body = await request.json();
    const { reactionType } = body;
    
    if (!['confirmed', 'debunked', 'shared'].includes(reactionType)) {
      return new Response(JSON.stringify({ error: 'Invalid reaction type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // In production, read from content/data instead of src/content/data
    const dataPath = join(process.cwd(), 'content/data/rumors.normalized.json');
    const fileContent = await readFile(dataPath, 'utf-8');
    const data: RumorData = JSON.parse(fileContent);
    
    const rumor = data.rumors.find(r => r.id === id);
    
    if (!rumor) {
      return new Response(JSON.stringify({ error: 'Rumor not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Increment the reaction count
    rumor.interactions[reactionType as keyof typeof rumor.interactions]++;
    
    // Save updated data
    await writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    
    return new Response(JSON.stringify({ 
      success: true, 
      interactions: rumor.interactions 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error processing reaction:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
