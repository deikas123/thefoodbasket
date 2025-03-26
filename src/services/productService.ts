
import { Product, Category } from "@/types";

// Rename functions to match the imports in Shop.tsx
export const getProducts = async (
  category?: string,
  search?: string,
  minPrice: number = 0,
  maxPrice: number = 100,
  inStockOnly: boolean = false
): Promise<Product[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get all products
  let filteredProducts = [...fruitProducts, ...vegetableProducts, ...dairyProducts];
  
  // Apply category filter
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      p.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Apply price filter
  filteredProducts = filteredProducts.filter(p => 
    p.price >= minPrice && p.price <= maxPrice
  );
  
  // Apply stock filter
  if (inStockOnly) {
    filteredProducts = filteredProducts.filter(p => p.stock > 0);
  }
  
  return filteredProducts;
};

// Renamed these functions to match the imports in Shop.tsx
export const getCategories = async (): Promise<Category[]> => {
  // Maintain the original implementation but rename the function
  return getAllCategories();
};

// Keep the original functions for backward compatibility
export const getAllProducts = async (): Promise<Product[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, you would fetch data from an API endpoint
  // For demo purposes, we're returning a static array of products
  return [...fruitProducts, ...vegetableProducts, ...dairyProducts];
};

// Simulate fetching a single product by ID from an API
export const getProductById = async (id: string): Promise<Product | undefined> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, you would fetch data from an API endpoint
  // For demo purposes, we're searching in our static arrays
  return [...fruitProducts, ...vegetableProducts, ...dairyProducts].find(product => product.id === id);
};

// Simulate fetching categories from an API
export const getAllCategories = async (): Promise<Category[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, you would fetch data from an API endpoint
  // For demo purposes, we're returning a static array of categories
  return categories;
};

// Simulate fetching a single category by ID from an API
export const getCategoryById = async (id: string): Promise<Category | undefined> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, you would fetch data from an API endpoint
  // For demo purposes, we're searching in our static array
  return categories.find(category => category.id === id);
};

// Sample product lists for different categories
const fruitProducts: Product[] = [
  {
    id: "fruit1",
    name: "Organic Bananas",
    description: "Sweet and fresh organic bananas, perfect for snacking or smoothies.",
    price: 1.99,
    image: "https://images.unsplash.com/photo-1528825871115-3581a5387919?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "fruits",
    featured: true,
    discountPercentage: 10,
    rating: 4.5,
    numReviews: 38,
    stock: 75
  },
  {
    id: "fruit2",
    name: "Red Apples",
    description: "Crisp and juicy red apples, rich in fiber and antioxidants.",
    price: 2.49,
    image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "fruits",
    featured: false,
    rating: 4.3,
    numReviews: 22,
    stock: 60
  },
  {
    id: "fruit3",
    name: "Seedless Grapes",
    description: "Sweet and juicy seedless grapes, perfect for snacking or fruit salads.",
    price: 3.99,
    image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "fruits",
    featured: false,
    rating: 4.4,
    numReviews: 28,
    stock: 45
  },
  {
    id: "fruit4",
    name: "Organic Oranges",
    description: "Juicy oranges rich in vitamin C, perfect for fresh juice or eating.",
    price: 4.49,
    image: "https://images.unsplash.com/photo-1611080626919-7cf5a9041525?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "fruits",
    featured: true,
    rating: 4.7,
    numReviews: 32,
    stock: 40
  }
];

const vegetableProducts: Product[] = [
  {
    id: "veg1",
    name: "Roma Tomatoes",
    description: "Firm and flavorful tomatoes, perfect for sauces and salads.",
    price: 2.99,
    image: "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    featured: false,
    rating: 4.2,
    numReviews: 18,
    stock: 65
  },
  {
    id: "veg2",
    name: "Fresh Broccoli",
    description: "Crisp, nutritious broccoli, rich in vitamins and fiber.",
    price: 1.79,
    image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    featured: false,
    discountPercentage: 15,
    rating: 4.0,
    numReviews: 14,
    stock: 50
  },
  {
    id: "veg3",
    name: "Organic Carrots",
    description: "Sweet and crunchy organic carrots, perfect for snacking or cooking.",
    price: 2.29,
    image: "https://images.unsplash.com/photo-1550082661-204545af28ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    featured: false,
    rating: 4.3,
    numReviews: 21,
    stock: 70
  },
  {
    id: "veg4",
    name: "Red Onions",
    description: "Flavorful red onions, perfect for salads, grilling, or cooking.",
    price: 1.49,
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    featured: true,
    rating: 4.1,
    numReviews: 16,
    stock: 85
  }
];

const dairyProducts: Product[] = [
  {
    id: "dairy1",
    name: "Organic Whole Milk",
    description: "Fresh organic whole milk from grass-fed cows.",
    price: 3.99,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "dairy",
    featured: false,
    discountPercentage: 5,
    rating: 4.8,
    numReviews: 42,
    stock: 30
  },
  {
    id: "dairy2",
    name: "Cheddar Cheese",
    description: "Aged cheddar cheese with rich flavor, perfect for sandwiches and snacking.",
    price: 4.49,
    image: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "dairy",
    featured: false,
    rating: 4.6,
    numReviews: 37,
    stock: 25
  },
  {
    id: "dairy3",
    name: "Greek Yogurt",
    description: "Creamy Greek yogurt, high in protein and perfect for breakfast or snacks.",
    price: 3.29,
    image: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "dairy",
    featured: false,
    rating: 4.4,
    numReviews: 29,
    stock: 35
  }
];

export const categories = [
  {
    id: "c1",
    name: "Fruits",
    image: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    productCount: 24
  },
  {
    id: "c2",
    name: "Vegetables",
    image: "https://images.unsplash.com/photo-1557844352-761f2023520d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    productCount: 36
  },
  {
    id: "c3",
    name: "Dairy",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    productCount: 18
  },
  {
    id: "c4",
    name: "Bakery",
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    productCount: 15
  },
  {
    id: "c5",
    name: "Meat",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    productCount: 22
  },
  {
    id: "c6",
    name: "Seafood",
    image: "https://images.unsplash.com/photo-1565280654386-466baaf954ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    productCount: 16
  }
];

// A function to filter products by availability
export const getAvailableProducts = () => {
  return [...fruitProducts, ...vegetableProducts, ...dairyProducts].filter(product => product.stock > 0);
};
