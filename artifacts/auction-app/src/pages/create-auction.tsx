import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateAuction, useUploadAuctionImage } from "@workspace/api-client-react";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/layout/navbar";
import { ImagePlus, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const createAuctionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide a detailed description (min 20 chars)"),
  startingPrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
  category: z.string().min(1, "Please select a category"),
  endTime: z.string().min(1, "Please select an end time"),
});

type CreateAuctionForm = z.infer<typeof createAuctionSchema>;

const CATEGORIES = ["Electronics", "Art", "Jewelry", "Vehicles", "Fashion", "Sports", "Collectibles", "Other"];

export default function CreateAuction() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { mutateAsync: createAuction, isPending: isCreating } = useCreateAuction();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadAuctionImage();

  const { register, handleSubmit, formState: { errors } } = useForm<CreateAuctionForm>({
    resolver: zodResolver(createAuctionSchema),
    defaultValues: {
      category: "Electronics",
      // Set default end time to 7 days from now
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    }
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CreateAuctionForm) => {
    // Step 1: Create the auction
    let newAuction;
    try {
      newAuction = await createAuction({
        data: {
          ...data,
          endTime: new Date(data.endTime).toISOString()
        }
      });
    } catch (err: any) {
      const message = err?.data?.error || err?.message || "An unexpected error occurred.";
      toast({
        title: "Failed to create auction",
        description: message,
        variant: "destructive",
      });
      return;
    }

    // Step 2: Upload image separately — auction is already saved even if this fails
    if (imageFile) {
      try {
        await uploadImage({
          id: newAuction.id,
          data: { image: imageFile }
        });
      } catch (err: any) {
        const message = err?.data?.error || err?.message || "Image upload failed.";
        toast({
          title: "Auction created, but image upload failed",
          description: message + " You can add an image later.",
          variant: "destructive",
        });
        setLocation(`/auctions/${newAuction.id}`);
        return;
      }
    }

    toast({
      title: "Auction Created!",
      description: "Your item is now live for bidding.",
      variant: "default",
    });

    setLocation(`/auctions/${newAuction.id}`);
  };

  const isPending = isCreating || isUploading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold mb-2">Sell an Item</h1>
            <p className="text-muted-foreground text-lg">List your item and let the bidding war begin.</p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Image Upload Area */}
              <div className="space-y-2">
                <Label>Item Image</Label>
                <div className="mt-2 flex justify-center rounded-2xl border-2 border-dashed border-border px-6 py-10 hover:bg-muted/50 transition-colors relative overflow-hidden group cursor-pointer">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-semibold flex items-center gap-2">
                          <ImagePlus className="w-5 h-5" /> Change Image
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
                      <div className="mt-4 flex text-sm leading-6 text-muted-foreground justify-center">
                        <span className="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary focus-within:outline-none hover:text-primary/80">
                          <span>Upload a file</span>
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="e.g. Vintage 1980s Rolex Submariner" {...register("title")} />
                  {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Provide condition, history, and details..." 
                    {...register("description")} 
                    className="h-32"
                  />
                  {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startingPrice">Starting Price ($)</Label>
                  <Input id="startingPrice" type="number" step="0.01" placeholder="0.00" {...register("startingPrice")} />
                  {errors.startingPrice && <p className="text-destructive text-sm">{errors.startingPrice.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select 
                    id="category"
                    className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all"
                    {...register("category")}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-destructive text-sm">{errors.category.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" type="datetime-local" {...register("endTime")} />
                  {errors.endTime && <p className="text-destructive text-sm">{errors.endTime.message}</p>}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button type="submit" size="lg" disabled={isPending} className="w-full md:w-auto min-w-[200px]">
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish Auction <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
          
        </div>
      </main>
    </div>
  );
}
