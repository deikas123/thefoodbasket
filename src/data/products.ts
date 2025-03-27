
import { Product, Category } from "../types";

// Exchange rate: 1 USD = 130 KES
const exchangeRate = 130;

export const products: Product[] = [
  {
    id: "p1",
    name: "Organic Avocado",
    description: "Freshly harvested organic avocados, rich in healthy fats and perfect for salads and spreads.",
    price: 388.7, // 2.99 USD * 130 KES
    image: "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "fruits",
    featured: true,
    rating: 4.5,
    numReviews: 28,
    stock: 50
  },
  {
    id: "p2",
    name: "Fresh Strawberries",
    description: "Sweet and juicy strawberries, perfect for desserts or as a healthy snack.",
    price: 453.7, // 3.49 USD * 130 KES
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "fruits",
    featured: true,
    rating: 4.7,
    numReviews: 42,
    stock: 40
  },
  {
    id: "p3",
    name: "Organic Baby Spinach",
    description: "Fresh, tender leaves of organic baby spinach, perfect for salads and cooking.",
    price: 388.7, // 2.99 USD * 130 KES
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    featured: true,
    rating: 4.3,
    numReviews: 19,
    stock: 30
  },
  {
    id: "p4",
    name: "Free-Range Eggs",
    description: "Farm-fresh eggs from free-range chickens, rich in flavor and nutrition.",
    price: 648.7, // 4.99 USD * 130 KES
    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "dairy",
    featured: true,
    rating: 4.8,
    numReviews: 35,
    stock: 60
  },
  {
    id: "p5",
    name: "Whole Grain Bread",
    description: "Freshly baked whole grain bread, made with organic flour and natural ingredients.",
    price: 492.7, // 3.79 USD * 130 KES
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "bakery",
    featured: true,
    rating: 4.6,
    numReviews: 24,
    stock: 25
  },
  {
    id: "p6",
    name: "Organic Blueberries",
    description: "Plump, sweet organic blueberries, packed with antioxidants and flavor.",
    price: 648.7, // 4.99 USD * 130 KES
    image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "fruits",
    featured: false,
    rating: 4.4,
    numReviews: 32,
    stock: 35
  },
  {
    id: "p7",
    name: "Grass-Fed Ground Beef",
    description: "Premium ground beef from grass-fed cows, perfect for burgers and more.",
    price: 1168.7, // 8.99 USD * 130 KES
    image: "https://images.unsplash.com/photo-1588347618760-79099292ef0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "meat",
    featured: false,
    rating: 4.9,
    numReviews: 48,
    stock: 20
  },
  {
    id: "p8",
    name: "Organic Bell Peppers",
    description: "Colorful, crisp organic bell peppers, perfect for salads and cooking.",
    price: 258.7, // 1.99 USD * 130 KES
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    featured: false,
    rating: 4.2,
    numReviews: 15,
    stock: 45
  }
];

export const categories: Category[] = [
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
