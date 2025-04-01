
export interface FoodBasket {
  id: string;
  name: string;
  description?: string;
  recipe: string;
  image?: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  items: FoodBasketItem[];
}

export interface FoodBasketItem {
  id: string;
  basketId: string;
  productId: string;
  quantity: number;
  createdAt: string;
}
