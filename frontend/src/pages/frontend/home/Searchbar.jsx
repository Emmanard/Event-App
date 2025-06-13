import { DatePicker, Input, Select, message } from "antd";
import React, { useState, useEffect } from "react";
import { 
  searchEvents, 
  getEventCategories, 
  getAllEvents,
  advancedSearchEvents,
  getEventsByCategory 
} from '../../../services/event/index'

export default function Searchbar({ onSearchResults, onLoading }) {
  const [searchForm, setSearchForm] = useState({
    location: "",
    date: null,
    category: ""
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getEventCategories();
        if (response.success) {
          const categoryOptions = response.data.map(category => ({
            value: category.value || category.name,
            label: category.label || category.name
          }));
          setCategories(categoryOptions);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback categories if API fails
        setCategories([
          { value: "music", label: "Music" },
          { value: "sports", label: "Sports" },
          { value: "technology", label: "Technology" },
          { value: "business", label: "Business" },
          { value: "health", label: "Health & Wellness" },
          { value: "education", label: "Education" },
          { value: "entertainment", label: "Entertainment" },
          { value: "food", label: "Food & Drink" },
          { value: "arts", label: "Arts & Culture" },
          { value: "networking", label: "Networking" }
        ]);
      }
    };

    fetchCategories();
  }, []);

  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const handleInputChange = (field, value) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchForm.location && !searchForm.date && !searchForm.category) {
      message.warning("Please enter at least one search criteria");
      return;
    }

    setLoading(true);
    if (onLoading) onLoading(true);

    try {
      // Prepare search parameters
      const searchParams = {};
      
      if (searchForm.location) {
        searchParams.location = searchForm.location;
      }
      
      if (searchForm.date) {
        // Format date for API (assuming ISO format)
        searchParams.date = searchForm.date.format('YYYY-MM-DD');
        searchParams.dateFrom = searchForm.date.format('YYYY-MM-DD');
        searchParams.dateTo = searchForm.date.format('YYYY-MM-DD');
      }
      
      if (searchForm.category) {
        searchParams.category = searchForm.category;
      }

      let response;
      
      // Use advanced search if multiple criteria, otherwise use basic search
      if (Object.keys(searchParams).length > 1) {
        response = await advancedSearchEvents(searchParams);
      } else if (searchForm.location) {
        // Use basic search for location-based queries
        searchParams.query = searchForm.location;
        response = await searchEvents(searchParams);
      } else if (searchForm.category) {
        // Use category-specific endpoint
        const categoryOptions = {
          ...(searchForm.date && { 
            dateFrom: searchParams.dateFrom,
            dateTo: searchParams.dateTo 
          })
        };
        response = await getEventsByCategory(searchForm.category, categoryOptions);
      } else {
        // Fallback to getAllEvents with filters
        response = await getAllEvents(searchParams);
      }

      if (response.success) {
        const events = response.data.events || response.data || [];
        
        if (events.length === 0) {
          message.info("No events found matching your criteria. Try adjusting your search.");
        } else {
          message.success(`Found ${events.length} event(s) matching your criteria`);
        }
        
        // Pass results to parent component
        if (onSearchResults) {
          onSearchResults(events, searchParams);
        }
      } else {
        throw new Error(response.message || "Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      message.error("Failed to search events. Please try again.");
      
      // Pass empty results on error
      if (onSearchResults) {
        onSearchResults([], searchForm);
      }
    } finally {
      setLoading(false);
      if (onLoading) onLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchForm({
      location: "",
      date: null,
      category: ""
    });
    
    // Optionally clear results
    if (onSearchResults) {
      onSearchResults(null, null);
    }
  };

  return (
    <div id="searchbar-section">
      <div className="container">
        <div className="card p-4 p-sm-5 rounded-pill border-0 shadow-lg">
          <form onSubmit={handleSearch}>
            <div className="row g-3 d-flex justify-content-center">
              <div className="col-12 col-sm-6 col-lg-3">
                <Input 
                  placeholder="Enter Location..." 
                  value={searchForm.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  size="large"
                />
              </div>
              
              <div className="col-12 col-sm-6 col-lg-3">
                <DatePicker 
                  size="large" 
                  placeholder="Select Date"
                  value={searchForm.date}
                  onChange={(date) => handleInputChange('date', date)}
                  disabledDate={(current) => current && current < new Date().setHours(0, 0, 0, 0)}
                  style={{ width: '100%' }}
                />
              </div>
              
              <div className="col-12 col-lg-3">
                <Select
                  showSearch
                  placeholder="Select Category"
                  optionFilterProp="children"
                  filterOption={filterOption}
                  options={categories}
                  value={searchForm.category || undefined}
                  onChange={(value) => handleInputChange('category', value)}
                  size="large"
                  style={{ width: '100%' }}
                  allowClear
                />
              </div>
              
              <div className="col-12 col-lg-2">
                <div className="d-flex gap-2">
                  <button 
                    type="submit"
                    className="button-stylling rounded bg-warning border-0"
                    disabled={loading}
                  >
                    <span className="text">
                      {loading ? 'Searching...' : 'Search Now'}
                    </span>
                    <span>Discover</span>
                  </button>
                  
                  {(searchForm.location || searchForm.date || searchForm.category) && (
                    <button 
                      type="button"
                      onClick={handleClearSearch}
                      className="btn btn-outline-secondary btn-sm"
                      style={{ minWidth: '60px' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}