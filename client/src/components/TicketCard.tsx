import * as Checkbox from '@radix-ui/react-checkbox';
import * as Tooltip from '@radix-ui/react-tooltip';
import { CheckIcon } from 'lucide-react';
import { Ticket, Tag } from '@shared/schema';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface TicketCardProps {
  ticket: Ticket;
  formattedTime: string;
}

export default function TicketCard({ ticket, formattedTime }: TicketCardProps) {
  const { toast } = useToast();
  
  // Fetch tags for this ticket
  const { data: tags, isLoading: isLoadingTags } = useQuery<Tag[]>({
    queryKey: ['/api/tickets', ticket.id, 'tags'],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${ticket.id}/tags`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket tags');
      }
      return response.json();
    },
  });
  
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
    <div 
      className={cn(
        "ticket-card",
        ticket.status === 'solved' ? "ticket-solved" : "ticket-unsolved"
      )}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3 gap-2">
          <h3 className="font-medium text-neutral-dark">{ticket.title}</h3>
          
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="relative top-1">
                  <Checkbox.Root
                    className={cn(
                      "flex h-5 w-5 items-center justify-center border transition-colors",
                      ticket.status === 'solved' 
                        ? "border-primary bg-primary/10" 
                        : "border-gray-300 bg-transparent"
                    )}
                    checked={ticket.status === 'solved'}
                    onCheckedChange={toggleStatus}
                    disabled={updateStatusMutation.isPending}
                  >
                    <Checkbox.Indicator>
                      <CheckIcon className="h-3.5 w-3.5 text-primary" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content 
                  className="z-50 overflow-hidden rounded-sm bg-slate-900 px-3 py-1.5 text-xs text-white animate-fade-in"
                  side="top"
                  sideOffset={5}
                >
                  Mark as {ticket.status === 'solved' ? 'unsolved' : 'solved'}
                  <Tooltip.Arrow className="fill-slate-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        
        <p className="text-gray-600 mb-3 text-sm">{ticket.description}</p>
        
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map(tag => (
              <Badge
                key={tag.id}
                style={{
                  backgroundColor: tag.color,
                  color: 'white',
                }}
                className="text-xs px-2 py-0.5"
                variant="outline"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span className="capitalize">{ticket.category}</span>
          <span>{formattedTime}</span>
        </div>
      </div>
    </div>
  );
}
