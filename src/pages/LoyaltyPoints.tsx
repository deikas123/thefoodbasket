
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Gift, Trophy, Crown } from "lucide-react";

const LoyaltyPoints = () => {
  const currentPoints = 2450;
  const nextTierPoints = 3000;
  const pointsToNext = nextTierPoints - currentPoints;

  const rewards = [
    { id: 1, name: "$5 Off Next Order", points: 500, icon: Gift },
    { id: 2, name: "$10 Off Next Order", points: 1000, icon: Gift },
    { id: 3, name: "Free Delivery", points: 200, icon: Trophy },
    { id: 4, name: "$25 Off Next Order", points: 2500, icon: Crown },
  ];

  const recentActivity = [
    { date: "2024-01-15", action: "Order Purchase", points: "+150" },
    { date: "2024-01-10", action: "Product Review", points: "+25" },
    { date: "2024-01-05", action: "Redeemed Reward", points: "-500" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <Star className="mr-3 text-yellow-500" />
          Loyalty Points
        </h1>

        {/* Points Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 text-yellow-500" />
                Your Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {currentPoints.toLocaleString()}
              </div>
              <p className="text-gray-600">
                {pointsToNext} points to reach next tier
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(currentPoints / nextTierPoints) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Membership Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-lg px-3 py-1 mb-2">
                Gold Member
              </Badge>
              <p className="text-gray-600">
                Enjoy exclusive benefits and faster point earning
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Available Rewards */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Rewards</CardTitle>
            <CardDescription>
              Redeem your points for exclusive rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => {
                const Icon = reward.icon;
                const canRedeem = currentPoints >= reward.points;
                
                return (
                  <div 
                    key={reward.id} 
                    className={`p-4 border rounded-lg ${canRedeem ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Icon className={`mr-2 ${canRedeem ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="font-medium">{reward.name}</span>
                      </div>
                      <Badge variant={canRedeem ? "default" : "secondary"}>
                        {reward.points} pts
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      disabled={!canRedeem}
                      className="w-full"
                    >
                      {canRedeem ? 'Redeem' : 'Not enough points'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest point transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.date}</p>
                  </div>
                  <Badge 
                    variant={activity.points.startsWith('+') ? 'default' : 'destructive'}
                  >
                    {activity.points}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoyaltyPoints;
