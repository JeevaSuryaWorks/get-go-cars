import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface RatingDialogProps {
    bookingId: string;
    trigger: React.ReactNode;
    onRatingSubmit: () => void;
}

export function RatingDialog({ bookingId, trigger, onRatingSubmit }: RatingDialogProps) {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast({ title: "Validation Error", description: "Please select a star rating", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ rating, review })
                .eq('id', bookingId);

            if (error) throw error;

            toast({ title: "Thank you!", description: "Your rating has been submitted." });
            onRatingSubmit();
            setOpen(false);
        } catch (error) {
            console.error('Error submitting rating:', error);
            toast({ title: "Error", description: "Failed to submit rating", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rate your Experience</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-6 py-6">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={cn(
                                        "w-8 h-8",
                                        rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    <Textarea
                        placeholder="Share your feedback (optional)..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        className="w-full"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
