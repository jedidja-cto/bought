import React from 'react';
import { 
  Smartphone, 
  Shirt, 
  Home, 
  Car, 
  BookOpen, 
  Trophy, 
  Gamepad2, 
  Gem, 
  Package, 
  HelpCircle,
  LucideIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

interface CategoryIconProps {
  slug: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  'electronics': Smartphone,
  'clothing': Shirt,
  'home-garden': Home,
  'vehicles': Car,
  'books': BookOpen,
  'sports': Trophy,
  'toys': Gamepad2,
  'jewelry': Gem,
  // Fallbacks or additional categories
  'other': Package,
};

export function CategoryIcon({ slug, className }: CategoryIconProps) {
  // Normalize slug to match keys (handle cases like 'Home & Garden' -> 'home-garden' if needed, though we assume slug is clean)
  const Icon = iconMap[slug.toLowerCase()] || Package;

  return <Icon className={cn("h-6 w-6", className)} />;
}
