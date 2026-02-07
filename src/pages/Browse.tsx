import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Search, Filter, X, ShoppingBag } from 'lucide-react';
import { ItemCardSkeleton } from '../components/Skeletons';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LazyImage } from '../components/LazyImage';

interface Category {
  slug: string;
  name: string;
}

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  // Local state for filters to avoid excessive refetching while typing
  const [filters, setFilters] = useState({
    category: categoryParam,
    search: searchParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
  });

  // Update local state when URL params change
  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
    });
  }, [searchParams]);

  const { data: categories, isError: isCategoriesError, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('slug, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: items, isLoading, isError: isItemsError, refetch: refetchItems } = useQuery({
    queryKey: ['browse', filters],
    queryFn: async () => {
      let query = supabase
        .from('items')
        .select('*, images(url)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters.minPrice) {
        query = query.gte('price', Math.round(parseFloat(filters.minPrice) * 100));
      }

      if (filters.maxPrice) {
        query = query.lte('price', Math.round(parseFloat(filters.maxPrice) * 100));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleRetry = () => {
    refetchCategories();
    refetchItems();
  };

  if (isCategoriesError || isItemsError) {
    return <ErrorState onRetry={handleRetry} fullPage />;
  }

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    
    // Update URL params
    const params: Record<string, string> = {};
    if (updated.category) params.category = updated.category;
    if (updated.search) params.search = updated.search;
    if (updated.minPrice) params.minPrice = updated.minPrice;
    if (updated.maxPrice) params.maxPrice = updated.maxPrice;
    
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ category: '', search: '', minPrice: '', maxPrice: '' });
    setSearchParams({});
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Browse Items</h1>
          
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 -m-2 ml-4 sm:ml-6 text-gray-400 hover:text-gray-500 lg:hidden"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            >
              <span className="sr-only">Filters</span>
              <Filter className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="pt-12 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block">
            {/* ... Sidebar content unchanged ... */}
            <h3 className="sr-only">Categories</h3>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Search</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Keywords..."
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Category</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>
                    <button
                      className={`block w-full text-left ${!filters.category ? 'font-bold text-blue-600' : ''}`}
                      onClick={() => updateFilters({ category: '' })}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories?.map((category) => (
                    <li key={category.slug}>
                      <button
                        className={`block w-full text-left ${filters.category === category.slug ? 'font-bold text-blue-600' : ''}`}
                        onClick={() => updateFilters({ category: category.slug })}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Price Range</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      placeholder="Min"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      value={filters.minPrice}
                      onChange={(e) => updateFilters({ minPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Mobile Filters Dialog */}
          {isMobileFiltersOpen && (
            <div className="fixed inset-0 z-40 flex lg:hidden">
              <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileFiltersOpen(false)} />
              <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                    onClick={() => setIsMobileFiltersOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4 px-4 space-y-6">
                   {/* Mobile Filter Content - Same as Desktop but in drawer */}
                   <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Search</h3>
                    <input
                      type="text"
                      placeholder="Keywords..."
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      value={filters.search}
                      onChange={(e) => updateFilters({ search: e.target.value })}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Category</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>
                        <button
                          className={`block w-full text-left ${!filters.category ? 'font-bold text-blue-600' : ''}`}
                          onClick={() => { updateFilters({ category: '' }); setIsMobileFiltersOpen(false); }}
                        >
                          All Categories
                        </button>
                      </li>
                      {categories?.map((category) => (
                        <li key={category.slug}>
                          <button
                            className={`block w-full text-left ${filters.category === category.slug ? 'font-bold text-blue-600' : ''}`}
                            onClick={() => { updateFilters({ category: category.slug }); setIsMobileFiltersOpen(false); }}
                          >
                            {category.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Price Range</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                        value={filters.minPrice}
                        onChange={(e) => updateFilters({ minPrice: e.target.value })}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                        value={filters.maxPrice}
                        onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                      />
                    </div>
                  </div>

                   <button
                    onClick={() => { clearFilters(); setIsMobileFiltersOpen(false); }}
                    className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="mt-6 lg:mt-0 lg:col-span-2 xl:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                 {Array.from({ length: 6 }).map((_, i) => (
                  <ItemCardSkeleton key={i} />
                ))}
              </div>
            ) : items && items.length > 0 ? (
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {items.map((item) => (
                  <Link key={item.id} to={`/item/${item.id}`} className="group relative">
                    <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                      {item.images && item.images[0] ? (
                        <LazyImage
                          src={item.images[0].url}
                          alt={item.title}
                          className="w-full h-full object-center object-cover lg:w-full lg:h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                          <span className="text-sm">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex justify-between">
                      <div>
                        <h3 className="text-sm text-gray-700">
                          <span aria-hidden="true" className="absolute inset-0" />
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 capitalize">{item.category}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">${(item.price / 100).toFixed(2)}</p>
                    </div>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {item.condition.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ShoppingBag}
                title="No items found"
                description="Try adjusting your search or filters."
                action={{
                  label: "Clear Filters",
                  onClick: clearFilters
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
