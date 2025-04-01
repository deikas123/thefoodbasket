
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Gift, CreditCard, Award, Copy, CheckCircle2 } from "lucide-react";

// Mock data for demonstration - would come from API in a real app
const promoCodesData = [
  { code: "WELCOME10", discount: "10% off your first order", expires: "December 31, 2023" },
  { code: "FRESH20", discount: "20% off fresh produce", expires: "July 31, 2023" },
  { code: "FREESHIP", discount: "Free shipping on orders over $50", expires: "August 31, 2023" },
];

const Promotions = () => {
  const { user } = useAuth();
  const [promoInput, setPromoInput] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Mock loyalty points - would come from API in a real app
  const loyaltyPoints = 450;
  const pointsToNextReward = 50;
  
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (promoInput.trim()) {
      // In a real app, you would validate the code against your backend
      const isValidCode = promoCodesData.some(promo => promo.code === promoInput.toUpperCase());
      
      if (isValidCode) {
        toast({
          title: "Promo code applied!",
          description: "The discount has been added to your account.",
        });
      } else {
        toast({
          title: "Invalid promo code",
          description: "Please check the code and try again.",
          variant: "destructive",
        });
      }
      
      setPromoInput("");
    }
  };
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    
    toast({
      title: "Code copied!",
      description: `${code} has been copied to clipboard.`,
    });
    
    setTimeout(() => {
      setCopiedCode(null);
    }, 3000);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Loyalty & Promotions</h1>
          
          <Tabs defaultValue="loyalty">
            <TabsList className="mb-6">
              <TabsTrigger value="loyalty">
                <Award className="mr-2 h-4 w-4" />
                Loyalty Points
              </TabsTrigger>
              <TabsTrigger value="promotions">
                <Gift className="mr-2 h-4 w-4" />
                Promotions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="loyalty">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle>Your Loyalty Points</CardTitle>
                    <CardDescription>
                      Earn points with every purchase and redeem them for discounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-4 rounded-full">
                        <Award className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{loyaltyPoints}</p>
                        <p className="text-sm text-muted-foreground">Available points</p>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="mb-2">
                        You're just {pointsToNextReward} points away from your next reward!
                      </p>
                      <div className="w-full bg-background rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${(loyaltyPoints / (loyaltyPoints + pointsToNextReward)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">How to earn points</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Earn 1 point for every $1 spent</li>
                        <li>Bonus 50 points on your birthday</li>
                        <li>100 points for referring a friend</li>
                        <li>20 points for writing a product review</li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full sm:w-auto">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Redeem Points
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Points History</CardTitle>
                    <CardDescription>
                      Your recent points activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium">Order #12345</p>
                        <p className="text-green-600 font-medium">+45 pts</p>
                      </div>
                      <p className="text-xs text-muted-foreground">June 10, 2023</p>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium">Product Review</p>
                        <p className="text-green-600 font-medium">+20 pts</p>
                      </div>
                      <p className="text-xs text-muted-foreground">June 5, 2023</p>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium">Order #12344</p>
                        <p className="text-green-600 font-medium">+32 pts</p>
                      </div>
                      <p className="text-xs text-muted-foreground">June 1, 2023</p>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium">Discount Redemption</p>
                        <p className="text-red-600 font-medium">-100 pts</p>
                      </div>
                      <p className="text-xs text-muted-foreground">May 15, 2023</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View All Activity
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="promotions">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Promotions</CardTitle>
                      <CardDescription>
                        Current discounts and special offers for you
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {promoCodesData.map((promo) => (
                        <div 
                          key={promo.code}
                          className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4"
                        >
                          <div>
                            <h3 className="font-medium text-lg mb-1">{promo.discount}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Expires: {promo.expires}
                            </p>
                            <div className="flex items-center bg-muted px-3 py-1.5 rounded w-fit">
                              <code className="font-mono text-sm font-bold">{promo.code}</code>
                              <button 
                                onClick={() => handleCopyCode(promo.code)}
                                className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {copiedCode === promo.code ? 
                                  <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                                  <Copy className="h-4 w-4" />
                                }
                              </button>
                            </div>
                          </div>
                          <Button>Apply to Cart</Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Redeem Loyalty Points</CardTitle>
                      <CardDescription>
                        Convert your points to discounts
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">$5 Discount</h3>
                          <p className="text-sm text-muted-foreground">100 points</p>
                        </div>
                        <Button>Redeem</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">$10 Discount</h3>
                          <p className="text-sm text-muted-foreground">200 points</p>
                        </div>
                        <Button>Redeem</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                        <div>
                          <h3 className="font-medium">$25 Discount</h3>
                          <p className="text-sm text-muted-foreground">500 points</p>
                        </div>
                        <Button disabled>Redeem</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Have a Promo Code?</CardTitle>
                      <CardDescription>
                        Enter it below to apply your discount
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleApplyPromo} className="space-y-4">
                        <Input
                          placeholder="Enter promo code"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="uppercase"
                        />
                        <Button type="submit" className="w-full">
                          Apply Code
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Promotions;
