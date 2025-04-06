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
        <Loader2 className="h-5 w-5 animate-spin text-black" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 py-2">
        Failed to load tags: {error.message}
      </div>
    );
  }

  if (!tags || tags.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-2">
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
          className={cn(
            "cursor-pointer transition-colors rounded-full px-3 py-1",
            selectedTags.includes(tag.id) 
              ? "bg-black text-white" 
              : "bg-white text-black border border-gray-300"
          )}
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}