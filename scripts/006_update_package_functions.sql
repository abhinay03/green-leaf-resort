-- Create function to handle package updates with amenities
CREATE OR REPLACE FUNCTION update_package_with_amenities(
  package_id UUID,
  package_data JSONB,
  amenity_ids UUID[]
) RETURNS JSONB AS $$
DECLARE
  updated_package packages%ROWTYPE;
  amenity_id UUID;
BEGIN
  -- Update the package
  UPDATE packages SET
    name = COALESCE(package_data->>'name', name),
    description = COALESCE(package_data->>'description', description),
    price = COALESCE((package_data->>'price')::DECIMAL, price),
    duration = COALESCE((package_data->>'duration')::INTEGER, duration),
    max_occupancy = COALESCE((package_data->>'max_occupancy')::INTEGER, max_occupancy),
    is_active = COALESCE((package_data->>'is_active')::BOOLEAN, is_active),
    images = COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(
        COALESCE(package_data->'images', to_jsonb(images))
      )),
      '{}'::TEXT[]
    ),
    updated_by = (package_data->>'updated_by')::UUID,
    updated_at = NOW()
  WHERE id = package_id
  RETURNING * INTO updated_package;

  -- Update package amenities
  -- First, delete existing package amenities
  DELETE FROM package_amenities WHERE package_id = package_id;
  
  -- Then add the new ones
  FOREACH amenity_id IN ARRAY amenity_ids
  LOOP
    INSERT INTO package_amenities (package_id, amenity_id)
    VALUES (package_id, amenity_id);
  END LOOP;

  -- Return the updated package with its amenities
  RETURN (
    SELECT jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'description', p.description,
      'price', p.price,
      'duration', p.duration,
      'max_occupancy', p.max_occupancy,
      'is_active', p.is_active,
      'images', p.images,
      'created_at', p.created_at,
      'updated_at', p.updated_at,
      'amenities', COALESCE(
        (
          SELECT jsonb_agg(jsonb_build_object(
            'id', a.id,
            'name', a.name,
            'description', a.description,
            'icon', a.icon
          ))
          FROM amenities a
          JOIN package_amenities pa ON a.id = pa.amenity_id
          WHERE pa.package_id = p.id
        ),
        '[]'::jsonb
      )
    )
    FROM packages p
    WHERE p.id = package_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating package: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
