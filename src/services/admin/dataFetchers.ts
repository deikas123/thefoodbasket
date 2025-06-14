
import { supabase } from "@/integrations/supabase/client";

export const fetchOrdersData = async () => {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*');

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
    return [];
  }

  console.log("Orders fetched:", orders?.length || 0);
  return orders || [];
};

export const fetchProductsData = async () => {
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      id,
      name,
      price,
      category_id,
      categories!inner(name)
    `);

  if (productsError) {
    console.error('Error fetching products:', productsError);
    return [];
  }

  console.log("Products fetched:", products?.length || 0);
  return products || [];
};

export const fetchProfilesCount = async () => {
  const { count: profilesCount, error: profilesError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (profilesError) {
    console.error('Error fetching profiles count:', profilesError);
    return 0;
  }

  console.log("Profiles count:", profilesCount || 0);
  return profilesCount || 0;
};
