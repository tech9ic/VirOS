import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Flag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Ticket } from "@shared/schema";

interface PrioritySelectorProps {
  ticket: Ticket;
}

type PriorityValue = "low" | "medium" | "high" | "critical";

interface PriorityOption {
  value: PriorityValue;
  label: string;
  color: string;
}

export default function PrioritySelector({ ticket }: PrioritySelectorProps) {
  const [priority, setPriority] = useState<PriorityValue>(ticket.priority as PriorityValue || "medium");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const priorityOptions: PriorityOption[] = [
    {
      value: "low",
      label: "Low",
      color: "text-blue-500",
    },
    {
      value: "medium",
      label: "Medium",
      color: "text-green-500",
    },
    {
      value: "high",
      label: "High",
      color: "text-amber-500",
    },
    {
      value: "critical",
      label: "Critical",
      color: "text-red-500",
    },
  ];

  const updatePriorityMutation = useMutation({
    mutationFn: async (newPriority: PriorityValue) => {
      const res = await apiRequest("PATCH", `/api/tickets/${ticket.id}/priority`, {
        priority: newPriority,
      });
      return await res.json() as Ticket;
    },
    onSuccess: (updatedTicket) => {
      // Update cached ticket data
      queryClient.setQueryData(["/api/tickets", ticket.id], updatedTicket);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      
      toast({
        title: "Priority updated",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      // Revert to previous state
      setPriority(ticket.priority as PriorityValue || "medium");
      
      toast({
        title: "Failed to update priority",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePriorityChange = (value: string) => {
    const newPriority = value as PriorityValue;
    setPriority(newPriority);
    updatePriorityMutation.mutate(newPriority);
  };

  const getCurrentPriorityColor = () => {
    const option = priorityOptions.find(o => o.value === priority);
    return option?.color || "text-gray-500";
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Priority</div>
      <Select value={priority} onValueChange={handlePriorityChange} disabled={updatePriorityMutation.isPending}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select priority">
            <div className="flex items-center gap-2">
              <Flag className={`h-3 w-3 ${getCurrentPriorityColor()}`} />
              <span>{priorityOptions.find(o => o.value === priority)?.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <Flag className={`h-3 w-3 ${option.color}`} />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}