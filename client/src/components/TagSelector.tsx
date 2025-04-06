import { useQuery } from "@tanstack/react-query";
import { Tag } from "@shared/schema";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface TagSelectorProps {
  selectedTags: number[];
  onTagToggle: (tagId: number) => void;
}

export default function TagSelector({ selectedTags, onTagToggle }: TagSelectorProps) {
  const { data: tags, isLoading, error } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive py-2">
        Failed to load tags: {error.message}
      </div>
    );
  }

  if (!tags || tags.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No tags available
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 py-2">
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          onClick={() => onTagToggle(tag.id)}
          style={{
            backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
            color: selectedTags.includes(tag.id) ? 'white' : tag.color,
            borderColor: tag.color,
          }}
          className={cn(
            "cursor-pointer border-2 hover:bg-opacity-90 transition-colors",
            selectedTags.includes(tag.id) ? "" : "bg-transparent"
          )}
          variant="outline"
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}