import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertTicketSchema } from '@shared/schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Extend the insert schema with validation rules
const ticketFormSchema = insertTicketSchema.extend({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  category: z.enum(['question', 'issue', 'suggestion', 'other']),
});

export default function TicketForm() {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof ticketFormSchema>>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'question',
      status: 'unsolved',
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: z.infer<typeof ticketFormSchema>) => {
      const response = await apiRequest('POST', '/api/tickets', data);
      return response.json();
    },
    onSuccess: () => {
      // Reset form
      form.reset();
      
      // Show success toast
      toast({
        title: 'Ticket Created',
        description: 'Your ticket has been posted successfully.',
        variant: 'default',
      });
      
      // Invalidate queries to refresh the ticket list
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create ticket',
        variant: 'destructive',
      });
    },
  });

  function onSubmit(data: z.infer<typeof ticketFormSchema>) {
    createTicketMutation.mutate(data);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
      <h2 className="text-xl font-semibold mb-4 text-neutral-dark">Create a Ticket</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-neutral-dark">Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="What's your issue?" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-neutral-dark">Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Provide details..." 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={4}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-neutral-dark">Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="issue">Issue</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition duration-200"
            disabled={createTicketMutation.isPending}
          >
            {createTicketMutation.isPending ? 'Posting...' : 'Post Ticket'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
