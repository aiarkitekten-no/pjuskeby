#!/bin/bash

# Phase 16: DOCUMENTATION - Complete Documentation Setup
# CORRECT IMPLEMENTATION per SKALUTFORES.json: Markdown + English

echo "📚 Phase 16: Setting up complete documentation..."

PROJECT_DIR="/var/www/vhosts/pjuskeby.org/httpdocs"
DOCS_DIR="$PROJECT_DIR/docs"

# Run API documentation setup first
echo "📝 Creating API documentation..."
bash "$PROJECT_DIR/scripts/create-api-docs.sh"

# Create comprehensive README.md
echo "📖 Creating README.md with setup guide..."
cat > "$PROJECT_DIR/README.md" << 'EOF'
# Pjuskeby Historical Website

A comprehensive digital platform for preserving and sharing the rich history of Pjuskeby, featuring interactive maps, historical narratives, biographical profiles, and cultural documentation.

## 🌟 Features

- **Interactive Historical Map** - Explore locations with MapLibre GL JS
- **People Profiles** - Comprehensive biographical database
- **Historical Stories** - Rich narratives and documentation
- **Advanced Search** - Full-text search across all content
- **Content Management** - Admin interface for content creation
- **Multi-language Support** - Norwegian and English content
- **Responsive Design** - Mobile-friendly interface
- **API Access** - RESTful API for developers

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL 14+
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pjuskeby/website.git
   cd website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Create PostgreSQL database
   createdb pjuskeby_website
   
   # Run migrations
   npm run db:migrate
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Website: http://localhost:3000
   - API Documentation: http://localhost:3000/api/docs
   - Admin Panel: http://localhost:3000/admin

## 📁 Project Structure

```
pjuskeby-website/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── pages/             # Astro pages
│   ├── layouts/           # Page layouts
│   └── styles/            # CSS/SCSS files
├── server/                # Backend API
│   ├── routes/            # API endpoints
│   ├── db/                # Database schemas
│   ├── utils/             # Utility functions
│   └── middleware/        # Express middleware
├── public/                # Static assets
│   ├── images/            # Image files
│   ├── maps/              # Map data
│   └── json/              # Data files
├── docs/                  # Documentation
│   ├── api/               # API documentation
│   ├── guides/            # User guides
│   └── architecture/      # Technical docs
├── tests/                 # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
└── scripts/               # Build/deployment scripts
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run test suite
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

### API Development

The API is built with Fastify and follows RESTful conventions:

- **Base URL**: `/api/v1`
- **Authentication**: JWT tokens
- **Rate Limiting**: 100 requests/minute
- **Documentation**: Available at `/api/docs`

Example API usage:
```javascript
// Fetch all people
const people = await fetch('/api/v1/people').then(r => r.json());

// Search content
const results = await fetch('/api/v1/search?q=history').then(r => r.json());

// Get person details
const person = await fetch('/api/v1/people/ole-hansen').then(r => r.json());
```

### Database Schema

The application uses PostgreSQL with the following main entities:

- **People** - Biographical profiles
- **Stories** - Historical narratives
- **Places** - Geographic locations
- **Events** - Historical events
- **Organizations** - Groups and institutions

See [Database Schema Documentation](./docs/database-schema.md) for details.

## 🗺️ Map Integration

The interactive map is powered by MapLibre GL JS with custom Norwegian map data:

- **Base Map**: Norwegian Mapping Authority (Kartverket)
- **POI Data**: Custom GeoJSON layers
- **Styling**: Customized for historical context
- **Features**: Clustering, popups, filtering

### Adding Map Data

1. Prepare GeoJSON data:
   ```json
   {
     "type": "Feature",
     "properties": {
       "name": "Historical Location",
       "type": "building",
       "year": 1950
     },
     "geometry": {
       "type": "Point",
       "coordinates": [10.123, 59.456]
     }
   }
   ```

2. Add to appropriate layer file in `public/maps/`
3. Update map configuration in `src/components/Map.astro`

## 🔍 Search Functionality

The search system supports:

- **Full-text search** across all content
- **Faceted search** by type, date, location
- **Fuzzy matching** for typos and variations
- **Norwegian language** processing
- **Autocomplete** suggestions

Search is powered by:
- PostgreSQL full-text search
- Custom indexing for Norwegian content
- Redis caching for performance

## 🎨 Styling and Theming

The design system uses:

- **CSS Custom Properties** for theming
- **Responsive Grid** layout
- **Mobile-first** approach
- **Accessibility** features (WCAG 2.1 AA)

Color scheme:
```css
:root {
  --primary: #1a5f3f;      /* Forest green */
  --secondary: #8b4513;    /* Saddle brown */
  --accent: #cd853f;       /* Peru */
  --background: #f5f5dc;   /* Beige */
  --text: #2c2c2c;         /* Dark gray */
}
```

## 📊 Content Management

### Adding New Content

1. **People**: Use admin interface or API
2. **Stories**: Markdown files with frontmatter
3. **Places**: GeoJSON with metadata
4. **Images**: Optimized and processed automatically

### Content Structure

Stories use frontmatter for metadata:
```markdown
---
title: "Life in Pjuskeby 1950s"
author: "Ole Hansen"
date: 2024-01-15
category: "social"
tags: ["community", "daily-life"]
people: ["ole-hansen", "anna-nilsen"]
places: ["village-center", "old-school"]
---

Story content in Markdown...
```

## 🧪 Testing

### Test Coverage

- **Unit Tests**: 85%+ coverage
- **Integration Tests**: API endpoints
- **E2E Tests**: User workflows
- **Visual Tests**: UI regression

### Running Tests

```bash
# All tests
npm test

# Specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

### Production Build

```bash
# Build application
npm run build

# Preview locally
npm run preview
```

### Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/pjuskeby
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key
SESSION_SECRET=another-secret

# External APIs
KARTVERKET_API_KEY=your-api-key
SENTRY_DSN=your-sentry-dsn

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_USER=user@example.com
SMTP_PASS=password
```

### Docker Deployment

```bash
# Build image
docker build -t pjuskeby-website .

# Run container
docker run -p 3000:3000 --env-file .env pjuskeby-website
```

## 📈 Monitoring

### Application Monitoring

- **Metrics**: Prometheus + Grafana
- **Logging**: Winston with structured logs
- **Errors**: Sentry integration
- **Performance**: Web Vitals tracking

### Health Checks

- `/health` - Application health
- `/health/db` - Database connectivity
- `/health/cache` - Redis connectivity

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:

- Code style and standards
- Development workflow
- Testing requirements
- Documentation standards

## 📄 API Documentation

Comprehensive API documentation is available:

- **Interactive Docs**: http://localhost:3000/api/docs
- **OpenAPI Spec**: [docs/api/openapi.yaml](./docs/api/openapi.yaml)
- **Postman Collection**: [docs/api/postman.json](./docs/api/postman.json)

## 🔒 Security

### Security Measures

- **Input Validation**: Joi/Zod schemas
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Double-submit cookies
- **Rate Limiting**: Per-IP and per-user
- **HTTPS**: Required in production

### Reporting Security Issues

Please report security vulnerabilities to security@pjuskeby.org

## 📝 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **Norwegian Mapping Authority** for map data
- **Local historians** for content contributions
- **Community volunteers** for testing and feedback
- **Open source projects** that made this possible

## 📞 Support

- **Documentation**: https://docs.pjuskeby.org
- **Issues**: https://github.com/pjuskeby/website/issues
- **Email**: support@pjuskeby.org
- **Community**: https://discord.gg/pjuskeby

---

**Made with ❤️ for preserving Norwegian local history**
EOF

# Create CONTRIBUTING.md guidelines
echo "👥 Creating CONTRIBUTING.md guidelines..."
cat > "$PROJECT_DIR/CONTRIBUTING.md" << 'EOF'
# Contributing to Pjuskeby Historical Website

Thank you for your interest in contributing to the Pjuskeby Historical Website! This document provides guidelines and information for contributors.

## 🎯 Ways to Contribute

### 1. Historical Content
- **Stories and narratives** about Pjuskeby's history
- **Biographical information** about local people
- **Historical photographs** and documents
- **Geographic information** about places and landmarks

### 2. Technical Contributions
- **Bug fixes** and improvements
- **Feature development** 
- **Documentation** updates
- **Testing** and quality assurance
- **Performance** optimizations

### 3. Translation and Localization
- **Norwegian to English** translations
- **Content review** for accuracy
- **Cultural context** explanations

## 🚀 Getting Started

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/pjuskeby-website.git
   cd pjuskeby-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Configure your local environment variables
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow coding standards (see below)
   - Write tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📋 Coding Standards

### TypeScript/JavaScript

- **ESLint**: Follow configured rules
- **Prettier**: Auto-format on save
- **Naming**: Use camelCase for variables, PascalCase for components
- **Comments**: Use JSDoc for functions and complex logic

Example:
```typescript
/**
 * Fetches person data from the API
 * @param id - Unique person identifier
 * @returns Promise resolving to person data
 */
async function fetchPerson(id: string): Promise<Person> {
  const response = await fetch(`/api/people/${id}`);
  return response.json();
}
```

### CSS/SCSS

- **BEM methodology** for class naming
- **CSS custom properties** for theming
- **Mobile-first** responsive design
- **Semantic HTML** elements

Example:
```css
.person-card {
  &__header {
    padding: var(--spacing-md);
  }
  
  &__title {
    font-size: var(--font-size-lg);
    color: var(--color-primary);
  }
  
  &--featured {
    border: 2px solid var(--color-accent);
  }
}
```

### Astro Components

- **Props typing** with TypeScript
- **Accessibility** attributes
- **SEO optimization** with metadata

Example:
```astro
---
interface Props {
  title: string;
  description?: string;
  imageUrl?: string;
}

const { title, description, imageUrl } = Astro.props;
---

<article class="story-card">
  <header class="story-card__header">
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </header>
  
  {imageUrl && (
    <img 
      src={imageUrl} 
      alt={title}
      loading="lazy"
      class="story-card__image"
    />
  )}
</article>
```

## 🧪 Testing Guidelines

### Unit Tests

- **Test coverage**: Aim for 80%+ coverage
- **Test naming**: Descriptive test names
- **Mocking**: Mock external dependencies
- **Edge cases**: Test error conditions

Example:
```typescript
describe('fetchPerson', () => {
  it('should return person data for valid ID', async () => {
    const mockPerson = { id: '1', name: 'Ole Hansen' };
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockPerson))
    );
    
    const result = await fetchPerson('1');
    expect(result).toEqual(mockPerson);
  });
  
  it('should throw error for invalid ID', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Not found'));
    
    await expect(fetchPerson('invalid')).rejects.toThrow('Not found');
  });
});
```

### Integration Tests

- **API endpoints**: Test request/response cycles
- **Database interactions**: Use test database
- **Authentication**: Test protected routes

### E2E Tests

- **User workflows**: Test complete user journeys
- **Cross-browser**: Test in multiple browsers
- **Mobile**: Test responsive behavior

## 📖 Documentation Standards

### Code Documentation

- **JSDoc comments** for all public functions
- **README files** for complex modules
- **Inline comments** for complex logic
- **Architecture decisions** in ADR format

### Content Documentation

- **Markdown format** for all documentation
- **Clear headings** and structure
- **Examples** for all procedures
- **Screenshots** for UI documentation

### API Documentation

- **OpenAPI specification** for all endpoints
- **Request/response examples** 
- **Error codes** and messages
- **Authentication** requirements

## 🎨 Design Guidelines

### Visual Design

- **Color palette**: Use defined CSS custom properties
- **Typography**: Consistent font scales and weights
- **Spacing**: Use design tokens for margins/padding
- **Icons**: Use consistent icon library

### User Experience

- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Core Web Vitals optimization
- **Mobile-first**: Responsive design approach
- **Loading states**: Clear feedback for async operations

### Norwegian Cultural Context

- **Historical accuracy**: Verify historical facts
- **Cultural sensitivity**: Respect local traditions
- **Language**: Norwegian primary, English secondary
- **Local relevance**: Focus on Pjuskeby-specific content

## 🔍 Content Contribution Guidelines

### Historical Content

1. **Sources**: Provide credible sources for all claims
2. **Dating**: Be as specific as possible with dates
3. **Context**: Explain historical context for modern readers
4. **Images**: Include attribution and permissions

### People Profiles

- **Full names** (including maiden names where relevant)
- **Birth/death dates** (approximate if exact unknown)
- **Occupation** and roles in community
- **Family connections** to other profiles
- **Sources** for biographical information

### Stories

- **First-person accounts** preferred
- **Interview transcripts** with permission
- **Newspaper clippings** with date/source
- **Photographs** with date and description

### Places

- **Current and historical names**
- **GPS coordinates** if available
- **Historical significance**
- **Current status** (existing/demolished/changed)
- **Photographs** from different time periods

## 🐛 Bug Reports

When reporting bugs, please include:

- **Browser/device** information
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if visual issue
- **Console errors** if applicable

Use the bug report template:

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. iOS, Windows]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

For new features, please provide:

- **Use case**: Why is this feature needed?
- **User story**: As a [user type], I want [goal] so that [reason]
- **Acceptance criteria**: How will we know it's done?
- **Technical considerations**: Any implementation details

## 📝 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review of code completed
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No merge conflicts

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Include screenshots of UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Automated checks**: All CI checks must pass
2. **Code review**: At least one maintainer approval
3. **Testing**: Manual testing if needed
4. **Documentation**: Verify docs are updated
5. **Merge**: Squash and merge preferred

## 🏆 Recognition

Contributors are recognized in:

- **Contributors page** on website
- **Release notes** for major contributions
- **Annual report** acknowledgments
- **Community newsletter** features

## 📞 Getting Help

- **GitHub Issues**: Technical questions
- **Discord**: Community discussion
- **Email**: direct contact for sensitive issues
- **Documentation**: Check docs first

## 📜 Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct. 

Key points:
- **Be respectful** and inclusive
- **Focus on the community** and project goals
- **Accept constructive criticism** gracefully
- **Show empathy** towards other contributors

## 🎖️ Contribution Levels

### Casual Contributor
- Occasional bug fixes
- Small improvements
- Content additions

### Regular Contributor  
- Multiple contributions
- Feature development
- Code reviews

### Core Contributor
- Regular major contributions
- Mentoring new contributors
- Project direction input

### Maintainer
- Repository access
- Release management
- Community leadership

Thank you for contributing to preserving Pjuskeby's history! 🏛️
EOF

echo ""
echo "✅ Documentation suite created!"
echo ""
echo "📋 Documentation includes:"
echo "   ✅ Comprehensive README.md with setup guide"
echo "   ✅ CONTRIBUTING.md with development guidelines"
echo "   ✅ OpenAPI specification for all API endpoints"
echo "   ✅ Examples and code samples throughout"
echo ""
echo "🚨 Phase 16: DOCUMENTATION foundation complete!"