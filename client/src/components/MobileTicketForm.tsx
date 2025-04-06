import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertTicketSchema } from '@shared/schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import * as RadixSelect from '@radix-ui/react-select';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon, SendIcon, XIcon } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Extend the insert schema with validation rules
const ticketFormSchema = insertTicketSchema.extend({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  category: z.enum(['question', 'issue', 'suggestion', 'other']),
});

interface MobileTicketFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileTicketForm({ isOpen, onClose }: MobileTicketFormProps) {
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
      
      // Close modal
      onClose();
      
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
    <RadixDialog.Root open={isOpen} onOpenChange={onClose}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-fade-in" />
        <RadixDialog.Content 
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white p-0 shadow-md focus:outline-none data-[state=open]:animate-fade-in"
        >
          <div className="p-5">
            <div className="flex justify-between items-center mb-5">
              <RadixDialog.Title className="text-base font-medium text-neutral-dark">
                Create a Ticket
              </RadixDialog.Title>
              <RadixDialog.Close asChild>
                <button className="text-gray-400 hover:text-gray-500">
                  <XIcon className="h-4 w-4" />
                </button>
              </RadixDialog.Close>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-dark">Title</FormLabel>
                      <FormControl>
                        <input 
                          placeholder="What's your issue?" 
                          className="minimal-input w-full"
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
                          className="min-h-24 resize-none border-0 focus:ring-0 p-0 shadow-none text-sm"
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
                      <RadixSelect.Root value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <RadixSelect.Trigger className="inline-flex items-center justify-between minimal-select w-full text-sm">
                            <RadixSelect.Value placeholder="Select a category" />
                            <RadixSelect.Icon>
                              <ChevronDownIcon className="h-4 w-4 opacity-50" />
                            </RadixSelect.Icon>
                          </RadixSelect.Trigger>
                        </FormControl>
                        <RadixSelect.Portal>
                          <RadixSelect.Content 
                            position="popper" 
                            className="overflow-hidden bg-white rounded-sm shadow-md border border-gray-100 min-w-[8rem] animate-fade-in"
                          >
                            <RadixSelect.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
                              <ChevronUpIcon />
                            </RadixSelect.ScrollUpButton>
                            <RadixSelect.Viewport className="p-1">
                              <RadixSelect.Group>
                                {[
                                  { value: 'question', label: 'Question' },
                                  { value: 'issue', label: 'Issue' },
                                  { value: 'suggestion', label: 'Suggestion' },
                                  { value: 'other', label: 'Other' }
                                ].map((option) => (
                                  <RadixSelect.Item
                                    key={option.value}
                                    value={option.value}
                                    className={cn(
                                      "relative flex items-center px-6 py-2 text-sm rounded-sm select-none",
                                      "data-[highlighted]:outline-none data-[highlighted]:bg-gray-50 data-[state=checked]:font-medium"
                                    )}
                                  >
                                    <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                                  </RadixSelect.Item>
                                ))}
                              </RadixSelect.Group>
                            </RadixSelect.Viewport>
                            <RadixSelect.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
                              <ChevronDownIcon />
                            </RadixSelect.ScrollDownButton>
                          </RadixSelect.Content>
                        </RadixSelect.Portal>
                      </RadixSelect.Root>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="minimal-btn-primary w-full flex justify-center gap-2 mt-2"
                  disabled={createTicketMutation.isPending}
                >
                  {createTicketMutation.isPending ? 'Posting...' : (
                    <>
                      <SendIcon className="h-4 w-4" />
                      <span>Post Ticket</span>
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
