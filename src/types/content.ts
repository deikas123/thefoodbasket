
export interface WebsiteSection {
  id: string;
  name: string;
  title: string;
  subtitle?: string;
  content?: string;
  image?: string;
  active: boolean;
  position: number;
  type: 'banner' | 'hero' | 'featured' | 'deals' | 'info' | 'category' | 'testimonial';
  settings?: Record<string, any>;
  updatedAt: string;
}
