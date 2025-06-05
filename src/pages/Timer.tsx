
import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MealTimer from "@/components/MealTimer";

const Timer: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">Meal Timer</h1>
            <p className="text-muted-foreground text-center">
              Set timers for your cooking with preset options for common meals
            </p>
          </div>
          <MealTimer />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Timer;
