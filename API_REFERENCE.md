# Pjuskeby API Quick Reference

**Base URL**: `http://localhost:4100`  
**Production**: `https://api.pjuskeby.org` (when deployed)

## Quick Start

```bash
# Health check
curl http://localhost:4100/health

# List all streets
curl http://localhost:4100/api/streets

# Get admin stats
curl http://localhost:4100/api/admin/stats

# List draft stories
curl "http://localhost:4100/api/stories?status=draft"

# Get map layers
curl http://localhost:4100/api/map/layers
```

## Authentication

```bash
# Register new user
curl -X POST http://localhost:4100/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:4100/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Get current user
curl http://localhost:4100/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Entities (CRUD Pattern)

All entity endpoints follow the same pattern:

```bash
# List all (replace {entity} with: streets, places, people, businesses, organizations, events, lakes)
GET /api/{entity}

# Create new
POST /api/{entity}
{
  "name": "Example Name",
  "slug": "example-name",
  "description": "Description here",
  ...
}

# Get by slug
GET /api/{entity}/:slug

# Update by slug
PATCH /api/{entity}/:slug
{
  "description": "Updated description"
}

# Delete by slug
DELETE /api/{entity}/:slug
```

### Streets

```bash
# List all streets
curl http://localhost:4100/api/streets

# Create new street
curl -X POST http://localhost:4100/api/streets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hovedgata",
    "slug": "hovedgata",
    "description": "Main street in Pjuskeby",
    "significance": "historical",
    "historical_context": "Built in 1850"
  }'

# Get street by slug
curl http://localhost:4100/api/streets/hovedgata

# Update street
curl -X PATCH http://localhost:4100/api/streets/hovedgata \
  -H "Content-Type: application/json" \
  -d '{"description": "Updated description"}'

# Delete street
curl -X DELETE http://localhost:4100/api/streets/hovedgata
```

### Places

```bash
# List all places
curl http://localhost:4100/api/places

# Create new place
curl -X POST http://localhost:4100/api/places \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Town Square",
    "slug": "town-square",
    "description": "Central meeting place",
    "category": "landmark",
    "latitude": 59.9139,
    "longitude": 10.7522
  }'
```

### People

```bash
# List all people
curl http://localhost:4100/api/people

# Create new person
curl -X POST http://localhost:4100/api/people \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "slug": "john-doe",
    "birth_year": 1950,
    "occupation": "Baker",
    "biography": "Local baker since 1975"
  }'
```

### Businesses

```bash
# List all businesses
curl http://localhost:4100/api/businesses

# Create new business
curl -X POST http://localhost:4100/api/businesses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pjuskeby Bakery",
    "slug": "pjuskeby-bakery",
    "category": "food",
    "description": "Traditional Norwegian bakery",
    "opening_hours": {"mon": "08:00-18:00", "tue": "08:00-18:00"}
  }'
```

### Organizations

```bash
# List all organizations
curl http://localhost:4100/api/organizations

# Create new organization
curl -X POST http://localhost:4100/api/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pjuskeby Historical Society",
    "slug": "historical-society",
    "type": "cultural",
    "description": "Preserving local history",
    "founded_year": 1920
  }'
```

### Events

```bash
# List all events
curl http://localhost:4100/api/events

# Create new event
curl -X POST http://localhost:4100/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Festival",
    "slug": "summer-festival-2025",
    "description": "Annual summer celebration",
    "event_date": "2025-06-21T12:00:00Z",
    "category": "festival"
  }'
```

### Lakes

```bash
# List all lakes
curl http://localhost:4100/api/lakes

# Create new lake
curl -X POST http://localhost:4100/api/lakes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pjuskeby Lake",
    "slug": "pjuskeby-lake",
    "description": "Main lake in the area",
    "latitude": 59.9139,
    "longitude": 10.7522,
    "area_km2": 2.5,
    "depth_m": 15
  }'
```

## Stories

```bash
# List all stories (with optional status filter)
curl "http://localhost:4100/api/stories?status=draft"
curl "http://localhost:4100/api/stories?status=pending_review"
curl "http://localhost:4100/api/stories?status=published"

# Create new story (always starts as 'draft')
curl -X POST http://localhost:4100/api/stories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Tale of Old Town",
    "slug": "tale-of-old-town",
    "content": "Once upon a time...",
    "author_id": "user-uuid-here"
  }'

# Get story by slug
curl http://localhost:4100/api/stories/tale-of-old-town

# Update story
curl -X PATCH http://localhost:4100/api/stories/story-id \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated content"}'

# Approve story (changes status to 'published')
curl -X PATCH http://localhost:4100/api/stories/story-id/approve \
  -H "Content-Type: application/json" \
  -d '{"reviewed_by": "admin-id", "review_notes": "Looks good"}'

# Reject story
curl -X PATCH http://localhost:4100/api/stories/story-id/reject \
  -H "Content-Type: application/json" \
  -d '{"reviewed_by": "admin-id", "rejection_reason": "Needs more detail"}'

# Delete story
curl -X DELETE http://localhost:4100/api/stories/story-id
```

## Map Data (GeoJSON)

```bash
# List available layers
curl http://localhost:4100/api/map/layers

# Get places layer (GeoJSON)
curl http://localhost:4100/api/map/layers/places

# Get lakes layer (GeoJSON)
curl http://localhost:4100/api/map/layers/lakes

# Get streets layer (GeoJSON) - no geometry since streets don't have coordinates
curl http://localhost:4100/api/map/layers/streets
```

### Example GeoJSON Response

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "place-uuid",
      "properties": {
        "name": "Town Square",
        "slug": "town-square",
        "description": "Central meeting place",
        "category": "landmark"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [10.7522, 59.9139]
      }
    }
  ]
}
```

## Entity Mentions (Cross-references)

```bash
# Get all mentions of a place in stories
curl http://localhost:4100/api/entity-mentions/place/place-uuid

# Get all mentions of a person in stories
curl http://localhost:4100/api/entity-mentions/person/person-uuid

# Create entity mention (link entity to story)
curl -X POST http://localhost:4100/api/entity-mentions \
  -H "Content-Type: application/json" \
  -d '{
    "story_id": "story-uuid",
    "entity_type": "place",
    "entity_id": "place-uuid"
  }'
```

## AI Decisions

```bash
# List all AI decisions
curl http://localhost:4100/api/ai-decisions

# Log new AI decision
curl -X POST http://localhost:4100/api/ai-decisions \
  -H "Content-Type: application/json" \
  -d '{
    "story_id": "story-uuid",
    "decision_type": "content_generation",
    "action": "generated_description",
    "confidence_score": 0.95,
    "reasoning": "Used GPT-4 to generate place description",
    "model_version": "gpt-4-1106-preview",
    "prompt_tokens": 150,
    "completion_tokens": 200
  }'
```

## Admin

```bash
# Get system statistics
curl http://localhost:4100/api/admin/stats

# Response example:
# {
#   "stats": {
#     "streets": 10,
#     "places": 25,
#     "people": 30,
#     "businesses": 15,
#     "organizations": 8,
#     "events": 12,
#     "lakes": 5,
#     "stories": 50,
#     "users": 5,
#     "ai_decisions": 100,
#     "entity_mentions": 200
#   },
#   "total_entities": 460
# }

# DANGEROUS: Wipe all data (requires double confirmation)
curl -X POST http://localhost:4100/api/admin/wipe-all \
  -H "Content-Type: application/json" \
  -d '{"confirmation": "WIPE_ALL_DATA_PERMANENTLY"}'
```

## Error Responses

### 404 Not Found
```json
{
  "error": "Street not found"
}
```

### 409 Conflict (Duplicate slug)
```json
{
  "error": "Street with this slug already exists"
}
```

### 422 Unprocessable Entity (Missing required field)
```json
{
  "error": "Name and slug are required"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create street"
}
```

## Response Formats

### Success (200 OK)
```json
{
  "id": "uuid-here",
  "name": "Example",
  "slug": "example",
  "created_at": "2025-01-18T09:00:00Z",
  "updated_at": "2025-01-18T09:00:00Z"
}
```

### Created (201 Created)
```json
{
  "id": "new-uuid-here",
  "name": "Example",
  "slug": "example",
  "created_at": "2025-01-18T09:00:00Z",
  "updated_at": "2025-01-18T09:00:00Z"
}
```

### List Response (200 OK)
```json
[
  {
    "id": "uuid-1",
    "name": "Example 1",
    "slug": "example-1"
  },
  {
    "id": "uuid-2",
    "name": "Example 2",
    "slug": "example-2"
  }
]
```

## TypeScript Usage

```typescript
import type { Street, Place, Person, Story } from './server/types';

// Create new street
const newStreet: Partial<Street> = {
  name: 'Hovedgata',
  slug: 'hovedgata',
  description: 'Main street',
  significance: 'historical'
};

// Fetch street
const response = await fetch('http://localhost:4100/api/streets/hovedgata');
const street: Street = await response.json();
```

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All IDs are UUIDs generated server-side
- Slugs must be unique within each entity type
- GeoJSON coordinates are in [longitude, latitude] order
- Stories always start with status='draft' (guardrail enforced)
- Admin endpoints require authentication (TODO: implement)
- All endpoints use JSON for request/response bodies

## Production Deployment

Before deploying to production:

1. ✅ API structure complete
2. ⚠️ Implement JWT authentication (currently basic)
3. ⚠️ Add bcrypt password hashing (currently plaintext - INSECURE)
4. ⚠️ Add input validation with Zod schemas
5. ⚠️ Apply rate limiting to all endpoints
6. ⚠️ Implement proper admin authorization
7. ✅ CORS configured (may need refinement)
8. ✅ Error handling implemented
9. ✅ Logging with Fastify logger

See FASE_4_COMPLETE.md for full production readiness assessment.
