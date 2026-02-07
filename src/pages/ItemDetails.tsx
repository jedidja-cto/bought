import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Loader2, MapPin, Calendar, Tag, ShieldCheck, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          images (url, sort_order),
          seller:users (
            id,
            username,
            avatar_url,
            created_at,
            is_verified
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-gray-900">Item not found</h2>
        <p className="mt-2 text-gray-600">The item you're looking for doesn't exist or has been removed.</p>
        <Link to="/browse" className="mt-6 inline-block text-blue-600 hover:text-blue-500">
          Back to Browse
        </Link>
      </div>
    );
  }

  // Sort images by sort_order
  const images = item.images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
  const seller = item.seller;

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        {/* Image Gallery */}
        <div className="relative p-8 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200">
          <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-white shadow-sm mb-4 relative group">
            {images.length > 0 ? (
              <img
                src={images[activeImageIndex].url}
                alt={item.title}
                className="object-contain w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                No images available
              </div>
            )}
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>
              </>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative flex-shrink-0 h-20 w-20 rounded-md overflow-hidden border-2 ${
                    activeImageIndex === idx ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-8 py-8 lg:py-12">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-blue-600 font-semibold tracking-wide uppercase">{item.category}</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">{item.title}</h1>
            </div>
            <p className="text-3xl font-bold text-gray-900">${(item.price / 100).toFixed(2)}</p>
          </div>

          <div className="mt-6 border-t border-b border-gray-200 py-6">
            <h3 className="text-sm font-medium text-gray-900">Description</h3>
            <div className="mt-4 prose prose-blue text-gray-500">
              <p className="whitespace-pre-wrap">{item.description}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Tag className="h-5 w-5 mr-2 text-gray-400" />
                <span className="capitalize">{item.condition.replace('_', ' ')} Condition</span>
              </div>
              {item.location && item.location.name && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                  <span>{item.location.name}</span>
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                <span>Posted {new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {seller?.avatar_url ? (
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={seller.avatar_url}
                    alt={seller.username}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="text-lg font-bold">{seller?.username?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="ml-4">
                  <div className="flex items-center">
                    <p className="text-lg font-medium text-gray-900">{seller?.username}</p>
                    {seller?.is_verified && (
                      <ShieldCheck className="ml-1 h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Joined {new Date(seller?.created_at).getFullYear()}
                  </p>
                </div>
              </div>
              <Link
                to={`/profile/${seller?.username}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View Profile
              </Link>
            </div>
            
            <div className="mt-6">
              <a
                href={`mailto:${seller?.email || ''}?subject=Inquiry about: ${item.title}`}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Contact Seller
              </a>
              <p className="mt-2 text-xs text-center text-gray-500">
                Safety tip: Always meet in a public place for transactions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
