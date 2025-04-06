import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getQueryFn } from '@/lib/queryClient';
import { Ticket, Tag } from '@shared/schema';
import TicketCard from '@/components/TicketCard';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircleIcon, ClockIcon, CheckCircleIcon } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: userTickets, isLoading: isTicketsLoading } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets/user'],
    queryFn: getQueryFn({ on401: 'throw' }),
    enabled: !!user,
  });
  
  const { data: userTags, isLoading: isTagsLoading } = useQuery<Tag[]>({
    queryKey: ['/api/user/tags'],
    queryFn: getQueryFn({ on401: 'throw' }),
    enabled: !!user,
  });
  
  const formatRelativeTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  const ticketsByProgress = {
    not_started: userTickets?.filter(ticket => ticket.progress === 'not_started') || [],
    in_progress: userTickets?.filter(ticket => ticket.progress === 'in_progress') || [],
    solved: userTickets?.filter(ticket => ticket.progress === 'solved') || [],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertCircleIcon className="h-4 w-4 mr-2 text-yellow-500" />
                Not Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketsByProgress.not_started.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <ClockIcon className="h-4 w-4 mr-2 text-blue-500" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketsByProgress.in_progress.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                Solved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketsByProgress.solved.length}</div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="tickets">
          <TabsList>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="tags">My Tags</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tickets" className="space-y-4 mt-4">
            {isTicketsLoading ? (
              <div className="p-6 text-center">Loading tickets...</div>
            ) : userTickets?.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                You haven't created any tickets yet.
              </div>
            ) : (
              <div className="space-y-4">
                {userTickets?.map(ticket => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <TicketCard
                      ticket={ticket}
                      formattedTime={formatRelativeTime(ticket.createdAt)}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tags" className="mt-4">
            {isTagsLoading ? (
              <div className="p-6 text-center">Loading tags...</div>
            ) : userTags?.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                You haven't created any tags yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userTags?.map(tag => (
                  <div 
                    key={tag.id} 
                    className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="font-medium">{tag.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Created {formatRelativeTime(tag.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}