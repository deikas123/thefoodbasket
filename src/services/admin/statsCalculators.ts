
export const calculateDateBasedStats = (orders: any[]) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const todaysOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= startOfToday;
  });

  const thisMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= startOfMonth;
  });

  const lastMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= startOfLastMonth && orderDate <= endOfLastMonth;
  });

  const pendingOrders = orders.filter(order => order.status === 'pending');

  return {
    todaysOrders,
    thisMonthOrders,
    lastMonthOrders,
    pendingOrders
  };
};

export const calculateRevenue = (todaysOrders: any[], thisMonthOrders: any[], lastMonthOrders: any[]) => {
  const revenueToday = todaysOrders.reduce((sum, order) => {
    const total = parseFloat(order.total) || 0;
    return sum + total;
  }, 0);

  const revenueThisMonth = thisMonthOrders.reduce((sum, order) => {
    const total = parseFloat(order.total) || 0;
    return sum + total;
  }, 0);

  const revenueLastMonth = lastMonthOrders.reduce((sum, order) => {
    const total = parseFloat(order.total) || 0;
    return sum + total;
  }, 0);

  return {
    revenueToday: Math.round(revenueToday),
    revenueThisMonth: Math.round(revenueThisMonth),
    revenueLastMonth: Math.round(revenueLastMonth)
  };
};

export const calculateCategorySales = (products: any[]) => {
  const categorySales: { [key: string]: number } = {};
  
  products.forEach(product => {
    const categoryName = product.categories?.name || 'Other';
    categorySales[categoryName] = (categorySales[categoryName] || 0) + 1;
  });

  const totalProducts = Object.values(categorySales).reduce((sum, count) => sum + count, 0);
  
  return Object.entries(categorySales).map(([name, count]) => ({
    name,
    value: totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0
  }));
};

export const calculateMonthlyRevenue = (orders: any[]) => {
  const now = new Date();
  const monthlyRevenue = [];
  
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= monthStart && orderDate <= monthEnd;
    });

    const monthRevenue = monthOrders.reduce((sum, order) => {
      const total = parseFloat(order.total) || 0;
      return sum + total;
    }, 0);
    
    monthlyRevenue.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
      value: monthRevenue
    });
  }
  
  return monthlyRevenue;
};

export const calculateOrderStatuses = (orders: any[]) => {
  const statusCounts: { [key: string]: number } = {};
  
  orders.forEach(order => {
    const status = order.status || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    count
  }));
};

export const calculateTopSellingProducts = (orders: any[]) => {
  const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
  
  orders.forEach(order => {
    try {
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach((item: any) => {
        const productId = item.productId || item.id;
        const name = item.name || 'Unknown Product';
        const quantity = parseInt(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        
        if (!productSales[productId]) {
          productSales[productId] = { name, quantity: 0, revenue: 0 };
        }
        productSales[productId].quantity += quantity;
        productSales[productId].revenue += price * quantity;
      });
    } catch (error) {
      console.error("Error processing order items:", error);
    }
  });

  return Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);
};
