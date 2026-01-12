-- Migration: Add total_pages to books_library
-- Run this in Supabase SQL Editor

ALTER TABLE books_library ADD COLUMN IF NOT EXISTS total_pages INTEGER;
