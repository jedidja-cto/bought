import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ArrowRight, Image as ImageIcon, ShoppingBag, PlusCircle } from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import { CategorySkeleton, ItemCardSkeleton } from '../components/Skeletons';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LazyImage } from '../components/LazyImage';

interface Category {
  slug: string;
  name: string;
  icon: string;
}

interface Item {
  id: string;
  title: string;
  price: number;
  category: string;
  images: { url: string }[];
  condition: string;
}

export default function Home() {
  const { data: categories, isLoading: isCategoriesLoading, isError: isCategoriesError, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: featuredItems, isLoading: isItemsLoading, isError: isItemsError, refetch: refetchItems } = useQuery({
    queryKey: ['featuredItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select(`
          id,
          title,
          price,
          category,
          condition,
          images (url)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data as any[];
    },
  });

  const handleRetry = () => {
    refetchCategories();
    refetchItems();
  };

  if (isCategoriesError || isItemsError) {
    return <ErrorState onRetry={handleRetry} fullPage />;
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative bg-blue-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover opacity-20"
            src="https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"
            alt="Marketplace background"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Buy and Sell in Your Community
          </h1>
          <p className="mt-6 text-xl text-blue-100 max-w-3xl">
            Discover great deals on pre-loved items or turn your unused goods into cash. Safe, simple, and local.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              to="/browse"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
            >
              Browse Items
            </Link>
            <Link
              to="/sell"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 bg-opacity-60"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
          <Link to="/browse" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {isCategoriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories?.map((category) => (
              <Link
                key={category.slug}
                to={`/browse?category=${category.slug}`}
                className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
              >
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-100 transition-colors">
                  <CategoryIcon slug={category.slug} className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center group-hover:text-blue-600">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Items */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Fresh Recommendations</h2>
        </div>

        {isItemsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {Array.from({ length: 4 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        ) : featuredItems && featuredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <Link
                key={item.id}
                to={`/item/${item.id}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100 flex flex-col"
              >
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  {item.images && item.images[0] ? (
                    <LazyImage
                      src={item.images[0].url}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-900 capitalize">
                    {item.condition.replace('_', ' ')}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 capitalize">{item.category}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      ${(item.price / 100).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400">
                      Just now
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ShoppingBag}
            title="No items yet"
            description="Be the first to list an item for sale!"
            action={{
              label: "Sell Item",
              href: "/sell"
            }}
          />
        )}
      </section>
    </div>
  );
}
