-- Users Table (Adapted for Supabase Auth)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    avatar_url TEXT,
    profile_data JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

-- Allow public read access to profiles (Required for Item Details/Seller Card)
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.users FOR SELECT 
    USING (true);

-- Items Table
CREATE TABLE public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    category VARCHAR(50) NOT NULL,
    condition VARCHAR(20) NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    location JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_items_user_id ON public.items(user_id);
CREATE INDEX idx_items_category ON public.items(category);
CREATE INDEX idx_items_price ON public.items(price);
CREATE INDEX idx_items_created_at ON public.items(created_at DESC);
CREATE INDEX idx_items_active ON public.items(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active items" 
    ON public.items FOR SELECT 
    USING (is_active = TRUE);

CREATE POLICY "Users can create their own items" 
    ON public.items FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" 
    ON public.items FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" 
    ON public.items FOR DELETE 
    USING (auth.uid() = user_id);

-- Images Table
CREATE TABLE public.images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_images_item_id ON public.images(item_id);
CREATE INDEX idx_images_sort_order ON public.images(item_id, sort_order);

-- Enable RLS for Images (Implicitly handled by item access usually, but good to have)
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view images" 
    ON public.images FOR SELECT 
    USING (true);

CREATE POLICY "Users can manage images for their items" 
    ON public.images FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.items 
            WHERE items.id = images.item_id 
            AND items.user_id = auth.uid()
        )
    );

-- Categories Table
CREATE TABLE public.categories (
    slug VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS for Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" 
    ON public.categories FOR SELECT 
    USING (true);

-- Insert initial categories
INSERT INTO public.categories (slug, name, icon, sort_order) VALUES
('electronics', 'Electronics', 'device-phone-mobile', 1),
('clothing', 'Clothing', 'shirt', 2),
('home-garden', 'Home & Garden', 'home', 3),
('sports', 'Sports & Outdoors', 'sport', 4),
('books', 'Books & Media', 'book-open', 5),
('vehicles', 'Vehicles', 'truck', 6),
('toys', 'Toys & Games', 'puzzle-piece', 7),
('jewelry', 'Jewelry & Accessories', 'sparkles', 8);

-- Favorites Table
CREATE TABLE public.favorites (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, item_id)
);

CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_item_id ON public.favorites(item_id);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites" 
    ON public.favorites FOR ALL 
    USING (auth.uid() = user_id);

-- Storage Configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('item-images', 'item-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'item-images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'item-images' AND auth.role() = 'authenticated'
);

-- Permissions are handled in a separate secure migration

