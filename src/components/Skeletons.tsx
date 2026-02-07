import React from 'react';
import { Skeleton } from './ui/skeleton';

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <Skeleton className="h-12 w-12 rounded-full mb-3" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="aspect-square relative">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="p-4 flex-1 flex flex-col space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-auto flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function ItemDetailsSkeleton() {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        <div className="p-8 border-b lg:border-b-0 lg:border-r border-gray-200">
          <Skeleton className="aspect-w-4 aspect-h-3 rounded-lg mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-20 w-20 rounded-md" />
            <Skeleton className="h-20 w-20 rounded-md" />
            <Skeleton className="h-20 w-20 rounded-md" />
          </div>
        </div>
        <div className="px-8 py-8 lg:py-12 space-y-6">
          <div className="flex justify-between">
            <div className="space-y-2 w-full mr-8">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-3/4" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
