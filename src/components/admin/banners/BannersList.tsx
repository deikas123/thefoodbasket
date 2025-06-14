
import { Image } from "lucide-react";
import BannerCard from "./BannerCard";

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

interface BannersListProps {
  banners: Banner[] | undefined;
  isLoading: boolean;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const BannersList = ({ banners, isLoading, onEdit, onDelete, isDeleting }: BannersListProps) => {
  if (isLoading) {
    return <div className="text-center py-10">Loading banners...</div>;
  }

  if (banners?.length === 0) {
    return (
      <div className="text-center py-10">
        <Image className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No banners</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new banner.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {banners?.map((banner) => (
        <BannerCard
          key={banner.id}
          banner={banner}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};

export default BannersList;
