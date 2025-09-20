-- Add booking_id column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN booking_id TEXT UNIQUE;

-- Create an index for faster lookups
CREATE INDEX idx_bookings_booking_id ON public.bookings(booking_id);

-- Comment explaining the column
COMMENT ON COLUMN public.bookings.booking_id IS 'Formatted booking ID in the format ACC-PKG-YYMM-XXX';

-- Update existing bookings with a default value if needed
-- This is a one-time operation for existing data
-- UPDATE public.bookings 
-- SET booking_id = 'LEG-' || id::TEXT || '-OLD'
-- WHERE booking_id IS NULL;
