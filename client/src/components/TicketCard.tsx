import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: Ticket;
  formattedTime: string;
}

export default function TicketCard({ ticket, formattedTime }: TicketCardProps) {
  const { toast } = useToast();
  
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await apiRequest('PATCH', `/api/tickets/${ticket.id}/status`, { status: newStatus });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      toast({
        title: 'Status Updated',
        description: `Ticket marked as ${ticket.status === 'solved' ? 'unsolved' : 'solved'}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    },
  });

  const toggleStatus = () => {
    const newStatus = ticket.status === 'solved' ? 'unsolved' : 'solved';
    updateStatusMutation.mutate(newStatus);
  };

  return (
    <Card 
      className={cn(
        "rounded-lg shadow-sm overflow-hidden border-l-4",
        ticket.status === 'solved' ? "border-primary" : "border-accent"
      )}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-neutral-dark">{ticket.title}</h3>
          <Badge 
            className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              ticket.status === 'solved' 
                ? "bg-primary/10 text-primary cursor-pointer"
                : "bg-accent/10 text-accent cursor-pointer"
            )}
            onClick={toggleStatus}
          >
            {ticket.status === 'solved' ? 'Solved' : 'Unsolved'}
          </Badge>
        </div>
        <p className="text-gray-600 mb-4 text-sm">{ticket.description}</p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{ticket.category}</span>
          <span>{formattedTime}</span>
        </div>
      </div>
    </Card>
  );
}
