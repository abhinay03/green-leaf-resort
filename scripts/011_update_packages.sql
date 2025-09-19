-- Update accommodation prices
UPDATE public.accommodations 
SET price_per_night = 3000.00
WHERE name = 'Swiss Tent Deluxe';

UPDATE public.accommodations 
SET price_per_night = 1800.00
WHERE name = 'Glamping Tent Adventure';

-- Delete existing packages
TRUNCATE TABLE public.packages RESTART IDENTITY CASCADE;

-- Insert new packages
INSERT INTO public.packages (name, description, price, duration_days, includes) VALUES
(
  'Night Stay Package',
  'Perfect overnight stay with dinner and breakfast included.',
  1999.00,
  1,
  ARRAY['Dinner', 'Next Day Breakfast', 'Check-in: 6:00 PM', 'Check-out: 11:00 AM']
),
(
  'Day Package',
  'Day package with breakfast, lunch and hi-tea included.',
  1299.00,
  1,
  ARRAY['Breakfast', 'Lunch', 'Hi-Tea', 'Check-in: 9:00 AM', 'Check-out: 5:00 PM']
),
(
  'Extended Stay Package',
  'Complete package with lunch, hi-tea, dinner and next day breakfast.',
  2999.00,
  1,
  ARRAY['Lunch', 'Hi-Tea', 'Dinner', 'Next Day Breakfast', 'Check-in: 1:00 PM', 'Check-out: 11:00 AM']
),
(
  'Room Only',
  'Basic room without meals.',
  1599.00,
  1,
  ARRAY['No Meals Included', 'Room Only']
);
