
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { getKYCVerificationsForAdmin, updateKYCVerification } from "@/services/admin";
import { KYCVerification } from "@/types/kyc";

const PayLaterVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVerification, setCurrentVerification] = useState<KYCVerification | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  useEffect(() => {
    // Verify user is admin
    if (user?.role !== "admin") {
      navigate("/admin/login");
      return;
    }

    fetchVerifications();
  }, [user, navigate]);
  
  const fetchVerifications = async () => {
    setLoading(true);
    try {
      console.log('Fetching verifications...');
      const data = await getKYCVerificationsForAdmin();
      console.log('Verifications loaded:', data);
      setVerifications(data);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      toast.error("Failed to fetch KYC verifications");
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDialog = (verification: KYCVerification) => {
    console.log('Opening dialog for verification:', verification);
    setCurrentVerification(verification);
    setAdminNotes(verification.adminNotes || "");
    setDialogOpen(true);
  };
  
  const handleApprove = async () => {
    if (!currentVerification) return;
    
    setUpdating(true);
    try {
      console.log('Approving verification:', currentVerification.id);
      const success = await updateKYCVerification(currentVerification.id, {
        status: "approved",
        adminNotes
      });
      
      if (success) {
        toast.success("Verification approved successfully");
        setDialogOpen(false);
        fetchVerifications();
      } else {
        toast.error("Failed to approve verification");
      }
    } catch (error) {
      console.error("Error approving verification:", error);
      toast.error("Failed to approve verification");
    } finally {
      setUpdating(false);
    }
  };
  
  const handleReject = async () => {
    if (!currentVerification) return;
    
    if (!adminNotes.trim()) {
      toast.error("Admin notes are required when rejecting verification");
      return;
    }
    
    setUpdating(true);
    try {
      console.log('Rejecting verification:', currentVerification.id);
      const success = await updateKYCVerification(currentVerification.id, {
        status: "rejected",
        adminNotes
      });
      
      if (success) {
        toast.success("Verification rejected");
        setDialogOpen(false);
        fetchVerifications();
      } else {
        toast.error("Failed to reject verification");
      }
    } catch (error) {
      console.error("Error rejecting verification:", error);
      toast.error("Failed to reject verification");
    } finally {
      setUpdating(false);
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

  // Don't render if not admin
  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Pay Later Verifications</h1>
        <Button onClick={fetchVerifications} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>KYC Verifications ({verifications.length})</CardTitle>
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
                  <TableHead>User ID</TableHead>
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
                      <TableCell className="font-mono text-sm">
                        {verification.userId.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{new Date(verification.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(verification.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {verification.idDocumentUrl && (
                            <a 
                              href={verification.idDocumentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center text-sm"
                            >
                              ID <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                          {verification.addressProofUrl && (
                            <a 
                              href={verification.addressProofUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center text-sm"
                            >
                              Address <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenDialog(verification)}
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
            <DialogTitle>Review KYC Verification</DialogTitle>
          </DialogHeader>
          
          {currentVerification && (
            <div className="py-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  User ID: {currentVerification.userId}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Submitted: {new Date(currentVerification.createdAt).toLocaleString()}
                </p>
                <p className="text-sm mb-4">
                  Current Status: {getStatusBadge(currentVerification.status)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">ID Document</h3>
                  {currentVerification.idDocumentUrl ? (
                    <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
                      <img 
                        src={currentVerification.idDocumentUrl} 
                        alt="ID Document"
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-muted-foreground">Preview not available</div>';
                        }}
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
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-muted-foreground">Preview not available</div>';
                        }}
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
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={updating}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!currentVerification || updating || currentVerification.status !== "pending"}
              className="gap-1"
            >
              <X className="h-4 w-4" /> {updating ? "Rejecting..." : "Reject"}
            </Button>
            <Button
              variant="default"
              onClick={handleApprove}
              disabled={!currentVerification || updating || currentVerification.status !== "pending"}
              className="gap-1"
            >
              <Check className="h-4 w-4" /> {updating ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayLaterVerification;
