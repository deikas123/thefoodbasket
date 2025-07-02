
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserLoyaltyDashboard from "@/components/loyalty/UserLoyaltyDashboard";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import { Link } from "react-router-dom";

const Loyalty = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle>Join Our Loyalty Program</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Sign in to earn points with every purchase and unlock exclusive rewards!
                  </p>
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/register">Create Account</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <UserLoyaltyDashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Loyalty;
