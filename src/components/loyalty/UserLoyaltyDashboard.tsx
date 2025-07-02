
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Gift, History, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLoyaltySettings } from "@/hooks/useLoyaltySettings";
import LoyaltyPointsRedemption from "@/components/LoyaltyPointsRedemption";
import { formatCurrency } from "@/utils/currencyFormatter";

const UserLoyaltyDashboard = () => {
  const { user } = useAuth();
  const { data: settings } = useLoyaltySettings();
  
  // Mock data - in real app, this would come from user profile
  const userPoints = user?.loyalty_points || 0;
  const pointsToNextLevel = 500;
  const currentLevel = Math.floor(userPoints / 500);
  const levelNames = ["Bronze", "Silver", "Gold", "Platinum"];

  const handleRedemptionSuccess = () => {
    // Refresh user data
    console.log("Points redeemed successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loyalty Rewards</h1>
        <p className="text-muted-foreground">
          Earn points with every purchase and redeem them for rewards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPoints}</div>
            <p className="text-xs text-muted-foreground">
              Worth {formatCurrency(userPoints * (settings?.ksh_per_point || 1))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{levelNames[currentLevel] || "Bronze"}</div>
            <p className="text-xs text-muted-foreground">
              {pointsToNextLevel - (userPoints % 500)} points to next level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Rate</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings?.points_per_ksh || 1}</div>
            <p className="text-xs text-muted-foreground">
              Points per KSH spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemption Value</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(settings?.ksh_per_point || 1)}</div>
            <p className="text-xs text-muted-foreground">
              Per point redeemed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Points Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Current Level: {levelNames[currentLevel] || "Bronze"}</span>
                  <span>{userPoints % 500} / 500</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${((userPoints % 500) / 500) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {pointsToNextLevel - (userPoints % 500)} points needed for {levelNames[currentLevel + 1] || "Max Level"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Earn Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Every KSH spent</span>
                  <Badge variant="secondary">{settings?.points_per_ksh || 1} points</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Product review</span>
                  <Badge variant="secondary">20 points</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Refer a friend</span>
                  <Badge variant="secondary">100 points</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Birthday bonus</span>
                  <Badge variant="secondary">50 points</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <LoyaltyPointsRedemption
            availablePoints={userPoints}
            onRedemptionSuccess={handleRedemptionSuccess}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">Order #12345</p>
                    <p className="text-sm text-muted-foreground">June 15, 2024</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">+45 pts</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">Product Review</p>
                    <p className="text-sm text-muted-foreground">June 10, 2024</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">+20 pts</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">Points Redemption</p>
                    <p className="text-sm text-muted-foreground">June 5, 2024</p>
                  </div>
                  <Badge variant="outline" className="text-red-600">-100 pts</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserLoyaltyDashboard;
