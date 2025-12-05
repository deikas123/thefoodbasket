import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gift, 
  Trophy, 
  Users, 
  Star, 
  ShoppingBag, 
  Share2, 
  Copy,
  TrendingUp,
  Award,
  Clock,
  AlertTriangle
} from "lucide-react";
import { formatDistanceToNow, differenceInDays, addDays } from "date-fns";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currencyFormatter";
import { SocialShare } from "@/components/ui/social-share";
import { useLoyaltySettings } from "@/hooks/useLoyaltySettings";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const LoyaltyRewards = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [referralCode, setReferralCode] = useState("");
  const { data: settings } = useLoyaltySettings();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
  
  // Calculate expiration warning
  const getExpirationInfo = () => {
    if (!profile || !settings || !settings.points_expiration_days || settings.points_expiration_days <= 0) {
      return null;
    }
    
    const lastActivity = profile.points_last_activity ? new Date(profile.points_last_activity) : new Date(profile.created_at);
    const expirationDate = addDays(lastActivity, settings.points_expiration_days);
    const daysUntilExpiration = differenceInDays(expirationDate, new Date());
    
    if (daysUntilExpiration <= 30 && profile.loyalty_points > 0) {
      return {
        daysLeft: Math.max(0, daysUntilExpiration),
        expirationDate
      };
    }
    return null;
  };
  
  const expirationInfo = getExpirationInfo();

  const { data: transactions } = useQuery({
    queryKey: ['loyalty-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: referrals } = useQuery({
    queryKey: ['referrals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');

      // Generate code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_referral_code');
      
      if (codeError) throw codeError;

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ referral_code: codeData })
        .eq('id', user.id);

      if (error) throw error;
      return codeData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success("Referral code generated!");
    }
  });

  const applyReferralMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!user) throw new Error('Must be logged in');

      // Find referrer
      const { data: referrerData, error: referrerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', code)
        .maybeSingle();

      if (referrerError) throw referrerError;
      if (!referrerData) throw new Error('Invalid referral code');
      if (referrerData.id === user.id) throw new Error('Cannot use your own referral code');

      // Update profile with referrer
      const { error } = await supabase
        .from('profiles')
        .update({ referred_by: referrerData.id })
        .eq('id', user.id);

      if (error) throw error;

      // Award bonus points to both users
      const bonusPoints = 100;
      
      await supabase.from('loyalty_transactions').insert([
        {
          user_id: user.id,
          points: bonusPoints,
          transaction_type: 'earned',
          source: 'referral',
          description: 'Welcome bonus for using referral code',
          referrer_user_id: referrerData.id
        },
        {
          user_id: referrerData.id,
          points: bonusPoints,
          transaction_type: 'earned',
          source: 'referral',
          description: 'Bonus for referring a new user',
          referrer_user_id: user.id
        }
      ]);

      // Update loyalty points
      await Promise.all([
        supabase.rpc('increment_loyalty_points', { user_id: user.id, points: bonusPoints }),
        supabase.rpc('increment_loyalty_points', { user_id: referrerData.id, points: bonusPoints })
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-transactions', user?.id] });
      toast.success("Referral code applied! You've earned bonus points!");
      setReferralCode("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to apply referral code");
    }
  });

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${profile?.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'purchase': return <ShoppingBag className="h-4 w-4" />;
      case 'review': return <Star className="h-4 w-4" />;
      case 'referral': return <Users className="h-4 w-4" />;
      case 'redemption': return <Gift className="h-4 w-4" />;
      case 'expiration': return <Clock className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const pointsValue = (profile?.loyalty_points || 0) * (settings?.ksh_per_point || 0.1);
  const signupBonus = settings?.referral_signup_bonus || 100;
  const purchaseBonus = settings?.referral_purchase_bonus || 200;

  return (
    <div className="space-y-6">
      {/* Expiration Warning */}
      {expirationInfo && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your {profile?.loyalty_points?.toLocaleString()} points will expire in {expirationInfo.daysLeft} days. 
            Make a purchase to keep your points active!
          </AlertDescription>
        </Alert>
      )}
      
      {/* Points Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Total Points</p>
              <p className="text-3xl font-bold">{profile?.loyalty_points || 0}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">
              Worth {formatCurrency(pointsValue)}
            </p>
            {(profile?.loyalty_points || 0) >= 1000 && (
              <SocialShare
                title="Loyalty Achievement Unlocked! 🎉"
                text={`I just earned ${profile?.loyalty_points} loyalty points! Join me and start earning rewards on every purchase.`}
                variant="ghost"
                size="sm"
              />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Points Earned</p>
              <p className="text-3xl font-bold">
                {transactions?.filter(t => t.transaction_type === 'earned').reduce((sum, t) => sum + t.points, 0) || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Referrals</p>
              <p className="text-3xl font-bold">{referrals?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="earn" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earn">Earn Points</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="earn" className="space-y-4">
          {/* Referral Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-lg">Refer Friends</h3>
            </div>

            {!profile?.referral_code ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate your unique referral code and earn 100 points for each friend who signs up!
                </p>
                <Button onClick={() => generateCodeMutation.mutate()}>
                  Generate Referral Code
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    value={profile.referral_code} 
                    readOnly 
                    className="font-mono text-lg"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={copyReferralLink}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <SocialShare
                    title="Join me and earn rewards! 🎁"
                    text={`Use my referral code ${profile.referral_code} to get started and we both earn ${signupBonus} loyalty points!`}
                    variant="outline"
                    size="icon"
                  />
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Earn <strong>{signupBonus} points</strong> when friends sign up</p>
                  <p>• Earn <strong>{purchaseBonus} bonus points</strong> when they make their first purchase!</p>
                </div>
              </div>
            )}
          </Card>

          {/* Apply Referral Code */}
          {!profile?.referred_by && (
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Have a Referral Code?</h3>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="font-mono"
                />
                <Button 
                  onClick={() => applyReferralMutation.mutate(referralCode)}
                  disabled={!referralCode || applyReferralMutation.isPending}
                >
                  Apply
                </Button>
              </div>
            </Card>
          )}

          {/* Ways to Earn */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Ways to Earn Points</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Make Purchases</p>
                  <p className="text-sm text-muted-foreground">Earn {settings?.points_per_ksh || 1} point for every KSH spent</p>
                </div>
                <Badge variant="secondary">Auto</Badge>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Write Reviews</p>
                  <p className="text-sm text-muted-foreground">Get 50 points per product review</p>
                </div>
                <Badge variant="secondary">+50</Badge>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Refer Friends</p>
                  <p className="text-sm text-muted-foreground">
                    Earn up to {signupBonus + purchaseBonus} points per referral
                  </p>
                </div>
                <Badge variant="secondary">+{signupBonus + purchaseBonus}</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <div className="p-6">
              <h3 className="font-bold text-lg mb-4">Points History</h3>
              
              {transactions && transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          transaction.transaction_type === 'earned' ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}>
                          {getSourceIcon(transaction.source)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={transaction.transaction_type === 'earned' ? 'default' : 'destructive'}>
                        {transaction.transaction_type === 'earned' ? '+' : '-'}{transaction.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No transactions yet</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <Card>
            <div className="p-6">
              <h3 className="font-bold text-lg mb-4">Your Referrals</h3>
              
              {referrals && referrals.length > 0 ? (
                <div className="space-y-3">
                  {referrals.map((referral: any) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Award className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Referral #{referral.referral_code}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                        {referral.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No referrals yet. Share your code to get started!
                </p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
