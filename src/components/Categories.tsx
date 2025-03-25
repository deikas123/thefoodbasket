
import { categories } from "@/data/products";
import { Link } from "react-router-dom";

const Categories = () => {
  return (
    <section className="section-container">
      <div className="mb-12 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
          Browse Categories
        </span>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our wide range of product categories, from farm-fresh produce to artisanal delights.
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {categories.map((category) => (
          <Link 
            key={category.id}
            to={`/categories/${category.id}`}
            className="group relative flex flex-col items-center text-center animate-fade-in"
            style={{ animationDelay: `${parseInt(category.id.slice(1)) * 0.1}s` }}
          >
            <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 group-hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>
              <img 
                src={category.image} 
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="font-medium mb-1">{category.name}</h3>
            <p className="text-sm text-muted-foreground">{category.productCount} Products</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;
