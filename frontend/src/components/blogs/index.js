import React, { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, User, Clock, Heart, MessageCircle, Share2, BookOpen, Filter, Grid, List, ChevronLeft, ChevronRight, Eye, Bookmark } from 'lucide-react';
import './blogs.scss';

// RapidAPI configuration for Blogs API
const RAPIDAPI_CONFIG = {
  baseURL: 'https://blogs-api1.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY || 'c84d48bab2msh9d76608950dededp140d08jsnfc902094080c',
    'x-rapidapi-host': 'blogs-api1.p.rapidapi.com'
  }
};

// API service functions
const blogApiService = {
  // Fetch blog posts with filtering and pagination
  async fetchBlogPosts(params = {}) {
    try {
      // Prepare query parameters for the Blogs API
      const queryParams = new URLSearchParams({
        q: params.search || 'events planning technology',
        sortBy: params.sortBy === 'newest' ? 'latest' : 'popularity',
        // Add date range if needed (format: YYYY-MM-DD)
        from: params.fromDate || this.getDateDaysAgo(30), // Last 30 days
        to: params.toDate || this.getTodayDate()
      });

      console.log('API Request URL:', `${RAPIDAPI_CONFIG.baseURL}/get-blogs?${queryParams}`);
      console.log('Search params:', params);

      const response = await fetch(`${RAPIDAPI_CONFIG.baseURL}/get-blogs?${queryParams}`, {
        method: 'GET',
        headers: RAPIDAPI_CONFIG.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // FIXED: The API returns 'articles' not 'blogs'
      const articles = data.articles || data.blogs || [];
      
      // Transform API response to match your component structure
      const transformedBlogs = articles.map((article, index) => ({
        id: article.source?.id || `article-${index}`,
        title: article.title || 'Untitled Article',
        excerpt: article.description || article.content?.substring(0, 200) + '...' || 'No description available',
        content: article.content || article.description,
        category: this.extractCategory(article),
        author: {
          name: article.author || article.source?.name || 'Anonymous',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author || article.source?.name || 'Anonymous')}&background=random`
        },
        date: article.publishedAt || new Date().toISOString(),
        readTime: this.calculateReadTime(article.content || article.description),
        image: article.urlToImage || this.getPlaceholderImage(this.extractCategory(article)),
        likes: Math.floor(Math.random() * 500) + 50,
        comments: Math.floor(Math.random() * 50) + 5,
        views: Math.floor(Math.random() * 2000) + 100,
        featured: index === 0,
        tags: this.extractTags(article),
        url: article.url || '#'
      }));

      // Implement client-side pagination since API might not support it
      const startIndex = ((params.page || 1) - 1) * (params.limit || 6);
      const endIndex = startIndex + (params.limit || 6);
      const paginatedBlogs = transformedBlogs.slice(startIndex, endIndex);

      return {
        blogs: paginatedBlogs,
        totalPages: Math.ceil(transformedBlogs.length / (params.limit || 6)),
        totalResults: transformedBlogs.length,
        categories: ['All', 'Technology', 'Business', 'Health', 'Entertainment', 'Sports', 'Science']
      };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw new Error('Failed to fetch blog posts. Please check your API configuration and internet connection.');
    }
  },

  // Get today's date in YYYY-MM-DD format
  getTodayDate() {
    return new Date().toISOString().split('T')[0];
  },

  // Get date N days ago in YYYY-MM-DD format
  getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  },

  // Get placeholder image based on category
  getPlaceholderImage(category) {
    const placeholders = {
      'Technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=400&fit=crop',
      'Business': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
      'Health': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
      'Entertainment': 'https://images.unsplash.com/photo-1489599904472-84794ef4164c?w=800&h=400&fit=crop',
      'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop',
      'Science': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&h=400&fit=crop'
    };
    return placeholders[category] || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop';
  },

  // Extract category from blog (customize based on your API response)
  extractCategory(article) {
    const categories = ['Technology', 'Business', 'Health', 'Entertainment', 'Sports', 'Science'];
    const content = ((article.title || '') + ' ' + (article.description || '') + ' ' + (article.source?.name || '')).toLowerCase();
    
    for (const category of categories) {
      if (content.includes(category.toLowerCase())) {
        return category;
      }
    }
    
    // Try to guess category from source name
    const sourceName = (article.source?.name || '').toLowerCase();
    if (sourceName.includes('tech') || sourceName.includes('verge')) return 'Technology';
    if (sourceName.includes('business') || sourceName.includes('insider')) return 'Business';
    if (sourceName.includes('health') || sourceName.includes('medical')) return 'Health';
    if (sourceName.includes('entertainment') || sourceName.includes('yahoo')) return 'Entertainment';
    if (sourceName.includes('sport') || sourceName.includes('espn')) return 'Sports';
    if (sourceName.includes('science') || sourceName.includes('gizmodo')) return 'Science';
    
    return 'General';
  },

  // Calculate estimated read time
  calculateReadTime(content) {
    if (!content) return '5 min read';
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  },

  // Extract tags from blog content
  extractTags(article) {
    const tags = [];
    
    // Add source as a tag
    if (article.source?.name) {
      tags.push(article.source.name.replace(/\s+/g, ''));
    }
    
    // Extract keywords from title
    const title = (article.title || '').toLowerCase();
    const commonKeywords = ['AI', 'tech', 'business', 'health', 'news', 'update', 'breaking'];
    
    commonKeywords.forEach(keyword => {
      if (title.includes(keyword.toLowerCase())) {
        tags.push(keyword);
      }
    });
    
    // Add category as tag
    tags.push(this.extractCategory(article));
    
    return [...new Set(tags)].slice(0, 4); // Remove duplicates and limit to 4
  }
};

export default function BlogsComponent() {
  const [blogs, setBlogs] = useState([]);
  const [featuredBlog, setFeaturedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState(['All']);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 6;

  // Define loadBlogs FIRST using useCallback
  const loadBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        search: searchTerm.trim() || 'events', // Default search term
        category: selectedCategory,
        sortBy,
        page: currentPage,
        limit: itemsPerPage,
        fromDate: blogApiService.getDateDaysAgo(30),
        toDate: blogApiService.getTodayDate()
      };

      console.log('Loading blogs with params:', params);

      const response = await blogApiService.fetchBlogPosts(params);
      
      console.log('Received response:', response);
      
      setBlogs(response.blogs);
      setCategories(response.categories);
      setTotalPages(response.totalPages);
      
      // Set featured blog (first blog in the list)
      const featured = response.blogs.find(blog => blog.featured) || response.blogs[0];
      setFeaturedBlog(featured);
      
    } catch (error) {
      console.error('Error loading blogs:', error);
      setError(error.message);
      // Set fallback data in case of API failure
      setBlogs([]);
      setFeaturedBlog(null);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, sortBy, currentPage, itemsPerPage]);

  // Initial load
  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  // FIXED: Improved debounce search to avoid too many API calls
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to first page when searching
      } else {
        loadBlogs(); // Only call if already on page 1
      }
    }, 800); // Increased debounce time

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]); // Removed loadBlogs and currentPage from dependencies to avoid infinite loops

  // FIXED: Separate effect for handling page changes
  useEffect(() => {
    if (currentPage !== 1) {
      loadBlogs();
    }
  }, [currentPage, selectedCategory, sortBy]); // Don't include loadBlogs here

  const handleLike = (blogId) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blogId)) {
        newSet.delete(blogId);
      } else {
        newSet.add(blogId);
      }
      return newSet;
    });
  };

  const handleBookmark = (blogId) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blogId)) {
        newSet.delete(blogId);
      } else {
        newSet.add(blogId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReadMore = (blog) => {
    if (blog.url && blog.url !== '#') {
      window.open(blog.url, '_blank', 'noopener,noreferrer');
    }
  };

  // FIXED: Added search clear function
  const handleSearchClear = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const BlogCard = ({ blog, isGrid = true }) => (
    <div className={`card ${isGrid ? 'grid-card' : 'list-card'}`}>
      <div className="card-img">
        <img
          src={blog.image}
          alt={blog.title}
          onError={(e) => {
            e.target.src = blogApiService.getPlaceholderImage(blog.category);
          }}
        />
        <div className="card-overlay">
          <span className="category-badge">
            {blog.category}
          </span>
          <div className="action-buttons">
            <button
              onClick={() => handleLike(blog.id)}
              className={`action-btn ${likedPosts.has(blog.id) ? 'liked' : ''}`}
            >
              <Heart size={16} fill={likedPosts.has(blog.id) ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => handleBookmark(blog.id)}
              className={`action-btn ${bookmarkedPosts.has(blog.id) ? 'bookmarked' : ''}`}
            >
              <Bookmark size={16} fill={bookmarkedPosts.has(blog.id) ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="date-badge">
            {formatDate(blog.date)}
          </div>
        </div>
      </div>
      
      <div className="card-body">
        <h3 className="card-title" onClick={() => handleReadMore(blog)}>
          {blog.title}
        </h3>
        
        <p className="card-excerpt">
          {blog.excerpt}
        </p>
        
        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="tags-container">
            {blog.tags.map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="card-footer">
          <div className="author-info">
            <img
              src={blog.author.avatar}
              alt={blog.author.name}
              className="author-avatar"
            />
            <span className="author-name">
              {blog.author.name}
            </span>
          </div>
          
          <div className="details">
            <div className="read-time">
              <Clock size={12} />
              <span>{blog.readTime}</span>
            </div>
            <div className="stats">
              <div className="stat">
                <Eye size={12} />
                <span>{blog.views}</span>
              </div>
              <div className="stat">
                <Heart size={12} />
                <span>{blog.likes}</span>
              </div>
              <div className="stat">
                <MessageCircle size={12} />
                <span>{blog.comments}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => handleReadMore(blog)}
          className="read-more-btn"
        >
          Read Full Article
        </button>
      </div>
    </div>
  );

  // Error state
  if (error) {
    return (
      <div id="blogs-section" className="error-state">
        <div className="container">
          <div className="error-card">
            <div className="error-icon">
              <MessageCircle size={48} />
            </div>
            <h2>Error Loading Blogs</h2>
            <p>{error}</p>
            <div className="error-details">
              <p>
                Make sure your RapidAPI key is set in your environment variables as REACT_APP_RAPIDAPI_KEY
              </p>
              <button onClick={loadBlogs} className="retry-btn">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="blogs-section">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>Latest Blogs & Articles</h1>
          <p>Discover the latest insights, trends, and stories from around the world</p>
        </div>

        {/* Featured Blog */}
        {featuredBlog && (
          <div className="featured-section">
            <div className="featured-card">
              <div className="featured-image">
                <img
                  src={featuredBlog.image}
                  alt={featuredBlog.title}
                  onError={(e) => {
                    e.target.src = blogApiService.getPlaceholderImage(featuredBlog.category);
                  }}
                />
              </div>
              <div className="featured-content">
                <div className="featured-badge">
                  <span>Featured Post</span>
                </div>
                <h2>{featuredBlog.title}</h2>
                <p>{featuredBlog.excerpt}</p>
                <div className="featured-meta">
                  <div className="author-info">
                    <img
                      src={featuredBlog.author.avatar}
                      alt={featuredBlog.author.name}
                    />
                    <span>{featuredBlog.author.name}</span>
                  </div>
                  <span>•</span>
                  <span>{formatDate(featuredBlog.date)}</span>
                  <span>•</span>
                  <span>{featuredBlog.readTime}</span>
                </div>
                <button 
                  onClick={() => handleReadMore(featuredBlog)}
                  className="featured-btn"
                >
                  <BookOpen size={18} />
                  Read Article
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="controls-section">
          <div className="controls-card">
            <div className="search-container">
              <div className="search-input">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search articles, topics, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={handleSearchClear} className="search-clear">
                    ×
                  </button>
                )}
              </div>
            </div>
            
            <div className="filters-container">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="mobile-filter-btn"
              >
                <Filter size={18} />
                Filters
              </button>
              
              <div className={`filters ${showFilters ? 'show' : ''}`}>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-select"
                >
                  {categories.map(category => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Popular</option>
                </select>
                
                <div className="view-toggle">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'active' : ''}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'active' : ''}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* ADDED: Search status indicator */}
          {searchTerm && (
            <div className="search-status">
              <p>Searching for: "<strong>{searchTerm}</strong>"</p>
              {!loading && blogs.length === 0 && (
                <p>No results found. Try different search terms.</p>
              )}
            </div>
          )}
        </div>

        {/* Blog Posts */}
        {loading ? (
          <div className="row">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="col">
                <div className="card loading">
                  <div className="card-img skeleton"></div>
                  <div className="card-body">
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-tags">
                      <div className="skeleton-tag"></div>
                      <div className="skeleton-tag"></div>
                    </div>
                    <div className="skeleton-line btn"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="no-results">
            <Search size={48} />
            <h3>No articles found</h3>
            <p>Try adjusting your search terms or check your internet connection</p>
            {searchTerm && (
              <button onClick={handleSearchClear} className="clear-search-btn">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className={`row ${viewMode}`}>
            {blogs.filter(blog => !blog.featured).map(blog => (
              <div key={blog.id} className="col">
                <BlogCard blog={blog} isGrid={viewMode === 'grid'} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {blogs.length > 0 && totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            
            <div className="pagination-numbers">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages));
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`pagination-number ${pageNum === currentPage ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}