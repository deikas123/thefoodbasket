
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  start_date: string;
  end_date: string;
  active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

interface BannerCardProps {
  banner: Banner;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const BannerCard = ({ banner, onEdit, onDelete, isDeleting }: BannerCardProps) => {
  return (
    <Card key={banner.id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{banner.title}</CardTitle>
          <div className="flex items-center space-x-2">
            {banner.active ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Inactive
              </span>
            )}
          </div>
        </div>
        {banner.subtitle && (
          <CardDescription>{banner.subtitle}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-gray-100 rounded-md overflow-hidden mb-3">
          <img 
            src={banner.image} 
            alt={banner.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Priority:</span>
            <span>{banner.priority}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Start:</span>
            <span>{new Date(banner.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">End:</span>
            <span>{new Date(banner.end_date).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(banner)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(banner.id)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BannerCard;
