-- Create function to handle package creation with amenities
CREATE OR REPLACE FUNCTION create_package_with_amenities(
  package_data JSONB,
  amenity_ids UUID[]
) RETURNS JSONB AS $$
DECLARE
  new_package packages%ROWTYPE;
  amenity_id UUID;
BEGIN
  -- Create the package
  INSERT INTO packages (
    name,
    description,
    price,
    duration,
    max_occupancy,
    is_active,
    images,
    created_by,
    updated_by
  ) VALUES (
    package_data->>'name',
    package_data->>'description',
    (package_data->>'price')::DECIMAL,
    (package_data->>'duration')::INTEGER,
    (package_data->>'max_occupancy')::INTEGER,
    COALESCE((package_data->>'is_active')::BOOLEAN, true),
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(package_data->'images')),
      '{}'::TEXT[]
    ),
    (package_data->>'created_by')::UUID,
    (package_data->>'updated_by')::UUID
  )
  RETURNING * INTO new_package;

  -- Add package amenities
  FOREACH amenity_id IN ARRAY amenity_ids
  LOOP
    INSERT INTO package_amenities (package_id, amenity_id)
    VALUES (new_package.id, amenity_id);
  END LOOP;

  -- Return the created package with its amenities
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
    WHERE p.id = new_package.id
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating package: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
