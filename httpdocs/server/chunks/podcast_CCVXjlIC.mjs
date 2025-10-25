const RSS_FEED_URL = "https://api.substack.com/feed/podcast/5910955.rss";
async function fetchPodcastEpisodes() {
  try {
    const response = await fetch(RSS_FEED_URL);
    const xmlText = await response.text();
    const episodes = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = xmlText.match(itemRegex);
    if (!items) return [];
    for (const item of items) {
      const title = extractTag(item, "title");
      const description = extractTag(item, "description");
      const pubDateStr = extractTag(item, "pubDate");
      const guid = extractTag(item, "guid");
      const enclosureMatch = item.match(/<enclosure[^>]+url="([^"]+)"/);
      const audioUrl = enclosureMatch ? enclosureMatch[1] : "";
      const duration = extractTag(item, "itunes:duration") || "00:00";
      const episodeMatch = item.match(/<itunes:episode>(\d+)<\/itunes:episode>/);
      const episodeNumber = episodeMatch ? parseInt(episodeMatch[1]) : void 0;
      const imageMatch = item.match(/<itunes:image[^>]+href="([^"]+)"/);
      const imageUrl = imageMatch ? imageMatch[1] : void 0;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      episodes.push({
        guid,
        title,
        description: cleanHtml(description),
        pubDate: new Date(pubDateStr),
        audioUrl,
        duration,
        episodeNumber,
        imageUrl,
        slug
      });
    }
    episodes.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    return episodes;
  } catch (error) {
    console.error("Failed to fetch podcast RSS feed:", error);
    return [];
  }
}
function extractTag(xml, tagName) {
  const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`));
  if (match) {
    return match[1].trim();
  }
  return "";
}
function cleanHtml(html) {
  return html.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}
function formatDuration(duration) {
  if (!duration) return "0:00";
  if (duration.includes(":")) {
    return duration;
  }
  const seconds = parseInt(duration);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export { formatDuration as a, fetchPodcastEpisodes as f };
