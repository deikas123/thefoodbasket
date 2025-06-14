
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CategoryImageUploadProps {
  value: string;
  onChange: (value: string) => void;
}

const CategoryImageUpload = ({ value, onChange }: CategoryImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, WebP)",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(fileName, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('category-images')
        .getPublicUrl(fileName);
        
      onChange(data.publicUrl);
      
      toast({
        title: "Upload successful",
        description: "Category image has been uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const clearImage = () => {
    onChange('');
  };
  
  return (
    <div className="space-y-4">
      <Label>Category Image</Label>
      
      {/* Upload method selector */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={uploadMethod === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMethod('url')}
        >
          URL
        </Button>
        <Button
          type="button"
          variant={uploadMethod === 'file' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMethod('file')}
        >
          Upload File
        </Button>
      </div>
      
      {uploadMethod === 'url' ? (
        <div>
          <Input
            placeholder="https://example.com/category-image.jpg"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            type="url"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter a direct URL to an image (JPG, PNG, WebP)
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-muted file:text-muted-foreground"
            />
            {isUploading && (
              <div className="text-sm text-muted-foreground">Uploading...</div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Upload an image from your computer (Max 5MB)
          </p>
        </div>
      )}
      
      {/* Image Preview */}
      {value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Preview:</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearImage}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden w-full h-32 bg-gray-100">
            <img
              src={value}
              alt="Category preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryImageUpload;
