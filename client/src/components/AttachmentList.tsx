import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { File, FileText, Image, Download, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Attachment } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

interface AttachmentListProps {
  ticketId: number;
}

export default function AttachmentList({ ticketId }: AttachmentListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: attachments, isLoading, error } = useQuery<Attachment[]>({
    queryKey: ['/api/tickets', ticketId, 'attachments'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/tickets/${ticketId}/attachments`);
      return await res.json();
    }
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      const res = await apiRequest('DELETE', `/api/attachments/${attachmentId}`);
      if (!res.ok) {
        throw new Error('Failed to delete attachment');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets', ticketId, 'attachments'] });
      toast({
        title: 'Attachment deleted',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (fileType.includes('pdf') || fileType.includes('word')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  const handleDeleteAttachment = (attachmentId: number) => {
    if (confirm('Are you sure you want to delete this attachment?')) {
      deleteAttachmentMutation.mutate(attachmentId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm p-2">
        Error loading attachments
      </div>
    );
  }

  if (!attachments || attachments.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic p-2">
        No attachments yet
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      {attachments.map((attachment) => (
        <Card key={attachment.id} className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              {getFileIcon(attachment.fileType)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[180px]">
                {attachment.fileName}
              </span>
              <div className="flex gap-2 text-xs text-gray-500">
                <span>{formatFileSize(attachment.fileSize)}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(attachment.uploadedAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" download>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </a>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
              onClick={() => handleDeleteAttachment(attachment.id)}
              disabled={deleteAttachmentMutation.isPending}
            >
              {deleteAttachmentMutation.isPending && deleteAttachmentMutation.variables === attachment.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}