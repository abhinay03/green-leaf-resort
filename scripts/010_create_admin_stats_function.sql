-- Create a function to get admin statistics
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
  stats AS (
    SELECT
      COUNT(*) FILTER (WHERE 1=1) AS total_bookings,
      COUNT(*) FILTER (WHERE check_in_date = today_date) AS today_check_ins,
      COUNT(*) FILTER (WHERE check_out_date = today_date) AS today_check_outs,
      COUNT(*) FILTER (WHERE status = 'pending') AS pending_bookings,
      COALESCE(SUM(total_amount) FILTER (
        WHERE to_char(created_at, 'YYYY-MM') = current_month
      ), 0) AS monthly_revenue
    FROM bookings
  ),
  room_counts AS (
    SELECT
      COUNT(*) AS total_rooms,
      COUNT(*) FILTER (
        WHERE id IN (
          SELECT accommodation_id 
          FROM bookings 
          WHERE status = 'confirmed'
            AND check_in_date <= today_date 
            AND check_out_date >= today_date
        )
      ) AS occupied_rooms
    FROM accommodations
  )
  SELECT 
    s.total_bookings,
    s.today_check_ins,
    s.today_check_outs,
    CASE 
      WHEN rc.total_rooms > 0 THEN ROUND((rc.occupied_rooms::numeric / rc.total_rooms) * 100)
      ELSE 0 
    END AS occupancy_rate,
    s.monthly_revenue,
    s.pending_bookings
  FROM stats s, room_counts rc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
