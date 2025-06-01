import React from 'react';
import { Search, Clock, Heart, MessageCircle, BookOpen, Filter, Grid, List, ChevronLeft, ChevronRight, Eye, Bookmark } from 'lucide-react';
import { useBlogsData, blogApiService } from './blogApi';
import './blogs.scss';

const BlogsComponent = () => {
  // Get all state and handlers from the custom hook
  const {
    blogs,
    featuredBlog,
    loading,
    error,
    searchTerm,
    selectedCategory,
    sortBy,
    viewMode,
    currentPage,
    totalPages,
    categories,
    likedPosts,
    bookmarkedPosts,
    showFilters,
    usingMockData,
    setSearchTerm,
    setSelectedCategory,
    setSortBy,
    setViewMode,
    setCurrentPage,
    setShowFilters,
    handleLike,
    handleBookmark,
    handleReadMore,
    handleSearchClear,
    formatDate
  } = useBlogsData();

  // Blog Card Component
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
        
        {blog.tags && blog.tags.length > 0 && (
          <div className="tags-container">
            {blog.tags.map((tag, index) => (
              <span key={`${blog.id}-tag-${index}-${tag}`} className="tag">
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

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="card loading">
      <div className="card-img skeleton"></div>
      <div className="card-body">
        <div className="skeleton-line title"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
      </div>
    </div>
  );

  // Error state component
  if (error) {
    return (
      <div className="error-state">
        <div className="error-card">
          <div className="error-icon">
            <MessageCircle size={48} />
          </div>
          <h2>Something went wrong</h2>
          <p>We couldn't load the blog posts at this time.</p>
          <div className="error-details">
            <p>Please check your internet connection and try again.</p>
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Remove duplicates from categories for dropdown
  const uniqueCategories = [...new Set(categories)];
  
  // Remove duplicate blogs based on ID, keeping the first occurrence
  const uniqueBlogs = blogs.filter((blog, index, self) => 
    index === self.findIndex(b => b.id === blog.id)
  );

  return (
    <div id="blogs-section">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>Latest Blogs & Articles</h1>
          <p>Discover the latest insights, trends, and stories from around the world</p>
          {usingMockData && (
            <div className="mock-data-notice" style={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '8px',
              padding: '12px',
              margin: '16px 0',
              color: '#856404'
            }}>
              <strong>Demo Mode:</strong> Showing sample articles. Configure your RapidAPI key to see live content.
            </div>
          )}
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
                  {uniqueCategories.map((category, index) => (
                    <option key={`category-${index}-${category}`} value={category.toLowerCase()}>
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
          
          {searchTerm && (
            <div className="search-status">
              <p>Searching for: "<strong>{searchTerm}</strong>"</p>
              {!loading && uniqueBlogs.length === 0 && (
                <p>No results found. Try different search terms.</p>
              )}
            </div>
          )}
        </div>

        {/* Blog Posts */}
        {loading ? (
          <div className={`row ${viewMode === 'list' ? 'list' : ''}`}>
            {[...Array(6)].map((_, i) => (
              <div key={`loading-skeleton-${i}`} className="col">
                <LoadingSkeleton />
              </div>
            ))}
          </div>
        ) : uniqueBlogs.length === 0 ? (
          <div className="no-results">
            <Search size={64} />
            <h3>No articles found</h3>
            <p>Try adjusting your search terms or filters to find what you're looking for.</p>
          </div>
        ) : (
          <>
            <div className={`row ${viewMode === 'list' ? 'list' : ''}`}>
              {uniqueBlogs.map((blog, index) => (
                <div key={`blog-${blog.id}-${index}`} className="col">
                  <BlogCard blog={blog} isGrid={viewMode === 'grid'} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={`page-${i + 1}`}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
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
          </>
        )}
      </div>
    </div>
  );
};

export default BlogsComponent;