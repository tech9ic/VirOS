import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Paperclip, X, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Attachment } from '@shared/schema';

interface AttachmentUploaderProps {
  ticketId: number;
}

export default function AttachmentUploader({ ticketId }: AttachmentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload the file
      const res = await fetch(`/api/tickets/${ticketId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to upload attachment');
      }

      return await res.json() as Attachment;
    },
    onSuccess: () => {
      // Reset the file input
      setFile(null);
      // Invalidate the attachments query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tickets', ticketId, 'attachments'] });
      toast({
        title: 'File uploaded successfully',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleClearFile = () => {
    setFile(null);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Paperclip className="h-4 w-4" />
        <span className="text-sm font-medium">Attachments</span>
      </div>
      
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <label className="block">
              <span className="sr-only">Choose file</span>
              <input 
                type="file" 
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary/10 file:text-primary
                  hover:file:bg-primary/20
                  cursor-pointer"
                onChange={handleFileChange}
              />
            </label>
          </div>
          
          {file && (
            <div className="flex items-center justify-between p-2 rounded-md bg-primary/5">
              <div className="flex items-center gap-2">
                {file.type.startsWith('image/') ? (
                  <Image className="h-4 w-4" />
                ) : file.type.includes('pdf') || file.type.includes('word') ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <File className="h-4 w-4" />
                )}
                <span className="text-sm truncate max-w-[180px]">{file.name}</span>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={handleClearFile}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            disabled={!file || uploadMutation.isPending} 
            onClick={handleUpload}
            className="self-end"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </Card>
    </div>
  );
}