import { supabase } from '@/lib/supabase';

const carBrands = ['Toyota', 'BMW', 'Mercedes', 'Audi', 'Tesla', 'Ford', 'Honda', 'Nissan', 'Hyundai', 'Kia'];
const carTypes = ['Sedan', 'SUV', 'Luxury', 'Sports', 'Electric', 'Hybrid'];
const fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];
const transmissions = ['automatic', 'manual'];
const featuresList = ['GPS', 'Bluetooth', 'Heated Seats', 'Sunroof', 'Backup Camera', 'Apple CarPlay', 'Android Auto', 'Leather Seats', 'Adaptive Cruise Control', 'Lane Keep Assist'];

const carImages = [
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555215695-3004980adade?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541348263662-e068662d82af?q=80&w=2544&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580273916550-e323be2ebcc3?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=2531&auto=format&fit=crop'
];

const modelsByBrand: Record<string, string[]> = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'M4'],
    'Mercedes': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
    'Audi': ['A4', 'A6', 'Q5', 'Q7', 'e-tron'],
    'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X'],
    'Ford': ['Mustang', 'Explorer', 'F-150', 'Escape'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot'],
    'Nissan': ['Altima', 'Rogue', 'Sentra', 'Pathfinder'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe'],
    'Kia': ['Forte', 'K5', 'Sportage', 'Telluride']
};

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubset<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const seedCars = async (count: number = 100) => {
    const cars = [];

    for (let i = 0; i < count; i++) {
        const brand = getRandomElement(carBrands);
        const model = getRandomElement(modelsByBrand[brand] || ['Generic Model']);
        const type = getRandomElement(carTypes);
        const fuelType = getRandomElement(fuelTypes);
        const transmission = getRandomElement(transmissions);

        // Price in INR (approx 2000 to 15000 per day)
        const pricePerDay = getRandomInt(2000, 15000);

        const year = getRandomInt(2020, 2025);
        const seats = getRandomElement([2, 4, 5, 7]);
        const rating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);

        const images = getRandomSubset(carImages, getRandomInt(1, 3));
        const features = getRandomSubset(featuresList, getRandomInt(3, 8));

        cars.push({
            brand,
            model,
            year,
            price_per_day: pricePerDay, // Mapped to price_per_day in DB
            type: type.toLowerCase(), // Ensure lowercase as per schema/app logic often expects
            fuel_type: fuelType.toLowerCase(),
            transmission,
            seats,
            images,
            features,
            rating: parseFloat(rating),
            status: Math.random() > 0.8 ? 'rented' : 'available'
        });
    }

    const { error } = await supabase.from('cars').insert(cars);

    if (error) {
        console.error('Error seeding cars:', error);
        throw error;
    }

    return cars;
};
