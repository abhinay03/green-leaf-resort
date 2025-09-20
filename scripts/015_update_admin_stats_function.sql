-- Drop the old function if it exists
DROP FUNCTION IF EXISTS get_admin_stats(DATE, TEXT);

-- Create an updated function to get admin statistics
CREATE OR REPLACE FUNCTION get_admin_stats(
  today_date DATE,
  current_month TEXT
) RETURNS TABLE (
  total_bookings BIGINT,
  today_check_ins BIGINT,
  today_check_outs BIGINT,
  occupancy_rate NUMERIC,
  monthly_revenue NUMERIC,
  pending_bookings BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH 
  -- Get all bookings with their status
  booking_stats AS (
    SELECT
      b.id,
      b.status,
      b.check_in_date,
      b.check_out_date,
      b.total_amount,
      b.created_at,
      -- Consider a booking as active if it's confirmed and the dates overlap with today
      CASE 
        WHEN b.status = 'confirmed' 
          AND b.check_in_date <= today_date 
          AND b.check_out_date >= today_date 
        THEN TRUE 
        ELSE FALSE 
      END AS is_active_today,
      -- Consider a booking as checking in today
      CASE 
        WHEN b.status IN ('confirmed', 'checked_in') 
          AND b.check_in_date = today_date 
        THEN TRUE 
        ELSE FALSE 
      END AS is_checking_in_today,
      -- Consider a booking as checking out today
      CASE 
        WHEN b.status IN ('confirmed', 'checked_in') 
          AND b.check_out_date = today_date 
        THEN TRUE 
        ELSE FALSE 
      END AS is_checking_out_today
    FROM bookings b
    WHERE b.deleted_at IS NULL
  ),
  
  -- Calculate statistics
  stats AS (
    SELECT
      -- Total non-deleted bookings
      COUNT(*) AS total_bookings,
      
      -- Today's check-ins (bookings with check-in date today and status confirmed/checked_in)
      COUNT(*) FILTER (WHERE is_checking_in_today) AS today_check_ins,
      
      -- Today's check-outs (bookings with check-out date today and status confirmed/checked_in)
      COUNT(*) FILTER (WHERE is_checking_out_today) AS today_check_outs,
      
      -- Pending bookings
      COUNT(*) FILTER (WHERE status = 'pending') AS pending_bookings,
      
      -- Monthly revenue (sum of total_amount for confirmed/completed bookings in current month)
      COALESCE(SUM(total_amount) FILTER (
        WHERE status IN ('confirmed', 'completed', 'checked_in', 'checked_out')
        AND to_char(created_at, 'YYYY-MM') = current_month
      ), 0) AS monthly_revenue
    FROM booking_stats
  ),
  
  -- Calculate room occupancy
  room_counts AS (
    SELECT
      COUNT(*) AS total_rooms,
      COUNT(DISTINCT b.accommodation_id) FILTER (
        WHERE b.status IN ('confirmed', 'checked_in')
        AND b.check_in_date <= today_date 
        AND b.check_out_date >= today_date
      ) AS occupied_rooms
    FROM accommodations a
    LEFT JOIN bookings b ON a.id = b.accommodation_id
    WHERE a.is_active = true
    AND (b.id IS NULL OR b.deleted_at IS NULL)
  )
  
  -- Combine all statistics
  SELECT 
    s.total_bookings,
    s.today_check_ins,
    s.today_check_outs,
    CASE 
      WHEN rc.total_rooms > 0 
      THEN ROUND((rc.occupied_rooms::numeric / NULLIF(rc.total_rooms, 0)) * 100, 1)
      ELSE 0 
    END AS occupancy_rate,
    s.monthly_revenue,
    s.pending_bookings
  FROM stats s, room_counts rc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_stats(DATE, TEXT) TO authenticated;
