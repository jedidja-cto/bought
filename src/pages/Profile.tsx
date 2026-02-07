import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, MapPin, Calendar, Settings as SettingsIcon, Trash2, Edit } from 'lucide-react';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();

  // Fetch profile data
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      // If "me" is used, we need the current user's profile
      // But the route param is username. 
      // Ideally "me" redirects to actual username, but let's handle it if needed
      // For now assume username is passed.
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!username,
  });

  // Fetch user's items
  const { data: items, isLoading: isItemsLoading, refetch: refetchItems } = useQuery({
    queryKey: ['user-items', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*, images(url)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);
      
      if (error) {
        alert('Error deleting item');
        console.error(error);
      } else {
        refetchItems();
      }
    }
  };

  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;

  if (isProfileLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg mb-8 overflow-hidden">
        <div className="bg-blue-600 h-32 md:h-48"></div>
        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <div className="relative flex items-end -mt-16 mb-4 sm:-mt-20 sm:mb-6">
            <div className="relative rounded-full border-4 border-white bg-white overflow-hidden h-32 w-32 sm:h-40 sm:w-40">
              {profile.avatar_url ? (
                <img
                  className="h-full w-full object-cover"
                  src={profile.avatar_url}
                  alt={profile.username}
                />
              ) : (
                <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="ml-6 flex-1 pt-20 sm:pt-0 sm:pb-2">
              <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{profile.username}</h1>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
                {isOwnProfile && (
                  <div className="mt-4 sm:mt-0">
                    <Link
                      to="/profile/settings"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Listings */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {isOwnProfile ? 'My Listings' : `${profile.username}'s Listings`}
        </h2>

        {isItemsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {items.map((item: any) => (
              <div key={item.id} className="group relative bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-w-3 aspect-h-2 bg-gray-200 group-hover:opacity-75 relative">
                  {item.images && item.images[0] ? (
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                      No Image
                    </div>
                  )}
                   {!item.is_active && (
                    <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                      Sold / Inactive
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      <Link to={`/item/${item.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {item.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                    <p className="mt-1 text-lg font-medium text-gray-900">${(item.price / 100).toFixed(2)}</p>
                  </div>
                  
                  {isOwnProfile && (
                    <div className="mt-4 flex justify-end space-x-2 relative z-10">
                      <button
                         // Edit functionality would go here - link to /sell/edit/:id
                         onClick={(e) => { e.preventDefault(); alert('Edit functionality coming soon!'); }}
                         className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteItem(item.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No items listed yet.</p>
            {isOwnProfile && (
              <Link to="/sell" className="mt-4 inline-block text-blue-600 font-medium hover:text-blue-500">
                Start selling today
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
