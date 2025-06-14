
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiple?: boolean;
  className?: string;
}

const ImageUploadField = ({ label, value, onChange, multiple = false, className }: ImageUploadFieldProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>(value ? [value] : []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert file to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewUrls([base64String]);
        onChange(base64String);
        setIsUploading(false);
        toast.success("Image uploaded successfully!");
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast.error("Failed to read image file");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsUploading(false);
      toast.error("Failed to upload image");
    }
  };

  const removeImage = () => {
    setPreviewUrls([]);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        multiple={multiple}
      />
      
      {/* Preview area */}
      {previewUrls.length > 0 ? (
        <div className="space-y-2">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative inline-block">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              {!isUploading && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={triggerFileInput}
        >
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">Click to upload an image</p>
          <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
        </div>
      )}
      
      {/* Upload/Change button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {previewUrls.length > 0 ? 'Change Image' : 'Upload Image'}
        </Button>
        
        {previewUrls.length > 0 && !isUploading && (
          <Button
            type="button"
            variant="destructive"
            onClick={removeImage}
          >
            Remove
          </Button>
        )}
      </div>
      
      {/* Hidden input for form validation */}
      <Input
        type="hidden"
        value={value}
        onChange={() => {}} // Controlled by the file upload
      />
    </div>
  );
};

export default ImageUploadField;
