import * as Checkbox from '@radix-ui/react-checkbox';
import * as Tooltip from '@radix-ui/react-tooltip';
import { CheckIcon, MessageCircle, Clock, User, Paperclip } from 'lucide-react';
import { Ticket, Tag } from '@shared/schema';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useState } from 'react';
import ProgressSelector from './ProgressSelector';
import PrioritySelector from './PrioritySelector';
import AttachmentList from './AttachmentList';

interface TicketCardProps {
  ticket: Ticket;
  formattedTime: string;
}

export default function TicketCard({ ticket, formattedTime }: TicketCardProps) {
  const { toast } = useToast();
  const [detailsOpen, setDetailsOpen] = useState(false);
  
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
        "ticket-card forum-thread",
        ticket.status === 'solved' ? "ticket-solved" : "ticket-unsolved"
      )}
    >
      <div className="p-5">
        {/* Forum-like header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-black text-base mb-1">{ticket.title}</h3>
            <div className="forum-author mb-2">
              <User className="h-3 w-3 mr-1" />
              <span>Anonymous</span>
              <span className="mx-1.5">•</span>
              <Clock className="h-3 w-3 mr-1" />
              <span>{formattedTime}</span>
              <span className="mx-1.5">•</span>
              <span className="capitalize">{ticket.category}</span>
            </div>
          </div>
          
          {/* Status toggle */}
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div>
                  <Checkbox.Root
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                      ticket.status === 'solved' 
                        ? "bg-black" 
                        : "border border-gray-300 bg-[#f5f5f7]"
                    )}
                    checked={ticket.status === 'solved'}
                    onCheckedChange={toggleStatus}
                    disabled={updateStatusMutation.isPending}
                  >
                    <Checkbox.Indicator>
                      <CheckIcon className="h-4 w-4 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content 
                  className="z-50 overflow-hidden rounded-md bg-black px-3 py-1.5 text-xs text-white animate-fade-in"
                  side="top"
                  sideOffset={5}
                >
                  Mark as {ticket.status === 'solved' ? 'unsolved' : 'solved'}
                  <Tooltip.Arrow className="fill-black" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        
        {/* Status badge */}
        <div className="mb-4">
          <Badge 
            className={cn(
              "apple-badge",
              ticket.status === 'solved' 
                ? "bg-black bg-opacity-10 text-black ring-black ring-opacity-20" 
                : "bg-gray-100 text-gray-500 ring-gray-200"
            )}
          >
            {ticket.status === 'solved' ? 'Solved' : 'Unsolved'}
          </Badge>
        </div>
        
        {/* Content */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <p className="text-gray-800 text-sm leading-relaxed">{ticket.description}</p>
        </div>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map(tag => (
              <Badge
                key={tag.id}
                className="text-xs font-medium bg-black text-white bg-opacity-80 py-0.5 px-2.5 rounded-full"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Ticket details collapsible */}
        <Collapsible 
          open={detailsOpen} 
          onOpenChange={setDetailsOpen}
          className="mt-4"
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex-1 flex items-center gap-2">
                <Paperclip className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-sm font-medium">Ticket Details & Attachments</span>
              </div>
              <div className="text-xs text-gray-500">
                {detailsOpen ? 'Hide' : 'Show'}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4 pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProgressSelector ticket={ticket} />
              <PrioritySelector ticket={ticket} />
            </div>
            
            <AttachmentList ticketId={ticket.id} />
          </CollapsibleContent>
        </Collapsible>
        
        {/* Forum-like footer */}
        <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center">
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
            <span>0 replies</span>
          </div>
          
          <div className="text-xs text-gray-400">
            Ticket #{ticket.id}
          </div>
        </div>
      </div>
    </div>
  );
}
