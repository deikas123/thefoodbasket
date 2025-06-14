
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UsersSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const UsersSearch = ({ searchTerm, onSearchChange }: UsersSearchProps) => {
  return (
    <div className="relative flex-1 max-w-sm mb-4">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
};

export default UsersSearch;
