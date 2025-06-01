
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/layouts/AdminLayout";
import { getKYCVerificationsForAdmin, updateKYCVerification } from "@/services/adminService";
import { KYCVerification } from "@/types/kyc";

const PayLaterVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVerification, setCurrentVerification] = useState<KYCVerification | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    // Verify user is admin
    if (user?.role !== "admin") {
      navigate("/");
      return;
    }

    fetchVerifications();
  }, [user, navigate]);
  
  const fetchVerifications = async () => {
    setLoading(true);
    try {
      // This is a mock implementation since we don't have the real function yet
      const data = await getKYCVerificationsForAdmin();
      setVerifications(data);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch KYC verifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDialog = (verification: KYCVerification) => {
    setCurrentVerification(verification);
    setAdminNotes(verification.adminNotes || "");
    setDialogOpen(true);
  };
  
  const handleApprove = async () => {
    if (!currentVerification) return;
    
    try {
      await updateKYCVerification(currentVerification.id, {
        status: "approved",
        adminNotes
      });
      toast({
        title: "Success",
        description: "Verification approved successfully",
      });
      setDialogOpen(false);
      fetchVerifications();
    } catch (error) {
      console.error("Error approving verification:", error);
      toast({
        title: "Error",
        description: "Failed to approve verification",
        variant: "destructive",
      });
    }
  };
  
  const handleReject = async () => {
    if (!currentVerification) return;
    
    if (!adminNotes) {
      toast({
        title: "Error",
        description: "Admin notes are required when rejecting verification",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateKYCVerification(currentVerification.id, {
        status: "rejected",
        adminNotes
      });
      toast({
        title: "Success",
        description: "Verification rejected",
      });
      setDialogOpen(false);
      fetchVerifications();
    } catch (error) {
      console.error("Error rejecting verification:", error);
      toast({
        title: "Error",
        description: "Failed to reject verification",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Pay Later Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <p>Loading verifications...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No verifications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  verifications.map((verification) => (
                    <TableRow key={verification.id}>
                      <TableCell>{verification.userId}</TableCell>
                      <TableCell>{new Date(verification.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(verification.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {verification.idDocumentUrl && (
                            <a 
                              href={verification.idDocumentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              ID <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                          {verification.addressProofUrl && (
                            <a 
                              href={verification.addressProofUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              Address Proof <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          onClick={() => handleOpenDialog(verification)}
                          disabled={verification.status !== "pending"}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Verification</DialogTitle>
          </DialogHeader>
          
          {currentVerification && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">ID Document</h3>
                  {currentVerification.idDocumentUrl ? (
                    <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
                      <img 
                        src={currentVerification.idDocumentUrl} 
                        alt="ID Document"
                        className="object-contain w-full h-full"
                      />
                      <a 
                        href={currentVerification.idDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 bg-background/80 p-1 rounded-md"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No ID document provided</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Address Proof</h3>
                  {currentVerification.addressProofUrl ? (
                    <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
                      <img 
                        src={currentVerification.addressProofUrl} 
                        alt="Address Proof"
                        className="object-contain w-full h-full"
                      />
                      <a 
                        href={currentVerification.addressProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 bg-background/80 p-1 rounded-md"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No address proof provided</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Admin Notes</h3>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this verification (required for rejections)"
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!currentVerification}
              className="gap-1"
            >
              <X className="h-4 w-4" /> Reject
            </Button>
            <Button
              variant="default"
              onClick={handleApprove}
              disabled={!currentVerification}
              className="gap-1"
            >
              <Check className="h-4 w-4" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default PayLaterVerification;
