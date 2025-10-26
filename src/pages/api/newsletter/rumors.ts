import type { APIRoute } from 'astro';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { calculateTrendingScore } from '../../../utils/trending';

export const GET: APIRoute = async () => {
  try {
    // Read rumors data
    const rumorsData = JSON.parse(
      await readFile(join(process.cwd(), 'content/data/rumors.normalized.json'), 'utf-8')
    );

    const rumors = rumorsData.rumors;

    // Get top 5 trending rumors
    const trendingRumors = [...rumors]
      .map((r: any) => ({ ...r, trendingScore: calculateTrendingScore(r) }))
      .sort((a: any, b: any) => b.trendingScore - a.trendingScore)
      .slice(0, 5);

    // Get rumors from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRumors = rumors.filter((r: any) => new Date(r.createdAt) >= sevenDaysAgo);

    // Newsletter data
    const newsletter = {
      generatedAt: new Date().toISOString(),
      period: {
        from: sevenDaysAgo.toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
      },
      summary: {
        totalRumors: rumors.length,
        newThisWeek: recentRumors.length,
        totalViews: rumors.reduce((sum: number, r: any) => sum + (r.interactions?.views || 0), 0),
        mostActiveCategory: Object.entries(
          rumors.reduce((acc: Record<string, number>, r: any) => {
            acc[r.category] = (acc[r.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).sort((a: any, b: any) => b[1] - a[1])[0][0]
      },
      trending: trendingRumors.map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        excerpt: r.content.substring(0, 100) + '...',
        credibility: r.credibility,
        trendingScore: Math.round(r.trendingScore),
        url: `https://pjuskeby.org/rykter/${r.id}`,
        imageUrl: r.imageUrl ? `https://pjuskeby.org${r.imageUrl}` : null,
        stats: {
          views: r.interactions?.views || 0,
          confirmed: r.interactions?.confirmed || 0,
          debunked: r.interactions?.debunked || 0,
          shared: r.interactions?.shared || 0
        }
      })),
      newThisWeek: recentRumors.slice(0, 5).map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        excerpt: r.content.substring(0, 100) + '...',
        credibility: r.credibility,
        url: `https://pjuskeby.org/rykter/${r.id}`,
        publishedAt: r.createdAt
      }))
    };

    // Return JSON response
    return new Response(JSON.stringify(newsletter, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Newsletter API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate newsletter' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
