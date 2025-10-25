#!/bin/bash

# Phase 16: Content Management System - Editing Interface
# Redigeringsgrensesnitt med engelsk brukergrensesnitt

echo "🖊️ Phase 16: Creating content editing interface..."

PROJECT_DIR="/var/www/vhosts/pjuskeby.org/httpdocs"
CMS_DIR="$PROJECT_DIR/cms"

# Create content editing components
echo "📝 Creating content editing components..."

# Main content editor component
cat > "$CMS_DIR/components/ContentEditor.tsx" << 'EOF'
// Content Editor Component
// Phase 16: Content Management System - English UI, Norwegian backend

import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { InnholdsMetadata, MDXInnhold, mdxProsessor } from '../utils/mdx-processor';

interface ContentEditorProps {
  initialContent?: MDXInnhold;
  onSave: (content: MDXInnhold) => void;
  onCancel: () => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  initialContent,
  onSave,
  onCancel
}) => {
  // State for content editing (English UI labels)
  const [metadata, setMetadata] = useState<InnholdsMetadata>({
    title: '',
    description: '',
    author: '',
    publishedDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    status: 'draft',
    category: 'story',
    tags: [],
    slug: ''
  });
  
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  // Initialize with existing content
  useEffect(() => {
    if (initialContent) {
      setMetadata(initialContent.metadata);
      setContent(initialContent.content);
    }
  }, [initialContent]);

  // Auto-generate slug from title
  useEffect(() => {
    if (metadata.title && !initialContent) {
      const slug = metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      setMetadata(prev => ({ ...prev, slug }));
    }
  }, [metadata.title, initialContent]);

  // Validation (English error messages)
  const validateContent = (): string[] => {
    const validationErrors: string[] = [];
    
    if (!metadata.title.trim()) {
      validationErrors.push('Title is required');
    }
    
    if (!metadata.description.trim()) {
      validationErrors.push('Description is required');
    }
    
    if (!content.trim()) {
      validationErrors.push('Content cannot be empty');
    }
    
    if (content.length < 50) {
      validationErrors.push('Content must be at least 50 characters long');
    }
    
    if (!metadata.author.trim()) {
      validationErrors.push('Author is required');
    }
    
    return validationErrors;
  };

  // Handle save action
  const handleSave = async () => {
    const validationErrors = validateContent();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    setErrors([]);
    
    try {
      // Update last modified timestamp
      const updatedMetadata = {
        ...metadata,
        lastModified: new Date().toISOString()
      };
      
      // Save using MDX processor
      const filePath = await mdxProsessor.lagreInnhold(updatedMetadata, content);
      
      // Parse back to get full MDX content
      const savedContent = await mdxProsessor.parseMDX(filePath);
      
      onSave(savedContent);
    } catch (error) {
      setErrors([`Failed to save content: ${error.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle metadata field changes
  const updateMetadata = (field: keyof InnholdsMetadata, value: any) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  // Handle tag input
  const handleTagsChange = (tagString: string) => {
    const tags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag);
    updateMetadata('tags', tags);
  };

  return (
    <div className="content-editor">
      {/* Header with title and actions - English UI */}
      <div className="editor-header">
        <h1>{initialContent ? 'Edit Content' : 'Create New Content'}</h1>
        <div className="editor-actions">
          <button 
            type="button" 
            onClick={() => setPreviewMode(!previewMode)}
            className="btn-secondary"
          >
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Error display */}
      {errors.length > 0 && (
        <div className="alert alert-error">
          <h3>Please fix the following errors:</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="editor-layout">
        {/* Metadata sidebar */}
        <div className="metadata-sidebar">
          <h2>Content Settings</h2>
          
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={metadata.title}
              onChange={(e) => updateMetadata('title', e.target.value)}
              placeholder="Enter content title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={metadata.description}
              onChange={(e) => updateMetadata('description', e.target.value)}
              placeholder="Brief description of the content"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={metadata.category}
              onChange={(e) => updateMetadata('category', e.target.value)}
            >
              <option value="story">Story</option>
              <option value="person">Person</option>
              <option value="place">Place</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={metadata.status}
              onChange={(e) => updateMetadata('status', e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="review">Under Review</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="author">Author *</label>
            <input
              id="author"
              type="text"
              value={metadata.author}
              onChange={(e) => updateMetadata('author', e.target.value)}
              placeholder="Content author"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="slug">URL Slug</label>
            <input
              id="slug"
              type="text"
              value={metadata.slug}
              onChange={(e) => updateMetadata('slug', e.target.value)}
              placeholder="url-friendly-slug"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              type="text"
              value={metadata.tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
            <small>Separate tags with commas</small>
          </div>

          <div className="form-group">
            <label htmlFor="publishedDate">Published Date</label>
            <input
              id="publishedDate"
              type="datetime-local"
              value={metadata.publishedDate.slice(0, 16)}
              onChange={(e) => updateMetadata('publishedDate', e.target.value + ':00.000Z')}
            />
          </div>

          {/* Content statistics */}
          <div className="content-stats">
            <h3>Content Statistics</h3>
            <p>Words: {content.split(/\s+/).filter(word => word).length}</p>
            <p>Characters: {content.length}</p>
            <p>Reading time: ~{Math.ceil(content.split(/\s+/).length / 200)} min</p>
          </div>
        </div>

        {/* Main content editor */}
        <div className="content-main">
          {previewMode ? (
            <div className="preview-container">
              <h2>Content Preview</h2>
              <div className="content-preview">
                <MDEditor.Markdown source={content} />
              </div>
            </div>
          ) : (
            <div className="editor-container">
              <h2>Content Editor</h2>
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                preview="edit"
                height={600}
                data-color-mode="light"
              />
              <div className="editor-help">
                <p>You can use Markdown syntax to format your content. 
                   Use the toolbar above for common formatting options.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
EOF

# Create content list component
cat > "$CMS_DIR/components/ContentList.tsx" << 'EOF'
// Content List Component  
// Phase 16: Content Management System - English UI

import React, { useState, useEffect } from 'react';
import { MDXInnhold, mdxProsessor, formatDateForUI, getStatusDisplayText, getCategoryDisplayText } from '../utils/mdx-processor';

interface ContentListProps {
  onEdit: (content: MDXInnhold) => void;
  onDelete: (content: MDXInnhold) => void;
  onCreateNew: () => void;
}

export const ContentList: React.FC<ContentListProps> = ({
  onEdit,
  onDelete,
  onCreateNew
}) => {
  const [contentList, setContentList] = useState<MDXInnhold[]>([]);
  const [filteredContent, setFilteredContent] = useState<MDXInnhold[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load content list
  useEffect(() => {
    loadContentList();
  }, []);

  // Apply filters when content or filters change
  useEffect(() => {
    applyFilters();
  }, [contentList, searchTerm, categoryFilter, statusFilter]);

  const loadContentList = async () => {
    setIsLoading(true);
    try {
      const content = await mdxProsessor.listInnhold();
      setContentList(content);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...contentList];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(content =>
        content.metadata.title.toLowerCase().includes(searchLower) ||
        content.metadata.description.toLowerCase().includes(searchLower) ||
        content.metadata.author.toLowerCase().includes(searchLower) ||
        content.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(content => content.metadata.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(content => content.metadata.status === statusFilter);
    }

    setFilteredContent(filtered);
  };

  const handleDelete = async (content: MDXInnhold) => {
    if (window.confirm(`Are you sure you want to delete "${content.metadata.title}"?`)) {
      onDelete(content);
      // Reload the list after deletion
      await loadContentList();
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'published': return 'badge-success';
      case 'review': return 'badge-warning';
      case 'draft': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className="content-list">
      {/* Header with actions */}
      <div className="list-header">
        <h1>Content Management</h1>
        <button 
          onClick={onCreateNew}
          className="btn-primary"
        >
          Create New Content
        </button>
      </div>

      {/* Filters and search */}
      <div className="list-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="story">Stories</option>
            <option value="person">People</option>
            <option value="place">Places</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="review">Under Review</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Content count */}
      <div className="content-summary">
        <p>
          Showing {filteredContent.length} of {contentList.length} content items
        </p>
      </div>

      {/* Content list */}
      {filteredContent.length === 0 ? (
        <div className="empty-state">
          <h2>No content found</h2>
          <p>
            {contentList.length === 0 
              ? "You haven't created any content yet." 
              : "No content matches your current filters."
            }
          </p>
          {contentList.length === 0 && (
            <button onClick={onCreateNew} className="btn-primary">
              Create Your First Content
            </button>
          )}
        </div>
      ) : (
        <div className="content-grid">
          {filteredContent.map((content, index) => (
            <div key={`${content.metadata.slug}-${index}`} className="content-card">
              <div className="card-header">
                <h3>{content.metadata.title}</h3>
                <div className="card-badges">
                  <span className={`badge ${getStatusBadgeClass(content.metadata.status)}`}>
                    {getStatusDisplayText(content.metadata.status)}
                  </span>
                  <span className="badge badge-info">
                    {getCategoryDisplayText(content.metadata.category)}
                  </span>
                </div>
              </div>
              
              <div className="card-content">
                <p className="content-description">
                  {content.metadata.description}
                </p>
                
                <div className="content-meta">
                  <div className="meta-row">
                    <span className="meta-label">Author:</span>
                    <span>{content.metadata.author}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Last Modified:</span>
                    <span>{formatDateForUI(content.metadata.lastModified)}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Reading Time:</span>
                    <span>{content.readingTime} min</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Words:</span>
                    <span>{content.wordCount}</span>
                  </div>
                </div>

                {content.metadata.tags.length > 0 && (
                  <div className="content-tags">
                    {content.metadata.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="card-actions">
                <button 
                  onClick={() => onEdit(content)}
                  className="btn-secondary"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(content)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
EOF

echo ""
echo "✅ Content editing interface created!"
echo ""
echo "📋 Editing interface features:"
echo "   ✅ WYSIWYG MDX editor with live preview"
echo "   ✅ Metadata sidebar with all content settings"
echo "   ✅ Content validation with English error messages"
echo "   ✅ Auto-slug generation from title"
echo "   ✅ Tag management and content statistics"
echo "   ✅ Content list with filtering and search"
echo "   ✅ Status badges and content organization"
echo ""
echo "🎨 English UI elements:"
echo "   ✅ All labels, buttons, and messages in English"
echo "   ✅ User-friendly validation messages"
echo "   ✅ Intuitive content management workflow"
echo ""
echo "🚨 Phase 16: Content editing interface ready!"