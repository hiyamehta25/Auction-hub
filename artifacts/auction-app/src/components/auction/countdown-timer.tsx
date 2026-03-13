import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  endTime: string;
  className?: string;
  onEnd?: () => void;
}

export function CountdownTimer({ endTime, className, onEnd }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const end = new Date(endTime);
    
    const updateTimer = () => {
      const seconds = differenceInSeconds(end, new Date());
      if (seconds <= 0) {
        setTimeLeft(0);
        if (!isEnded) {
          setIsEnded(true);
          onEnd?.();
        }
      } else {
        setTimeLeft(seconds);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endTime, isEnded, onEnd]);

  if (isEnded) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-muted-foreground border border-muted-foreground/20", className)}>
        Auction Ended
      </div>
    );
  }

  const days = Math.floor(timeLeft / (3600 * 24));
  const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isEndingSoon = timeLeft < 3600; // less than 1 hour

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border",
      isEndingSoon 
        ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse" 
        : "bg-primary/10 text-primary border-primary/20",
      className
    )}>
      <Clock className="w-3.5 h-3.5" />
      <span>
        {days > 0 && `${days}d `}
        {hours.toString().padStart(2, '0')}:
        {minutes.toString().padStart(2, '0')}:
        {seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
