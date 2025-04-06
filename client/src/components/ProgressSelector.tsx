import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Ticket } from "@shared/schema";

interface ProgressSelectorProps {
  ticket: Ticket;
}

type ProgressValue = "not_started" | "in_progress" | "solved";

interface ProgressOption {
  value: ProgressValue;
  label: string;
  icon: React.ReactNode;
}

export default function ProgressSelector({ ticket }: ProgressSelectorProps) {
  const [progress, setProgress] = useState<ProgressValue>(ticket.progress as ProgressValue || "not_started");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const progressOptions: ProgressOption[] = [
    {
      value: "not_started",
      label: "Not Started",
      icon: <Clock className="h-3 w-3" />,
    },
    {
      value: "in_progress",
      label: "In Progress",
      icon: <Play className="h-3 w-3" />,
    },
    {
      value: "solved",
      label: "Solved",
      icon: <CheckCircle className="h-3 w-3" />,
    }
  ];

  const updateProgressMutation = useMutation({
    mutationFn: async (newProgress: ProgressValue) => {
      const res = await apiRequest("PATCH", `/api/tickets/${ticket.id}/progress`, {
        progress: newProgress,
      });
      return await res.json() as Ticket;
    },
    onSuccess: (updatedTicket) => {
      // Update cached ticket data
      queryClient.setQueryData(["/api/tickets", ticket.id], updatedTicket);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", "progress"] });
      
      toast({
        title: "Progress updated",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      // Revert to previous state
      setProgress(ticket.progress as ProgressValue || "not_started");
      
      toast({
        title: "Failed to update progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProgressChange = (value: string) => {
    const newProgress = value as ProgressValue;
    setProgress(newProgress);
    updateProgressMutation.mutate(newProgress);
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Progress</div>
      <Tabs 
        value={progress} 
        onValueChange={handleProgressChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full">
          {progressOptions.map((option) => (
            <TabsTrigger 
              key={option.value} 
              value={option.value}
              disabled={updateProgressMutation.isPending}
              className="flex items-center gap-1 text-xs"
            >
              {option.icon}
              <span>{option.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}