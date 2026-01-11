import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FlashSale, FlashSaleFormData } from "@/services/flashSaleService";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  discount_percentage: z.number().min(1).max(100),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  active: z.boolean(),
  banner_color: z.string().optional(),
});

interface FlashSaleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: FlashSale | null;
  onSubmit: (data: FlashSaleFormData) => void;
  isSubmitting: boolean;
}

const FlashSaleFormDialog = ({
  open,
  onOpenChange,
  sale,
  onSubmit,
  isSubmitting,
}: FlashSaleFormDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      discount_percentage: 20,
      start_date: "",
      end_date: "",
      active: true,
      banner_color: "#ef4444",
    },
  });

  useEffect(() => {
    if (sale) {
      form.reset({
        name: sale.name,
        description: sale.description || "",
        discount_percentage: sale.discount_percentage,
        start_date: sale.start_date.slice(0, 16),
        end_date: sale.end_date.slice(0, 16),
        active: sale.active,
        banner_color: sale.banner_color || "#ef4444",
      });
    } else {
      const now = new Date();
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      form.reset({
        name: "",
        description: "",
        discount_percentage: 20,
        start_date: now.toISOString().slice(0, 16),
        end_date: endDate.toISOString().slice(0, 16),
        active: true,
        banner_color: "#ef4444",
      });
    }
  }, [sale, form, open]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      name: values.name,
      description: values.description,
      discount_percentage: values.discount_percentage,
      active: values.active,
      banner_color: values.banner_color,
      start_date: new Date(values.start_date).toISOString(),
      end_date: new Date(values.end_date).toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{sale ? "Edit Flash Sale" : "Create Flash Sale"}</DialogTitle>
          <DialogDescription>
            {sale ? "Update the flash sale details" : "Create a new time-limited flash sale"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sale Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Weekend Flash Sale" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the flash sale..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discount_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={100}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="banner_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          className="w-12 h-10 p-1 cursor-pointer"
                          {...field}
                        />
                        <Input 
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="#ef4444"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>Active</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Enable this flash sale
                    </p>
                  </div>
                  <FormControl>
                    <Switch 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : sale ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FlashSaleFormDialog;
