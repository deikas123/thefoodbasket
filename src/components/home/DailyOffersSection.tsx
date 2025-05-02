
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { getDailyOffersWithProducts } from "@/services/product/offerService";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Tag } from "lucide-react";

const DailyOffersSection = () => {
  const { data: offers, isLoading, error } = useQuery({
    queryKey: ["dailyOffers", "home"],
    queryFn: getDailyOffersWithProducts,
  });

  if (error) {
    console.error("Error fetching daily offers:", error);
  }

  return (
    <section className="py-12 bg-gradient-to-r from-primary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            Limited Time
          </span>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-3xl md:text-4xl font-bold">Daily Offers</h2>
            <Tag className="h-7 w-7 text-primary" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Grab these special deals before they're gone! Our daily offers are refreshed regularly.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : offers && offers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {offers.slice(0, 4).map((offer) => (
                offer.product && (
                  <div key={offer.id} className="relative animate-fade-in">
                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full flex items-center">
                        <Clock className="mr-1 h-3 w-3" /> Ends {new Date(offer.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <ProductCard
                      product={{
                        ...offer.product,
                        discountPercentage: offer.discount_percentage,
                      }}
                      className="h-full"
                    />
                  </div>
                )
              ))}
            </div>
            
            {offers.length > 4 && (
              <div className="text-center mt-8">
                <Link to="/promotions">
                  <Button variant="outline" className="hover:bg-primary/5">
                    View All Offers
                  </Button>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">No daily offers available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DailyOffersSection;
