-- Insert sample accommodations
insert into public.accommodations (name, type, description, capacity, price_per_night, amenities, images) values
(
  'Luxury Cottage Premium',
  'luxury_cottage',
  'Spacious luxury cottage with modern amenities and stunning lake views. Perfect for couples seeking ultimate comfort.',
  2,
  8500.00,
  ARRAY['Air Conditioning', 'Private Bathroom', 'Lake View', 'Mini Bar', 'WiFi', 'Room Service'],
  ARRAY['/images/luxury-cottage-1.jpg', '/images/luxury-cottage-2.jpg']
),
(
  'Swiss Tent Deluxe',
  'swiss_tent',
  'Comfortable Swiss-style tent with all modern facilities. Experience camping with luxury amenities.',
  4,
  6500.00,
  ARRAY['Comfortable Bedding', 'Private Bathroom', 'Garden View', 'WiFi', 'Breakfast Included'],
  ARRAY['/images/swiss-tent-1.jpg', '/images/swiss-tent-2.jpg']
),
(
  'Glamping Tent Adventure',
  'glamping_tent',
  'Unique glamping experience with nature views. Perfect for adventure seekers who love comfort.',
  3,
  4500.00,
  ARRAY['Comfortable Bedding', 'Shared Bathroom', 'Nature View', 'Campfire Area', 'Adventure Activities'],
  ARRAY['/images/glamping-tent-1.jpg', '/images/glamping-tent-2.jpg']
);

-- Insert sample packages
insert into public.packages (name, description, price, duration_days, includes) values
(
  'Romantic Getaway',
  'Perfect package for couples with candlelight dinner, spa treatments, and romantic activities.',
  15000.00,
  2,
  ARRAY['Accommodation', 'Candlelight Dinner', 'Couple Spa', 'Boat Ride', 'Welcome Drinks']
),
(
  'Adventure Package',
  'Thrilling adventure package with water sports, trekking, and outdoor activities.',
  12000.00,
  3,
  ARRAY['Accommodation', 'Water Sports', 'Trekking', 'Kayaking', 'All Meals', 'Adventure Guide']
),
(
  'Family Fun Package',
  'Complete family entertainment with activities for all ages.',
  18000.00,
  3,
  ARRAY['Accommodation', 'Family Activities', 'Kids Play Area', 'All Meals', 'Swimming Pool Access', 'Nature Walks']
),
(
  'Corporate Retreat',
  'Professional package for corporate teams with meeting facilities and team building activities.',
  25000.00,
  2,
  ARRAY['Accommodation', 'Meeting Room', 'Team Building', 'Business Lunch', 'WiFi', 'Projector Setup']
);
