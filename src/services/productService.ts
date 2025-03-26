
import { Product, Category } from "@/types";

// Mock data for categories
const categories: Category[] = [
  {
    id: "cat1",
    name: "Fruits",
    image: "/placeholder.svg",
    productCount: 10
  },
  {
    id: "cat2",
    name: "Vegetables",
    image: "/placeholder.svg",
    productCount: 15
  },
  {
    id: "cat3",
    name: "Dairy",
    image: "/placeholder.svg",
    productCount: 8
  },
  {
    id: "cat4",
    name: "Meat",
    image: "/placeholder.svg",
    productCount: 6
  },
  {
    id: "cat5",
    name: "Bakery",
    image: "/placeholder.svg",
    productCount: 12
  },
  {
    id: "cat6",
    name: "Beverages",
    image: "/placeholder.svg",
    productCount: 9
  }
];

// Sample data for product filtering and searching
const products: Product[] = [
  {
    id: "p1",
    name: "Organic Apples",
    description: "Fresh organic apples grown locally without pesticides",
    price: 4.99,
    image: "/placeholder.svg",
    category: "cat1",
    featured: true,
    discountPercentage: 10,
    stock: 50
  },
  {
    id: "p2",
    name: "Red Onions",
    description: "Sweet red onions perfect for salads and cooking",
    price: 1.29,
    image: "/placeholder.svg",
    category: "cat2",
    stock: 100
  },
  {
    id: "p3",
    name: "Whole Milk",
    description: "Creamy whole milk from grass-fed cows",
    price: 3.49,
    image: "/placeholder.svg",
    category: "cat3",
    stock: 30
  },
  {
    id: "p4",
    name: "Ground Beef",
    description: "Premium ground beef, 85% lean",
    price: 6.99,
    image: "/placeholder.svg",
    category: "cat4",
    featured: true,
    stock: 25
  },
  {
    id: "p5",
    name: "Sourdough Bread",
    description: "Artisanal sourdough bread baked fresh daily",
    price: 4.50,
    image: "/placeholder.svg",
    category: "cat5",
    stock: 15
  },
  {
    id: "p6",
    name: "Orange Juice",
    description: "Freshly squeezed orange juice, no added sugar",
    price: 3.99,
    image: "/placeholder.svg",
    category: "cat6",
    discountPercentage: 5,
    stock: 40
  },
  {
    id: "p7",
    name: "Bananas",
    description: "Organic fair-trade bananas",
    price: 0.99,
    image: "/placeholder.svg",
    category: "cat1",
    stock: 75
  },
  {
    id: "p8",
    name: "Carrots",
    description: "Organic carrots, great for snacking and cooking",
    price: 1.49,
    image: "/placeholder.svg",
    category: "cat2",
    featured: true,
    stock: 60
  },
  {
    id: "p9",
    name: "Greek Yogurt",
    description: "Creamy Greek yogurt, high in protein",
    price: 5.49,
    image: "/placeholder.svg",
    category: "cat3",
    discountPercentage: 15,
    stock: 20
  },
  {
    id: "p10",
    name: "Chicken Breast",
    description: "Boneless, skinless chicken breasts from free-range chickens",
    price: 7.99,
    image: "/placeholder.svg",
    category: "cat4",
    stock: 30
  },
  {
    id: "p11",
    name: "Multi-grain Bread",
    description: "Hearty multi-grain bread with seeds and nuts",
    price: 3.99,
    image: "/placeholder.svg",
    category: "cat5",
    stock: 25
  },
  {
    id: "p12",
    name: "Cold Brew Coffee",
    description: "Smooth cold brew coffee concentrate",
    price: 4.99,
    image: "/placeholder.svg",
    category: "cat6",
    featured: true,
    stock: 15
  }
];

export const getCategories = (): Promise<Category[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(categories), 500);
  });
};

export const getProducts = async (
  categoryId?: string,
  search?: string,
  minPrice?: number,
  maxPrice?: number,
  inStock?: boolean
): Promise<Product[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredProducts = [...products];
  
  // Filter by category
  if (categoryId) {
    filteredProducts = filteredProducts.filter(product => product.category === categoryId);
  }
  
  // Filter by search term
  if (search && search.trim() !== '') {
    const searchTerm = search.toLowerCase().trim();
    filteredProducts = filteredProducts.filter(
      product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filter by price range
  if (minPrice !== undefined) {
    filteredProducts = filteredProducts.filter(product => product.price >= minPrice);
  }
  
  if (maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter(product => product.price <= maxPrice);
  }
  
  // Filter by stock
  if (inStock) {
    filteredProducts = filteredProducts.filter(product => product.stock > 0);
  }
  
  return filteredProducts;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const product = products.find(p => p.id === id) || null;
  return product;
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const category = categories.find(c => c.id === id) || null;
  return category;
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return products.filter(product => product.featured);
};

