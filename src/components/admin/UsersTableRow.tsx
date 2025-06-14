
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { User } from "@/types/user";
import { getRoleBadgeVariant, formatRoleName, formatDate } from "@/utils/userUtils";

interface UsersTableRowProps {
  user: User;
  onViewUser: (userId: string) => void;
}

const UsersTableRow = ({ user, onViewUser }: UsersTableRowProps) => {
  return (
    <TableRow key={user.id}>
      <TableCell className="font-medium">
        {user.firstName} {user.lastName}
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Badge variant="outline" className={getRoleBadgeVariant(user.role)}>
          {formatRoleName(user.role)}
        </Badge>
      </TableCell>
      <TableCell>{formatDate(user.createdAt)}</TableCell>
      <TableCell>{user.loyaltyPoints}</TableCell>
      <TableCell className="text-right">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onViewUser(user.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default UsersTableRow;
