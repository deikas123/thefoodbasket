import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Users, MapPin, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  referral_source: string | null;
  interests: string[] | null;
  product_types: string[] | null;
  shopping_frequency: string | null;
  preferred_delivery_time: string | null;
  grocery_challenges: string | null;
  value_proposition: string | null;
  wants_early_access: boolean | null;
  wants_beta_testing: boolean | null;
  created_at: string;
}

const Waitlist = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [referralFilter, setReferralFilter] = useState("all");
  const [interestFilter, setInterestFilter] = useState("all");

  const { data: waitlistData, isLoading } = useQuery({
    queryKey: ["admin-waitlist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WaitlistEntry[];
    },
  });

  const filteredData = waitlistData?.filter((entry) => {
    const matchesSearch = 
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = locationFilter === "all" || entry.location === locationFilter;
    const matchesReferral = referralFilter === "all" || entry.referral_source === referralFilter;
    const matchesInterest = interestFilter === "all" || entry.interests?.includes(interestFilter);

    return matchesSearch && matchesLocation && matchesReferral && matchesInterest;
  });

  const uniqueLocations = Array.from(new Set(waitlistData?.map(e => e.location).filter(Boolean)));
  const uniqueReferrals = Array.from(new Set(waitlistData?.map(e => e.referral_source).filter(Boolean)));
  const allInterests = Array.from(new Set(waitlistData?.flatMap(e => e.interests || []).filter(Boolean)));

  const analytics = {
    total: waitlistData?.length || 0,
    topLocation: uniqueLocations.length > 0 
      ? uniqueLocations.reduce((a, b) => 
          (waitlistData?.filter(e => e.location === a).length || 0) > 
          (waitlistData?.filter(e => e.location === b).length || 0) ? a : b
        ) 
      : "N/A",
    earlyAccess: waitlistData?.filter(e => e.wants_early_access).length || 0,
    betaTesters: waitlistData?.filter(e => e.wants_beta_testing).length || 0,
  };

  const exportToCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Name", "Email", "Phone", "Location", "Referral Source", 
      "Interests", "Product Types", "Shopping Frequency", 
      "Preferred Delivery Time", "Grocery Challenges", "Value Proposition",
      "Wants Early Access", "Wants Beta Testing", "Created At"
    ];

    const csvContent = [
      headers.join(","),
      ...filteredData.map(entry => [
        `"${entry.name}"`,
        `"${entry.email}"`,
        `"${entry.phone || ''}"`,
        `"${entry.location || ''}"`,
        `"${entry.referral_source || ''}"`,
        `"${entry.interests?.join("; ") || ''}"`,
        `"${entry.product_types?.join("; ") || ''}"`,
        `"${entry.shopping_frequency || ''}"`,
        `"${entry.preferred_delivery_time || ''}"`,
        `"${entry.grocery_challenges || ''}"`,
        `"${entry.value_proposition || ''}"`,
        entry.wants_early_access ? "Yes" : "No",
        entry.wants_beta_testing ? "Yes" : "No",
        `"${format(new Date(entry.created_at), "PPP")}"`,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Waitlist data exported successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Waitlist Management</h1>
        <Button onClick={exportToCSV} disabled={!filteredData || filteredData.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.topLocation}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Early Access</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.earlyAccess}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beta Testers</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.betaTesters}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Search name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((loc) => (
                  <SelectItem key={loc} value={loc as string}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={referralFilter} onValueChange={setReferralFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Referral Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Referral Sources</SelectItem>
                {uniqueReferrals.map((ref) => (
                  <SelectItem key={ref} value={ref as string}>{ref}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={interestFilter} onValueChange={setInterestFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Interests" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Interests</SelectItem>
                {allInterests.map((interest) => (
                  <SelectItem key={interest} value={interest}>{interest}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Entries ({filteredData?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Referral Source</TableHead>
                    <TableHead>Interests</TableHead>
                    <TableHead>Early Access</TableHead>
                    <TableHead>Beta Testing</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData && filteredData.length > 0 ? (
                    filteredData.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell>{entry.email}</TableCell>
                        <TableCell>{entry.phone || "-"}</TableCell>
                        <TableCell>{entry.location || "-"}</TableCell>
                        <TableCell>{entry.referral_source || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {entry.interests?.slice(0, 2).map((interest) => (
                              <Badge key={interest} variant="secondary" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                            {(entry.interests?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(entry.interests?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry.wants_early_access ? (
                            <Badge variant="default">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.wants_beta_testing ? (
                            <Badge variant="default">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>{format(new Date(entry.created_at), "PP")}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No waitlist entries found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Waitlist;
