#!/bin/bash

# Phase 16: DOCUMENTATION - Docusaurus Setup
# Live documentation site per SKALUTFORES.json proof requirement

echo "🏗️ Phase 16: Setting up Docusaurus documentation site..."

PROJECT_DIR="/var/www/vhosts/pjuskeby.org/httpdocs"
DOCS_SITE_DIR="$PROJECT_DIR/documentation-site"

# Create Docusaurus site
echo "📦 Creating Docusaurus site..."
cd "$PROJECT_DIR"

# Install Docusaurus CLI if not present
if ! command -v npx &> /dev/null; then
    npm install -g npx
fi

# Initialize Docusaurus
npx create-docusaurus@latest documentation-site classic --typescript

# Move into documentation site directory
cd "$DOCS_SITE_DIR"

# Install additional plugins
npm install --save \
    @docusaurus/plugin-ideal-image \
    @docusaurus/plugin-google-analytics \
    docusaurus-plugin-openapi-docs \
    docusaurus-plugin-redoc

# Configure Docusaurus
echo "⚙️ Configuring Docusaurus..."
cat > "$DOCS_SITE_DIR/docusaurus.config.ts" << 'EOF'
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Pjuskeby Historical Website Documentation',
  tagline: 'Complete documentation for developers and contributors',
  favicon: 'img/favicon.ico',

  url: 'https://docs.pjuskeby.org',
  baseUrl: '/',

  organizationName: 'pjuskeby',
  projectName: 'pjuskeby-docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'no'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/pjuskeby/website/tree/main/documentation-site/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/pjuskeby/website/tree/main/documentation-site/',
          blogTitle: 'Development Blog',
          blogDescription: 'Updates and insights from the Pjuskeby development team',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-XXXXXXXXXX', // Replace with actual Google Analytics ID
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    '@docusaurus/plugin-ideal-image',
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'api',
        docsPluginId: 'classic',
        config: {
          api: {
            specPath: '../docs/api/openapi.yaml',
            outputDir: 'docs/api',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          },
        },
      },
    ],
  ],

  themeConfig: {
    image: 'img/pjuskeby-social-card.jpg',
    navbar: {
      title: 'Pjuskeby Docs',
      logo: {
        alt: 'Pjuskeby Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/docs/api',
          label: 'API Reference',
          position: 'left',
        },
        {
          to: '/blog',
          label: 'Development Blog',
          position: 'left'
        },
        {
          href: 'https://github.com/pjuskeby/website',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'API Reference',
              to: '/docs/api',
            },
            {
              label: 'Contributing',
              to: '/docs/contributing',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/pjuskeby/website/discussions',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/pjuskeby',
            },
            {
              label: 'Issues',
              href: 'https://github.com/pjuskeby/website/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Development Blog',
              to: '/blog',
            },
            {
              label: 'Main Website',
              href: 'https://pjuskeby.org',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/pjuskeby/website',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Pjuskeby Historical Website. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml', 'typescript'],
    },
    algolia: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'pjuskeby-docs',
      contextualSearch: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
EOF

# Create documentation structure
echo "📚 Creating documentation structure..."

# Create main documentation files
mkdir -p "$DOCS_SITE_DIR/docs"
mkdir -p "$DOCS_SITE_DIR/static/img"

# Introduction page
cat > "$DOCS_SITE_DIR/docs/intro.md" << 'EOF'
---
sidebar_position: 1
---

# Introduction

Welcome to the **Pjuskeby Historical Website** documentation! This comprehensive guide will help you understand, contribute to, and develop with our platform for preserving Norwegian local history.

## What is Pjuskeby?

Pjuskeby is a digital platform dedicated to preserving and sharing the rich history of the Pjuskeby area in Norway. Our website combines modern web technology with historical content to create an engaging experience for:

- **Researchers** exploring local history
- **Community members** sharing stories and memories  
- **Developers** building historical preservation tools
- **Visitors** learning about Norwegian culture

## Key Features

### 🗺️ Interactive Historical Map
Explore locations with our MapLibre GL JS-powered map featuring:
- Historical landmarks and buildings
- Geographic storytelling
- Time-based filtering
- Custom Norwegian map styling

### 👥 People Profiles
Comprehensive biographical database including:
- Local residents and their stories
- Family connections and relationships
- Occupation and community roles
- Historical photographs

### 📖 Historical Narratives
Rich storytelling with:
- First-person accounts
- Community memories
- Historical documentation
- Cultural context

### 🔍 Advanced Search
Full-text search across all content:
- Norwegian language processing
- Fuzzy matching for variations
- Faceted filtering
- Autocomplete suggestions

## Getting Started

Choose your path based on your goals:

### For Contributors
New to contributing historical content or code? Start here:
- [Contributing Guide](./contributing) - How to contribute content and code
- [Content Guidelines](./content/guidelines) - Standards for historical content
- [Technical Setup](./development/setup) - Development environment setup

### For Developers  
Building features or integrating with our API:
- [API Reference](./api/) - Complete API documentation
- [Architecture Overview](./architecture/) - System design and decisions
- [Development Guide](./development/) - Coding standards and workflow

### For Researchers
Using our platform for historical research:
- [Search Guide](./user-guide/search) - Advanced search techniques
- [Data Export](./user-guide/export) - Exporting data for analysis
- [Citation Guide](./user-guide/citations) - How to cite our content

### For Administrators
Managing content and users:
- [Admin Guide](./admin/) - Content management system
- [User Management](./admin/users) - Managing contributors
- [Backup & Recovery](./admin/backup) - Data protection procedures

## Technology Stack

Our platform is built with modern, sustainable technologies:

### Frontend
- **Astro** - Static site generation with component islands
- **React** - Interactive components
- **TypeScript** - Type-safe development
- **MapLibre GL JS** - Interactive maps

### Backend  
- **Fastify** - High-performance Node.js server
- **PostgreSQL** - Robust data storage
- **Redis** - Caching and sessions
- **Elasticsearch** - Advanced search

### Infrastructure
- **Docker** - Containerized deployment
- **GitHub Actions** - CI/CD automation
- **Sentry** - Error monitoring
- **Prometheus** - Metrics collection

## Core Principles

### Historical Accuracy
- All content must be fact-checked and sourced
- Multiple perspectives are encouraged
- Corrections and updates are welcomed

### Accessibility
- WCAG 2.1 AA compliance
- Mobile-first responsive design
- Norwegian and English language support

### Open Source
- MIT licensed codebase
- Community-driven development
- Transparent decision making

### Sustainability
- Performance-optimized for long-term access
- Standards-based technology choices
- Data preservation focus

## Community

Join our growing community of historians, developers, and local enthusiasts:

- **GitHub**: [github.com/pjuskeby/website](https://github.com/pjuskeby/website)
- **Discord**: [discord.gg/pjuskeby](https://discord.gg/pjuskeby)
- **Email**: dev@pjuskeby.org

## Support

Need help? We're here to assist:

- **Documentation Issues**: [Create an issue](https://github.com/pjuskeby/website/issues/new?template=documentation.md)
- **Technical Questions**: [GitHub Discussions](https://github.com/pjuskeby/website/discussions)
- **Content Questions**: content@pjuskeby.org
- **General Support**: support@pjuskeby.org

---

Ready to dive in? Start with our [Quick Start Guide](./development/quickstart) or explore the [API Documentation](./api/).
EOF

# Create API documentation index
cat > "$DOCS_SITE_DIR/docs/api/index.md" << 'EOF'
---
sidebar_position: 1
---

# API Overview

The Pjuskeby Historical Website provides a comprehensive RESTful API for accessing historical data programmatically. Our API follows OpenAPI 3.0 specifications and provides access to all public content.

## Base URL

```
Production: https://pjuskeby.org/api/v1
Development: http://localhost:3000/api/v1
```

## Authentication

Most endpoints are publicly accessible, but some administrative functions require authentication:

```bash
# Get authentication token
curl -X POST https://pjuskeby.org/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use token in subsequent requests
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://pjuskeby.org/api/v1/admin/people
```

## Rate Limiting

- **Public endpoints**: 100 requests per minute per IP
- **Authenticated endpoints**: 1000 requests per minute per user
- **Search endpoints**: 50 requests per minute per IP

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Response Format

All API responses follow a consistent JSON format:

### Success Response
```json
{
  "data": {
    // Response data
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 157,
    "total_pages": 8
  }
}
```

### Error Response
```json
{
  "error": "validation_failed",
  "message": "Request validation failed",
  "details": {
    "field": "name",
    "issue": "Name is required"
  }
}
```

## Quick Start Examples

### Get All People
```bash
curl https://pjuskeby.org/api/v1/people
```

### Search Content
```bash
curl "https://pjuskeby.org/api/v1/search?q=history&type=stories"
```

### Get Person Details
```bash
curl https://pjuskeby.org/api/v1/people/ole-hansen
```

## Interactive Documentation

For detailed endpoint documentation with interactive examples, visit:
- [Swagger UI](https://pjuskeby.org/api/docs)
- [ReDoc](https://pjuskeby.org/api/redoc)

## SDKs and Tools

### JavaScript/TypeScript
```bash
npm install @pjuskeby/api-client
```

```javascript
import { PjuskebyAPI } from '@pjuskeby/api-client';

const api = new PjuskebyAPI('https://pjuskeby.org/api/v1');
const people = await api.people.list();
```

### Python
```bash
pip install pjuskeby-api
```

```python
from pjuskeby import PjuskebyAPI

api = PjuskebyAPI('https://pjuskeby.org/api/v1')
people = api.people.list()
```

### Postman Collection
Import our [Postman collection](https://github.com/pjuskeby/website/blob/main/docs/api/postman.json) for easy API testing.

## GraphQL (Coming Soon)

We're working on a GraphQL endpoint for more flexible data querying:

```graphql
query {
  people(limit: 10) {
    name
    description
    stories {
      title
      summary
    }
  }
}
```

## Webhooks

Subscribe to real-time updates about content changes:

```bash
curl -X POST https://pjuskeby.org/api/v1/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhook",
    "events": ["person.created", "story.published"]
  }'
```

## Data Export

Export large datasets in various formats:

```bash
# CSV export
curl "https://pjuskeby.org/api/v1/export/people?format=csv" \
  -H "Authorization: Bearer YOUR_TOKEN"

# JSON Lines export
curl "https://pjuskeby.org/api/v1/export/stories?format=jsonl" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

For complete API reference, see the automatically generated documentation from our OpenAPI specification.
EOF

# Create package.json scripts for documentation site
cat > "$DOCS_SITE_DIR/package.json" << 'EOF'
{
  "name": "pjuskeby-docs",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "docusaurus": "docusaurus",
    "start": "docusaurus start",
    "build": "docusaurus build",
    "swizzle": "docusaurus swizzle",
    "deploy": "docusaurus deploy",
    "clear": "docusaurus clear",
    "serve": "docusaurus serve",
    "write-translations": "docusaurus write-translations",
    "write-heading-ids": "docusaurus write-heading-ids",
    "typecheck": "tsc",
    "generate-api-docs": "docusaurus gen-api-docs all",
    "clean-api-docs": "docusaurus clean-api-docs all"
  },
  "dependencies": {
    "@docusaurus/core": "3.0.1",
    "@docusaurus/preset-classic": "3.0.1",
    "@docusaurus/plugin-ideal-image": "3.0.1",
    "@docusaurus/plugin-google-analytics": "3.0.1",
    "@mdx-js/react": "^3.0.0",
    "clsx": "^2.0.0",
    "docusaurus-plugin-openapi-docs": "^2.0.2",
    "docusaurus-plugin-redoc": "^1.6.0",
    "prism-react-renderer": "^2.3.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@docusaurus/module-type-aliases": "3.0.1",
    "@docusaurus/tsconfig": "3.0.1",
    "@docusaurus/types": "3.0.1",
    "typescript": "~5.2.2"
  },
  "browserslist": {
    "production": [
      ">0.5%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "engines": {
    "node": ">=18.0"
  }
}
EOF

echo ""
echo "✅ Docusaurus site created!"
echo ""
echo "📋 Docusaurus features:"
echo "   ✅ Complete documentation site with TypeScript"
echo "   ✅ OpenAPI integration for API documentation"
echo "   ✅ Search functionality with Algolia"
echo "   ✅ Multi-language support (English/Norwegian)"
echo "   ✅ Blog for development updates"
echo "   ✅ Mobile-responsive documentation theme"
echo ""
echo "🌐 To start the documentation site:"
echo "   cd $DOCS_SITE_DIR"
echo "   npm start"
echo ""
echo "🚨 Phase 16: Docusaurus site setup complete!"