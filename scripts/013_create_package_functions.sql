-- Create or replace the function to create a package with amenities
CREATE OR REPLACE FUNCTION create_package_with_amenities(
  package_data JSONB,
  amenity_ids UUID[]
) 
RETURNS SETOF packages
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_package packages%ROWTYPE;
  amenity_id UUID;
BEGIN
  -- Insert the package
  INSERT INTO packages (
    name,
    description,
    price,
    duration_days,
    max_occupancy,
    is_active,
    is_featured,
    category_id,
    images,
    includes,
    terms_and_conditions,
    created_by,
    updated_by
  ) VALUES (
    package_data->>'name',
    package_data->>'description',
    (package_data->>'price')::DECIMAL(10,2),
    COALESCE((package_data->>'duration_days')::INTEGER, 1),
    COALESCE((package_data->>'max_occupancy')::INTEGER, 2),
    COALESCE((package_data->>'is_active')::BOOLEAN, true),
    COALESCE((package_data->>'is_featured')::BOOLEAN, false),
    NULLIF(package_data->>'category_id', '')::UUID,
    COALESCE((package_data->'images')::TEXT[], ARRAY['/placeholder-package.jpg']),
    COALESCE((package_data->'includes')::TEXT[], '{}'::TEXT[]),
    package_data->>'terms_and_conditions',
    (package_data->>'created_by')::UUID,
    (package_data->>'updated_by')::UUID
  )
  RETURNING * INTO new_package;

  -- Insert package amenities
  IF array_length(amenity_ids, 1) > 0 THEN
    INSERT INTO package_amenities (package_id, amenity_id)
    SELECT new_package.id, unnest(amenity_ids);
  END IF;

  -- Return the newly created package
  RETURN NEXT new_package;
  RETURN;
END;
$$;

-- Create or replace the function to update a package with amenities
CREATE OR REPLACE FUNCTION update_package_with_amenities(
  p_package_id UUID,
  p_package_data JSONB,
  p_amenity_ids UUID[]
) 
RETURNS SETOF packages
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_package packages%ROWTYPE;
BEGIN
  -- Update the package
  UPDATE packages
  SET 
    name = COALESCE(p_package_data->>'name', name),
    description = COALESCE(p_package_data->>'description', description),
    price = COALESCE((p_package_data->>'price')::DECIMAL(10,2), price),
    duration_days = COALESCE((p_package_data->>'duration_days')::INTEGER, duration_days),
    max_occupancy = COALESCE((p_package_data->>'max_occupancy')::INTEGER, max_occupancy),
    is_active = COALESCE((p_package_data->>'is_active')::BOOLEAN, is_active),
    is_featured = COALESCE((p_package_data->>'is_featured')::BOOLEAN, is_featured),
    category_id = CASE 
                  WHEN p_package_data->>'category_id' IS NULL THEN category_id
                  WHEN p_package_data->>'category_id' = '' THEN NULL
                  ELSE (p_package_data->>'category_id')::UUID
                 END,
    images = COALESCE((p_package_data->'images')::TEXT[], images),
    includes = COALESCE((p_package_data->'includes')::TEXT[], includes),
    terms_and_conditions = COALESCE(p_package_data->>'terms_and_conditions', terms_and_conditions),
    updated_by = (p_package_data->>'updated_by')::UUID,
    updated_at = NOW()
  WHERE id = p_package_id
  RETURNING * INTO updated_package;

  -- Update package amenities
  IF p_amenity_ids IS NOT NULL THEN
    -- Delete existing package amenities
    DELETE FROM package_amenities WHERE package_id = p_package_id;
    
    -- Insert new package amenities if any
    IF array_length(p_amenity_ids, 1) > 0 THEN
      INSERT INTO package_amenities (package_id, amenity_id)
      SELECT p_package_id, unnest(p_amenity_ids);
    END IF;
  END IF;

  -- Return the updated package
  RETURN NEXT updated_package;
  RETURN;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_package_with_amenities(JSONB, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION update_package_with_amenities(UUID, JSONB, UUID[]) TO authenticated;
