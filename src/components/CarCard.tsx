import { Car } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Users, Fuel, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CarCardProps {
  car: Car;
  className?: string;
}

export function CarCard({ car, className }: CarCardProps) {
  const statusColors = {
    available: 'bg-success/10 text-success border-success/20',
    rented: 'bg-warning/10 text-warning border-warning/20',
    maintenance: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <Card className={cn(
      "group overflow-hidden border-border/50 bg-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1",
      className
    )}>
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={car.images[0]}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <Badge
          variant="outline"
          className={cn("absolute top-3 right-3 capitalize", statusColors[car.status])}
        >
          {car.status}
        </Badge>
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-background/90 backdrop-blur">
          <Star className="h-4 w-4 fill-secondary text-secondary" />
          <span className="text-sm font-medium">{car.rating}</span>
        </div>
      </div>
      <CardContent className="p-4 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">{car.brand}</p>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{car.model}</h3>
            {car.registrationNumber && (
              <Badge variant="outline" className="font-mono text-[10px] h-5">
                {car.registrationNumber}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span>{car.seats}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Fuel className="h-4 w-4" />
          <span className="capitalize">{car.fuelType}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Gauge className="h-4 w-4" />
          <span className="capitalize">{car.transmission}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div>
          <span className="text-2xl font-bold">₹{car.pricePerDay}</span>
          <span className="text-sm text-muted-foreground">/day</span>
        </div>
        <Button variant="secondary" size="sm" asChild disabled={car.status !== 'available'}>
          <Link to={`/cars/${car.id}`}>
            {car.status === 'available' ? 'Book Now' : 'View Details'}
          </Link>
        </Button>
      </div>
    </CardContent>
    </Card >
  );
}
