
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ProductDetailsError = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-32 pb-16 px-4 flex items-center justify-center">
        <Card className="w-full max-w-lg text-center p-8">
          <CardContent className="pt-6 space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold">Product Not Found</h1>
            <p className="text-muted-foreground">
              We couldn't find the product you're looking for.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pt-6">
            <Button onClick={() => navigate("/shop")}>
              Continue Shopping
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailsError;
