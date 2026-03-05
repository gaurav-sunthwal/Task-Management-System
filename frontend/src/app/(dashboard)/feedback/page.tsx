"use client";

import { useState } from "react";
import { Star, Send, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function FeedbackPage() {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }
        if (!comment.trim()) {
            toast.error("Please enter a comment");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post("/feedback", { rating, comment });
            setRating(0);
            setComment("");
            toast.success("Thank you for your feedback!", {
                description: "We've received your comments and will review them shortly.",
            });
        } catch (error) {
            toast.error("Failed to submit feedback");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-slate-200 shadow-xl overflow-hidden">
                <div className="h-2 bg-blue-600 w-full" />
                <CardHeader className="text-center pt-8">
                    <div className="mx-auto bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl w-fit mb-6 ring-1 ring-blue-100 dark:ring-blue-800">
                        <MessageSquare className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Share Your Thoughts</CardTitle>
                    <CardDescription className="text-base mt-2">
                        We value your feedback. Let us know how we can make TaskFlow better for you.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 px-8">
                    <div className="space-y-4">
                        <div className="text-center">
                            <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">Overall Rating</span>
                        </div>
                        <div className="flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setRating(star)}
                                    className="p-1 transition-all duration-200 hover:scale-125 focus:outline-none"
                                >
                                    <Star
                                        className={cn(
                                            "h-10 w-10 transition-all duration-300",
                                            star <= (hoveredRating || rating)
                                                ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                                                : "text-slate-200 dark:text-slate-800"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-sm text-slate-500 h-4">
                            {rating === 1 && "Could be much better"}
                            {rating === 2 && "Needs some improvement"}
                            {rating === 3 && "It's okay, but room for more"}
                            {rating === 4 && "I like it! Great job"}
                            {rating === 5 && "Outstanding experience!"}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Your Comments</label>
                        <Textarea
                            placeholder="Tell us what you liked or what needs work. Be as detailed as you want..."
                            className="min-h-[160px] bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 text-base py-4"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="px-8 pb-10">
                    <Button
                        className="w-full h-12 text-lg font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01]"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Sending..." : "Submit My Feedback"}
                        <Send className="ml-3 h-5 w-5" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
