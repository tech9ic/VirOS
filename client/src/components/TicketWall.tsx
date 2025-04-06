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
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-black mb-1">Forum Threads</h1>
        <p className="text-gray-500 text-sm">Browse and filter anonymous tickets</p>
      </div>
    
      {/* Tabs for status filtering */}
      <RadixTabs.Root value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
          <RadixTabs.List className="flex gap-2 items-center w-full mb-4">
            <RadixTabs.Trigger 
              value="all" 
              className={cn(
                "py-1.5 px-3 text-sm font-medium rounded-full transition-colors",
                statusFilter === 'all' 
                  ? "bg-black text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              All Threads
              <span className="ml-1.5 bg-white bg-opacity-20 px-1.5 py-0.5 rounded-full text-xs font-normal text-white">{totalTickets}</span>
            </RadixTabs.Trigger>
            
            <RadixTabs.Trigger 
              value="unsolved" 
              className={cn(
                "py-1.5 px-3 text-sm font-medium rounded-full transition-colors",
                statusFilter === 'unsolved' 
                  ? "bg-black text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Unsolved
              <span className="ml-1.5 bg-white bg-opacity-20 px-1.5 py-0.5 rounded-full text-xs font-normal text-white">{unsolvedTickets}</span>
            </RadixTabs.Trigger>
            
            <RadixTabs.Trigger 
              value="solved" 
              className={cn(
                "py-1.5 px-3 text-sm font-medium rounded-full transition-colors",
                statusFilter === 'solved' 
                  ? "bg-black text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Solved
              <span className="ml-1.5 bg-white bg-opacity-20 px-1.5 py-0.5 rounded-full text-xs font-normal text-white">{solvedTickets}</span>
            </RadixTabs.Trigger>
            
            <div className="flex-grow"></div>
            
            {/* Sort toggle */}
            <button 
              onClick={() => setSortOption(sortOption === 'newest' ? 'oldest' : 'newest')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full py-1.5 px-3 flex items-center gap-1 text-xs transition-colors"
            >
              {sortOption === 'newest' ? (
                <>
                  <ArrowDownIcon className="h-3.5 w-3.5" />
                  <span>Newest First</span>
                </>
              ) : (
                <>
                  <ArrowUpIcon className="h-3.5 w-3.5" />
                  <span>Oldest First</span>
                </>
              )}
            </button>
          </RadixTabs.List>

        {/* Search and filter bar */}
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search threads..."
              className="minimal-input w-full pl-8 py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          
          {/* Tag filter */}
          <RadixPopover.Root open={isTagFilterOpen} onOpenChange={setIsTagFilterOpen}>
            <RadixPopover.Trigger asChild>
              <button
                className={cn(
                  "px-3 py-2 rounded-md border border-gray-300 bg-[#f5f5f7] hover:bg-gray-200 transition-colors inline-flex items-center gap-1.5",
                  selectedTagIds.length > 0 && "bg-black bg-opacity-5 border-black border-opacity-20"
                )}
              >
                <FilterIcon className="h-4 w-4 text-black" />
                <span className="text-xs text-black">Filter by tag</span>
                {selectedTagIds.length > 0 && (
                  <Badge className="ml-1 bg-black text-white rounded-full">{selectedTagIds.length}</Badge>
                )}
              </button>
            </RadixPopover.Trigger>
            <RadixPopover.Portal>
              <RadixPopover.Content
                className="w-64 bg-white p-4 shadow-md border border-gray-200 rounded-lg z-50 animate-fade-in"
                sideOffset={5}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-sm text-black">Filter by tags</h3>
                  {selectedTagIds.length > 0 && (
                    <button
                      onClick={clearTagFilters}
                      className="text-xs text-gray-500 hover:text-black px-2 py-1 rounded-full hover:bg-gray-100"
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
                        <label className="flex items-center gap-2 text-sm cursor-pointer w-full py-1 px-1 hover:bg-gray-50 rounded-md">
                          <input
                            type="checkbox"
                            checked={selectedTagIds.includes(tag.id)}
                            onChange={() => toggleTagFilter(tag.id)}
                            className="h-4 w-4 rounded-md border-gray-300 text-black focus:ring-black"
                          />
                          <Badge
                            className={cn(
                              "rounded-full transition-colors",
                              selectedTagIds.includes(tag.id) 
                                ? "bg-black text-white" 
                                : "bg-gray-100 text-black"
                            )}
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
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-black border-t-transparent"></div>
            <p className="mt-3 text-sm text-gray-600">Loading threads...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100">
            <p className="text-red-600 font-medium">Error loading threads</p>
            <p className="text-sm text-red-500 mt-2">Please try again later</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredAndSortedTickets?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-base font-medium text-black mb-1">No threads found</h3>
            <p className="text-sm text-gray-500 mb-4">Start the conversation by creating a new thread</p>
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
        </div>
      </RadixTabs.Root>
    </div>
  );
}
