
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Gift, Star, Trophy, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const LoyaltyPoints = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState(1250);
  const [tier, setTier] = useState("Silver");
  const [pointsToNextTier, setPointsToNextTier] = useState(250);

  const rewards = [
    {
      id: 1,
      title: "Free Delivery",
      points: 100,
      description: "Get free delivery on your next order",
      icon: <Gift className="h-5 w-5" />
    },
    {
      id: 2,
      title: "10% Discount",
      points: 200,
      description: "10% off your next purchase",
      icon: <Star className="h-5 w-5" />
    },
    {
      id: 3,
      title: "Premium Support",
      points: 500,
      description: "Priority customer support for 1 month",
      icon: <Crown className="h-5 w-5" />
    },
    {
      id: 4,
      title: "Exclusive Products",
      points: 1000,
      description: "Access to premium product line",
      icon: <Trophy className="h-5 w-5" />
    }
  ];

  const history = [
    {
      id: 1,
      action: "Purchase Reward",
      points: 50,
      date: "2024-06-10",
      type: "earned"
    },
    {
      id: 2,
      action: "Redeemed Free Delivery",
      points: -100,
      date: "2024-06-08",
      type: "redeemed"
    },
    {
      id: 3,
      action: "Order Completed",
      points: 25,
      date: "2024-06-05",
      type: "earned"
    }
  ];

  const handleRedeem = (reward: typeof rewards[0]) => {
    if (points >= reward.points) {
      setPoints(prev => prev - reward.points);
      toast.success(`Successfully redeemed ${reward.title}!`);
    } else {
      toast.error("Insufficient points for this reward");
    }
  };

  const getTierProgress = () => {
    const tierThresholds = { Bronze: 0, Silver: 500, Gold: 1500, Platinum: 3000 };
    const currentThreshold = tierThresholds[tier as keyof typeof tierThresholds];
    const nextTierThreshold = currentThreshold + 1000;
    
    return ((points - currentThreshold) / (nextTierThreshold - currentThreshold)) * 100;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Loyalty Points</h1>
        <p className="text-gray-600">Earn points with every purchase and redeem amazing rewards</p>
      </div>

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-primary">{points}</CardTitle>
            <CardDescription>Available Points</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-xl">{tier}</CardTitle>
            </div>
            <CardDescription>Current Tier</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center mb-4">Next Tier Progress</CardTitle>
            <div className="space-y-2">
              <Progress value={getTierProgress()} className="h-2" />
              <CardDescription className="text-center">
                {pointsToNextTier} points to Gold tier
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="rewards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rewards">Available Rewards</TabsTrigger>
          <TabsTrigger value="history">Points History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {reward.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{reward.title}</CardTitle>
                        <CardDescription>{reward.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{reward.points} pts</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleRedeem(reward)}
                    disabled={points < reward.points}
                    className="w-full"
                  >
                    {points < reward.points ? 'Insufficient Points' : 'Redeem'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Points History</CardTitle>
              <CardDescription>Track your points earning and redemption history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{item.action}</p>
                        <p className="text-sm text-gray-500">{item.date}</p>
                      </div>
                    </div>
                    <Badge variant={item.type === 'earned' ? 'default' : 'destructive'}>
                      {item.type === 'earned' ? '+' : ''}{item.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoyaltyPoints;
