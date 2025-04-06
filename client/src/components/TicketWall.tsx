import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import TicketCard from './TicketCard';
import * as RadixTabs from '@radix-ui/react-tabs';
import * as RadixSeparator from '@radix-ui/react-separator';
import * as RadixPopover from '@radix-ui/react-popover';
import { Ticket, Tag } from '@shared/schema';
import { SearchIcon, ArrowDownIcon, ArrowUpIcon, CheckCircle, CircleSlash, FilterIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

export default function TicketWall() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);

  // Fetch tickets and tags
  const { data: tickets, isLoading, error } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets'],
  });
  
  const { data: tags } = useQuery<Tag[]>({
    queryKey: ['/api/tags'],
  });
  
  // Track which tickets have which tags
  const [ticketTags, setTicketTags] = useState<Record<number, Tag[]>>({});
  
  // Fetch tags for each ticket
  useEffect(() => {
    if (!tickets) return;
    
    // For each ticket, fetch its tags if we don't already have them
    tickets.forEach(ticket => {
      if (!ticketTags[ticket.id]) {
        fetch(`/api/tickets/${ticket.id}/tags`)
          .then(res => res.json())
          .then(tags => {
            setTicketTags(prev => ({
              ...prev,
              [ticket.id]: tags
            }));
          })
          .catch(err => console.error(`Error fetching tags for ticket ${ticket.id}:`, err));
      }
    });
  }, [tickets, ticketTags]);
  
  // Toggle a tag filter
  const toggleTagFilter = (tagId: number) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  // Clear all tag filters
  const clearTagFilters = () => {
    setSelectedTagIds([]);
  };

  // Filter and sort tickets
  const filteredAndSortedTickets = tickets?.filter(ticket => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    // Apply tag filter
    const matchesTags = selectedTagIds.length === 0 || 
      (ticketTags[ticket.id] && 
        selectedTagIds.some(tagId => 
          ticketTags[ticket.id].some(tag => tag.id === tagId)
        )
      );
    
    return matchesSearch && matchesStatus && matchesTags;
  }).sort((a, b) => {
    // Apply sorting
    if (sortOption === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  // Stats
  const totalTickets = tickets?.length || 0;
  const solvedTickets = tickets?.filter(t => t.status === 'solved').length || 0;
  const unsolvedTickets = totalTickets - solvedTickets;

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Tabs for status filtering */}
      <RadixTabs.Root value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <RadixTabs.List className="flex gap-4 items-center border-b border-gray-100 w-full">
            <RadixTabs.Trigger 
              value="all" 
              className={cn(
                "pb-2 px-1 text-sm font-medium border-b-2 border-transparent transition-colors",
                statusFilter === 'all' ? "border-primary text-primary" : "text-gray-500 hover:text-gray-700"
              )}
            >
              All Tickets
              <span className="ml-1.5 text-xs font-normal text-gray-500">{totalTickets}</span>
            </RadixTabs.Trigger>
            
            <RadixTabs.Trigger 
              value="unsolved" 
              className={cn(
                "pb-2 px-1 text-sm font-medium border-b-2 border-transparent transition-colors",
                statusFilter === 'unsolved' ? "border-primary text-primary" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Unsolved
              <span className="ml-1.5 text-xs font-normal text-gray-500">{unsolvedTickets}</span>
            </RadixTabs.Trigger>
            
            <RadixTabs.Trigger 
              value="solved" 
              className={cn(
                "pb-2 px-1 text-sm font-medium border-b-2 border-transparent transition-colors",
                statusFilter === 'solved' ? "border-primary text-primary" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Solved
              <span className="ml-1.5 text-xs font-normal text-gray-500">{solvedTickets}</span>
            </RadixTabs.Trigger>
            
            <div className="flex-grow"></div>
            
            {/* Sort toggle */}
            <button 
              onClick={() => setSortOption(sortOption === 'newest' ? 'oldest' : 'newest')}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-xs pb-2"
            >
              {sortOption === 'newest' ? (
                <>
                  <ArrowDownIcon className="h-3.5 w-3.5" />
                  <span>Newest</span>
                </>
              ) : (
                <>
                  <ArrowUpIcon className="h-3.5 w-3.5" />
                  <span>Oldest</span>
                </>
              )}
            </button>
          </RadixTabs.List>
        </div>

        {/* Search and filter bar */}
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search tickets..."
              className="minimal-input w-full pl-8 py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          
          {/* Tag filter */}
          <RadixPopover.Root open={isTagFilterOpen} onOpenChange={setIsTagFilterOpen}>
            <RadixPopover.Trigger asChild>
              <button
                className={cn(
                  "p-2 rounded-sm border border-gray-100 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5",
                  selectedTagIds.length > 0 && "bg-primary/10 border-primary/20"
                )}
              >
                <FilterIcon className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-700">Filter by tag</span>
                {selectedTagIds.length > 0 && (
                  <Badge className="ml-1 bg-primary text-white">{selectedTagIds.length}</Badge>
                )}
              </button>
            </RadixPopover.Trigger>
            <RadixPopover.Portal>
              <RadixPopover.Content
                className="w-64 bg-white p-4 shadow-md border border-gray-100 rounded-sm z-50 animate-fade-in"
                sideOffset={5}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-sm">Filter by tags</h3>
                  {selectedTagIds.length > 0 && (
                    <button
                      onClick={clearTagFilters}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                {!tags || tags.length === 0 ? (
                  <p className="text-sm text-gray-500">No tags available</p>
                ) : (
                  <div className="space-y-2">
                    {tags.map(tag => (
                      <div key={tag.id} className="flex items-center">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTagIds.includes(tag.id)}
                            onChange={() => toggleTagFilter(tag.id)}
                            className="h-4 w-4 rounded-sm border-gray-300 text-primary focus:ring-primary"
                          />
                          <Badge
                            style={{
                              backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : 'transparent',
                              color: selectedTagIds.includes(tag.id) ? 'white' : tag.color,
                              borderColor: tag.color,
                            }}
                            className="border-2"
                            variant="outline"
                          >
                            {tag.name}
                          </Badge>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                
                <RadixPopover.Arrow className="fill-white" />
              </RadixPopover.Content>
            </RadixPopover.Portal>
          </RadixPopover.Root>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-primary border-r-2 border-b-2 border-gray-200"></div>
            <p className="mt-3 text-sm text-gray-500">Loading tickets...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <p className="text-accent font-medium">Error loading tickets.</p>
            <p className="text-sm text-gray-500 mt-2">Please try again later.</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredAndSortedTickets?.length === 0 && (
          <div className="text-center py-12 border border-dashed border-gray-200">
            <div className="text-4xl text-gray-300 mb-3">🎫</div>
            <h3 className="text-base font-medium text-gray-500">No tickets found</h3>
            <p className="text-sm text-gray-400">Be the first to create a ticket!</p>
          </div>
        )}

        {/* Ticket list */}
        {!isLoading && !error && filteredAndSortedTickets && filteredAndSortedTickets.length > 0 && (
          <div className="space-y-3 animate-fade-in">
            {filteredAndSortedTickets.map((ticket) => (
              <TicketCard 
                key={ticket.id}
                ticket={ticket}
                formattedTime={formatRelativeTime(new Date(ticket.createdAt))}
              />
            ))}
          </div>
        )}
      </RadixTabs.Root>
    </div>
  );
}
