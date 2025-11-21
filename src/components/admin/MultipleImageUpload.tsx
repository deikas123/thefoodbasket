import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MultipleImageUploadProps {
  productId?: string;
  existingImages?: string[];
  onImagesChange?: (images: string[]) => void;
}

const MultipleImageUpload = ({ 
  productId, 
  existingImages = [],
  onImagesChange 
}: MultipleImageUploadProps) => {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${i}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);

        // If we have a product ID, save to product_images table
        if (productId) {
          const { error: dbError } = await supabase
            .from('product_images')
            .insert({
              product_id: productId,
              image_url: publicUrl
            });

          if (dbError) {
            console.error('Database error:', dbError);
          }
        }
      }

      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesChange?.(newImages);
      
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeImage = async (imageUrl: string, index: number) => {
    try {
      // Remove from database if product exists
      if (productId) {
        const { error } = await supabase
          .from('product_images')
          .delete()
          .eq('product_id', productId)
          .eq('image_url', imageUrl);

        if (error) {
          console.error('Error deleting from database:', error);
        }
      }

      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onImagesChange?.(newImages);
      
      toast.success('Image removed');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Additional Product Images</Label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="multiple-images"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('multiple-images')?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImagePlus className="mr-2 h-4 w-4" />
                Add Images
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors group"
            >
              <img
                src={imageUrl}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(imageUrl, index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <ImagePlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No additional images yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "Add Images" to upload multiple photos
          </p>
        </div>
      )}
    </div>
  );
};

export default MultipleImageUpload;
