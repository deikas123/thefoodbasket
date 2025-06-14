
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import BannerFormDialog from "@/components/admin/banners/BannerFormDialog";
import BannersList from "@/components/admin/banners/BannersList";

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

const Banners = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
    start_date: "",
    end_date: "",
    active: true,
    priority: 1
  });

  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("priority", { ascending: true });
      
      if (error) throw error;
      return data as Banner[];
    }
  });

  const createBannerMutation = useMutation({
    mutationFn: async (bannerData: Omit<Banner, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from("banners")
        .insert([bannerData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner created successfully!");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create banner: " + error.message);
    }
  });

  const updateBannerMutation = useMutation({
    mutationFn: async ({ id, ...bannerData }: Partial<Banner> & { id: string }) => {
      const { data, error } = await supabase
        .from("banners")
        .update(bannerData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner updated successfully!");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update banner: " + error.message);
    }
  });

  const deleteBannerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete banner: " + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      image: "",
      link: "",
      start_date: "",
      end_date: "",
      active: true,
      priority: 1
    });
    setEditingBanner(null);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image: banner.image,
      link: banner.link || "",
      start_date: banner.start_date.split('T')[0],
      end_date: banner.end_date.split('T')[0],
      active: banner.active,
      priority: banner.priority
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.image || !formData.start_date || !formData.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const bannerData = {
      title: formData.title,
      subtitle: formData.subtitle || null,
      image: formData.image,
      link: formData.link || null,
      start_date: formData.start_date + 'T00:00:00Z',
      end_date: formData.end_date + 'T23:59:59Z',
      active: formData.active,
      priority: formData.priority
    };

    if (editingBanner) {
      updateBannerMutation.mutate({ id: editingBanner.id, ...bannerData });
    } else {
      createBannerMutation.mutate(bannerData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      deleteBannerMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Banners Management</h2>
          <p className="text-muted-foreground">
            Manage promotional banners and advertisements
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Banner
            </Button>
          </DialogTrigger>
          <BannerFormDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            editingBanner={editingBanner}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isCreating={createBannerMutation.isPending}
            isUpdating={updateBannerMutation.isPending}
          />
        </Dialog>
      </div>

      <BannersList
        banners={banners}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteBannerMutation.isPending}
      />
    </div>
  );
};

export default Banners;
