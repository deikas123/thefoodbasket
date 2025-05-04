
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Image, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getWebsiteSections, updateWebsiteSection, uploadSectionImage } from "@/services/contentService";
import { WebsiteSection } from "@/types/content";

const ContentManagementPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<WebsiteSection | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const queryClient = useQueryClient();
  
  const sectionsQuery = useQuery({
    queryKey: ['websiteSections'],
    queryFn: getWebsiteSections,
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WebsiteSection> }) => 
      updateWebsiteSection(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websiteSections'] });
      setIsDialogOpen(false);
      setActiveSection(null);
      setFile(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeSection) return;
    
    let imageUrl = activeSection.image;
    
    if (file) {
      const uploadPath = `sections/${activeSection.type}`;
      const uploadedUrl = await uploadSectionImage(file, uploadPath);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }
    
    const updates: Partial<WebsiteSection> = {
      ...activeSection,
      image: imageUrl,
    };
    
    updateSectionMutation.mutate({ 
      id: activeSection.id, 
      updates 
    });
  };

  const handleEdit = (section: WebsiteSection) => {
    setActiveSection(section);
    setIsDialogOpen(true);
  };

  const sectionTypeLabel = (type: WebsiteSection['type']) => {
    const labels: Record<WebsiteSection['type'], string> = {
      banner: 'Banner',
      hero: 'Hero Section',
      featured: 'Featured Products',
      deals: 'Deals Section',
      info: 'Information Section',
      category: 'Category Display',
      testimonial: 'Testimonials',
    };
    
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Content Management</h2>
          <p className="text-muted-foreground">
            Edit website sections and images
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Sections</TabsTrigger>
          <TabsTrigger value="banner">Banners</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="info">Info Sections</TabsTrigger>
        </TabsList>
        {['all', 'banner', 'hero', 'featured', 'info'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {sectionsQuery.isLoading ? (
              <div className="text-center py-10">Loading sections...</div>
            ) : sectionsQuery.data?.filter(s => tab === 'all' || s.type === tab).length === 0 ? (
              <div className="text-center py-10">No sections found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sectionsQuery.data
                  ?.filter(s => tab === 'all' || s.type === tab)
                  .map((section) => (
                    <Card key={section.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{section.name}</CardTitle>
                          <div>
                            {!section.active && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                        <CardDescription className="text-sm flex items-center">
                          <Settings className="h-3 w-3 mr-1" />
                          {sectionTypeLabel(section.type)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        {section.image && (
                          <div className="mb-2 border rounded overflow-hidden">
                            <img 
                              src={section.image} 
                              alt={section.name} 
                              className="w-full h-36 object-cover"
                            />
                          </div>
                        )}
                        <div className="text-sm">
                          <p className="font-medium">{section.title}</p>
                          {section.subtitle && <p className="text-muted-foreground">{section.subtitle}</p>}
                        </div>
                      </CardContent>
                      <CardFooter className="justify-between pt-0">
                        <Button 
                          className="w-full"
                          variant="outline"
                          onClick={() => handleEdit(section)}
                        >
                          <Edit className="h-4 w-4 mr-2" /> Edit Section
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {activeSection && (
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Edit {sectionTypeLabel(activeSection.type)}</DialogTitle>
                <DialogDescription>
                  Update content and settings for this section
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="section-title">Title</Label>
                  <Input
                    id="section-title"
                    value={activeSection.title}
                    onChange={(e) => setActiveSection({...activeSection, title: e.target.value})}
                    placeholder="Section title"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="section-subtitle">Subtitle</Label>
                  <Input
                    id="section-subtitle"
                    value={activeSection.subtitle || ''}
                    onChange={(e) => setActiveSection({...activeSection, subtitle: e.target.value})}
                    placeholder="Section subtitle"
                  />
                </div>
                
                {activeSection.content !== undefined && (
                  <div className="grid gap-2">
                    <Label htmlFor="section-content">Content</Label>
                    <Textarea
                      id="section-content"
                      value={activeSection.content || ''}
                      onChange={(e) => setActiveSection({...activeSection, content: e.target.value})}
                      placeholder="Section content"
                      rows={5}
                    />
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="section-image">Image</Label>
                  {activeSection.image && (
                    <div className="mb-2 border rounded overflow-hidden">
                      <img 
                        src={activeSection.image} 
                        alt={activeSection.name} 
                        className="w-full h-36 object-cover"
                      />
                    </div>
                  )}
                  <Input
                    id="section-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="section-active"
                    checked={activeSection.active}
                    onCheckedChange={(checked) => 
                      setActiveSection({...activeSection, active: checked})
                    }
                  />
                  <Label htmlFor="section-active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setActiveSection(null);
                    setFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentManagementPage;
