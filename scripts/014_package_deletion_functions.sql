-- Function to permanently delete a package and all its related records
CREATE OR REPLACE FUNCTION delete_package_permanently(
  p_package_id UUID,
  p_user_id UUID
)
RETURNS SETOF packages
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_package packages%ROWTYPE;
BEGIN
  -- Check if package exists
  PERFORM 1 FROM packages WHERE id = p_package_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Package not found';
  END IF;

  -- Delete package amenities
  DELETE FROM package_amenities WHERE package_id = p_package_id;
  
  -- Delete any package bookings or other related records here
  -- Example: DELETE FROM bookings WHERE package_id = p_package_id;
  
  -- Finally, delete the package
  DELETE FROM packages 
  WHERE id = p_package_id
  RETURNING * INTO deleted_package;
  
  RETURN NEXT deleted_package;
  RETURN;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to delete package: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_package_permanently(UUID, UUID) TO authenticated;
