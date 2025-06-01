import { useState, useEffect, useCallback } from 'react';

// RapidAPI configuration for Blogs API
const RAPIDAPI_CONFIG = {
  baseURL: 'https://blogs-api1.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
    'x-rapidapi-host': 'blogs-api1.p.rapidapi.com'
  }
};

// Fallback mock data for when API fails
const MOCK_BLOGS = [
  {
    id: 'mock-1',
    title: 'The Future of Event Planning Technology',
    excerpt: 'Discover how AI and automation are revolutionizing the way we plan and execute events.',
    content: 'The event planning industry is experiencing a technological revolution...',
    category: 'Technology',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random'
    },
    date: new Date().toISOString(),
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
    likes: 245,
    comments: 18,
    views: 1520,
    featured: true,
    tags: ['Technology', 'Events', 'AI'],
    url: '#'
  },
  {
    id: 'mock-2',
    title: 'Corporate Event Trends for 2024',
    excerpt: 'Explore the latest trends shaping corporate events and business gatherings.',
    content: 'Corporate events are evolving with new technologies and changing workplace dynamics...',
    category: 'Business',
    author: {
      name: 'Michael Chen',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=random'
    },
    date: new Date(Date.now() - 86400000).toISOString(),
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop',
    likes: 189,
    comments: 12,
    views: 980,
    featured: false,
    tags: ['Business', 'Corporate', 'Trends'],
    url: '#'
  },
  {
    id: 'mock-3',
    title: 'Sustainable Event Planning Practices',
    excerpt: 'Learn how to organize eco-friendly events that make a positive environmental impact.',
    content: 'Sustainability is becoming a crucial consideration in event planning...',
    category: 'Environment',
    author: {
      name: 'Emma Rodriguez',
      avatar: 'https://ui-avatars.com/api/?name=Emma+Rodriguez&background=random'
    },
    date: new Date(Date.now() - 172800000).toISOString(),
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop',
    likes: 312,
    comments: 25,
    views: 1850,
    featured: false,
    tags: ['Environment', 'Sustainability', 'Green'],
    url: '#'
  }
];

// API service functions
export const blogApiService = {
  // Transform API data with better error handling
  transformApiData(apiResponse) {
    console.log('Raw API Response:', apiResponse);
    
    // Check for the correct nested structure
    const articles = apiResponse?.response?.articles || apiResponse?.articles || [];
    
    console.log(`Found ${articles.length} articles to transform`);
    
    if (!apiResponse || !articles || articles.length === 0) {
      console.warn('No articles found in API response structure');
      return { success: false, articles: [] };
    }

    // Transform articles to match component structure
    const transformedBlogs = articles.map((article, index) => ({
      id: article.source?.id || article.id || `article-${index}`,
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

    return {
      success: true,
      articles: transformedBlogs,
      totalResults: apiResponse?.response?.totalResults || apiResponse?.totalResults || transformedBlogs.length
    };
  },

  // Fetch blog posts with filtering and pagination
  async fetchBlogPosts(params = {}) {
    try {
      // Check if API key is available
      const apiKey = process.env.REACT_APP_RAPIDAPI_KEY || 'c84d48bab2msh9d76608950dededp140d08jsnfc902094080c';
      
      if (!apiKey || apiKey === 'your-rapidapi-key-here') {
        console.warn('No valid API key found, using mock data');
        return this.getMockData(params);
      }

      // Prepare query parameters for the Blogs API
      const queryParams = new URLSearchParams({
        q: params.search || 'events planning technology',
        sortBy: params.sortBy === 'newest' ? 'latest' : 'popularity',
        from: params.fromDate || this.getDateDaysAgo(30),
        to: params.toDate || this.getTodayDate()
      });

      console.log('API Request URL:', `${RAPIDAPI_CONFIG.baseURL}/get-blogs?${queryParams}`);

      const response = await fetch(`${RAPIDAPI_CONFIG.baseURL}/get-blogs?${queryParams}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'blogs-api1.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        console.warn(`API request failed with status: ${response.status}, falling back to mock data`);
        return this.getMockData(params);
      }

      const data = await response.json();
      console.log('Full API Response:', data);
      console.log('Response Status:', data.ok ? 'Success' : 'Failed');
      console.log('Articles Count:', data.response?.articles?.length || data.articles?.length || 0);

      // Transform the API response
      const transformResult = this.transformApiData(data);
      
      if (!transformResult.success || transformResult.articles.length === 0) {
        console.warn('Transformation failed or no articles found, using mock data');
        return this.getMockData(params);
      }

      // Implement client-side pagination
      const startIndex = ((params.page || 1) - 1) * (params.limit || 6);
      const endIndex = startIndex + (params.limit || 6);
      const paginatedBlogs = transformResult.articles.slice(startIndex, endIndex);

      return {
        blogs: paginatedBlogs,
        totalPages: Math.ceil(transformResult.articles.length / (params.limit || 6)),
        totalResults: transformResult.totalResults,
        categories: ['All', 'Technology', 'Business', 'Health', 'Entertainment', 'Sports', 'Science'],
        usingApiData: true
      };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      console.warn('Falling back to mock data due to API error');
      return this.getMockData(params);
    }
  },

  // Get mock data when API fails
  getMockData(params = {}) {
    let filteredBlogs = [...MOCK_BLOGS];
    
    // Apply search filter
    if (params.search && params.search.trim()) {
      const searchTerm = params.search.toLowerCase();
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm) ||
        blog.excerpt.toLowerCase().includes(searchTerm) ||
        blog.category.toLowerCase().includes(searchTerm) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply category filter
    if (params.category && params.category !== 'all') {
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.category.toLowerCase() === params.category.toLowerCase()
      );
    }

    // Apply sorting
    if (params.sortBy === 'oldest') {
      filteredBlogs.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (params.sortBy === 'popular') {
      filteredBlogs.sort((a, b) => b.likes - a.likes);
    } else {
      filteredBlogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Implement pagination
    const startIndex = ((params.page || 1) - 1) * (params.limit || 6);
    const endIndex = startIndex + (params.limit || 6);
    const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

    return {
      blogs: paginatedBlogs,
      totalPages: Math.ceil(filteredBlogs.length / (params.limit || 6)),
      totalResults: filteredBlogs.length,
      categories: ['All', 'Technology', 'Business', 'Environment', 'Health', 'Entertainment'],
      usingApiData: false
    };
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
      'Science': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&h=400&fit=crop',
      'Environment': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop'
    };
    return placeholders[category] || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop';
  },

  // Extract category from blog
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

// Custom hook for managing blogs state and functionality
export const useBlogsData = () => {
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
  const [usingMockData, setUsingMockData] = useState(false);

  const itemsPerPage = 6;

  // Define loadBlogs function
  const loadBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        search: searchTerm.trim() || 'events',
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
      
      // Check if we're using mock data
      if (response.blogs.length > 0 && response.blogs[0].id?.startsWith('mock-')) {
        setUsingMockData(true);
      }
      
      // Set featured blog
      const featured = response.blogs.find(blog => blog.featured) || response.blogs[0];
      setFeaturedBlog(featured);
      
    } catch (error) {
      console.error('Error loading blogs:', error);
      setError(error.message);
      // Use mock data as final fallback
      const mockResponse = blogApiService.getMockData({
        search: searchTerm.trim() || 'events',
        category: selectedCategory,
        sortBy,
        page: currentPage,
        limit: itemsPerPage
      });
      setBlogs(mockResponse.blogs);
      setCategories(mockResponse.categories);
      setTotalPages(mockResponse.totalPages);
      setFeaturedBlog(mockResponse.blogs[0]);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, sortBy, currentPage, itemsPerPage]);

  // Initial load
  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  // Debounced search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1);
    }, 800);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Handle page changes
  useEffect(() => {
    loadBlogs();
  }, [currentPage, selectedCategory, sortBy]);

  // Handler functions
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

  const handleReadMore = (blog) => {
    if (blog.url && blog.url !== '#') {
      window.open(blog.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Return all state and handlers needed by the UI component
  return {
    // State
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
    itemsPerPage,
    
    // Setters
    setSearchTerm,
    setSelectedCategory,
    setSortBy,
    setViewMode,
    setCurrentPage,
    setShowFilters,
    
    // Handlers
    handleLike,
    handleBookmark,
    handleReadMore,
    handleSearchClear,
    formatDate,
    
    // Utility functions
    loadBlogs
  };
};

// Export utility functions that might be needed
export const blogUtils = {
  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};