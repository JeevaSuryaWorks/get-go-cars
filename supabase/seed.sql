-- Seed 200 cars
-- We use a CROSS JOIN LATERAL with random selection to ensure variety
INSERT INTO cars (brand, model, year, price_per_day, type, fuel_type, transmission, seats, images, features, status, rating)
SELECT
    v.brand,
    v.model,
    2020 + floor(random() * 6)::int AS year,
    -- Price in INR: 2000 to 20000
    2000 + floor(random() * 18000)::int AS price_per_day,
    v.type,
    v.fuel_type,
    v.transmission,
    (ARRAY[2, 4, 5, 7])[floor(random() * 4 + 1)] AS seats,
    ARRAY[v.image],
    ARRAY['GPS', 'Bluetooth', 'Heated Seats', 'Backup Camera', 'Apple CarPlay'],
    CASE WHEN random() > 0.8 THEN 'rented' ELSE 'available' END AS status,
    round((4 + random())::numeric, 1) AS rating
FROM
    generate_series(1, 200) as id,
    LATERAL (
        SELECT 
            *
        FROM (
            VALUES 
                ('BMW', 'M3', 'Sports', 'gasoline', 'automatic', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2670&auto=format&fit=crop'),
                ('BMW', 'X5', 'SUV', 'diesel', 'automatic', 'https://images.unsplash.com/photo-1555215695-3004980adade?q=80&w=2670&auto=format&fit=crop'),
                ('Mercedes', 'C-Class', 'Sedan', 'gasoline', 'automatic', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2670&auto=format&fit=crop'),
                ('Mercedes', 'G-Wagon', 'SUV', 'gasoline', 'automatic', 'https://images.unsplash.com/photo-1520031441872-26514dd97040?q=80&w=2670&auto=format&fit=crop'),
                ('Audi', 'RS6', 'Sports', 'gasoline', 'automatic', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=2670&auto=format&fit=crop'),
                ('Audi', 'Q7', 'SUV', 'diesel', 'automatic', 'https://images.unsplash.com/photo-1541348263662-e068662d82af?q=80&w=2544&auto=format&fit=crop'),
                ('Tesla', 'Model S', 'Electric', 'electric', 'automatic', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2671&auto=format&fit=crop'),
                ('Tesla', 'Model 3', 'Electric', 'electric', 'automatic', 'https://images.unsplash.com/photo-1536700503339-1e4b0652077e?q=80&w=2670&auto=format&fit=crop'),
                ('Toyota', 'Camry', 'Sedan', 'hybrid', 'automatic', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2670&auto=format&fit=crop'),
                ('Toyota', 'RAV4', 'SUV', 'hybrid', 'automatic', 'https://images.unsplash.com/photo-1510552776732-03e639e563c3?q=80&w=2670&auto=format&fit=crop'),
                ('Honda', 'Civic', 'Sedan', 'gasoline', 'automatic', 'https://images.unsplash.com/photo-1615831968846-5ec53696700e?q=80&w=2670&auto=format&fit=crop'),
                ('Honda', 'CR-V', 'SUV', 'gasoline', 'automatic', 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=2531&auto=format&fit=crop'),
                ('Ford', 'Mustang', 'Sports', 'gasoline', 'manual', 'https://images.unsplash.com/photo-1580273916550-e323be2ebcc3?q=80&w=2670&auto=format&fit=crop'),
                ('Ford', 'F-150', 'Truck', 'diesel', 'automatic', 'https://images.unsplash.com/photo-1550950153-61ce7b96122d?q=80&w=2670&auto=format&fit=crop'),
                ('Porsche', '911', 'Sports', 'gasoline', 'automatic', 'https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2670&auto=format&fit=crop'),
                ('Hyundai', 'Elantra', 'Sedan', 'gasoline', 'automatic', 'https://images.unsplash.com/photo-1629452097725-7b3b246a48f4?q=80&w=2669&auto=format&fit=crop'),
                ('Kia', 'Sportage', 'SUV', 'gasoline', 'automatic', 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2670&auto=format&fit=crop'),
                ('Kia', 'K5', 'Sedan', 'gasoline', 'automatic', 'https://images.unsplash.com/photo-1625232872322-2633ff8d3a0e?q=80&w=2670&auto=format&fit=crop')
        ) AS t(brand, model, type, fuel_type, transmission, image)
        ORDER BY random() * id -- Force re-evaluation per row
        LIMIT 1
    ) v;
