import React, { useRef, useState } from "react";
import { usePostStore } from "@/store/postStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, type PostInput } from "@/schemas/postSchema";
import toast from "react-hot-toast";

const CreatePost: React.FC = () => {
  const { createPost } = usePostStore();
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      images: [],
    },
  });

  const handleImageChange = (files: FileList | null) => {
    if (!files) return;

    const validFiles: string[] = [];
    const fileArray: File[] = [];
    Array.from(files).forEach((file) => {
      // Validate type
      if (
        ![
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/webp",
          "image/avif",
        ].includes(file.type)
      ) {
        toast.error("Invalid file type: " + file.name);
        return;
      }
      // Validate size (max 5MB)
      if (file.size > 5_000_000) {
        toast.error("File too large: " + file.name);
        return;
      }
      validFiles.push(URL.createObjectURL(file));
      fileArray.push(file);
    });
    setPreviewImages(validFiles);
    setSelectedFiles(fileArray);
  };

  const removeImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PostInput) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);

      // Append selected files as images
      selectedFiles.forEach((file) => formData.append("images", file));

      await createPost(formData);

      toast.success("Post created successfully");
      reset();
      setPreviewImages([]);
      setSelectedFiles([]);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mt-10 mx-auto"
    >
      <Card className="bg-black border-gray-800 shadow-xl overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Create Post</h2>
            <span className="text-xs text-gray-500">
              Share with the community
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            encType="multipart/form-data"
          >
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Give your post a catchy title"
                {...register("title")}
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-gray-300">
                Content
              </Label>
              <Textarea
                id="content"
                placeholder="What's on your mind?"
                {...register("content")}
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 min-h-28"
              />
              {errors.content && (
                <p className="text-red-500 text-sm">{errors.content.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Images</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-dashed border-gray-700 bg-gray-900 text-gray-400 hover:text-white hover:border-gray-500 transition-colors cursor-pointer p-4 flex items-center justify-center gap-2"
              >
                <ImagePlus className="h-5 w-5" />
                <span>Click to upload images (PNG, JPG, WEBP, AVIF)</span>
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/avif"
                multiple
                onChange={(e) => handleImageChange(e.target.files)}
                className="hidden"
              />
              {errors.images && (
                <p className="text-red-500 text-sm">{errors.images.message}</p>
              )}

              <AnimatePresence>
                {previewImages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-3"
                  >
                    {previewImages.map((src, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative group"
                      >
                        <img
                          src={src}
                          alt={`preview-${i}`}
                          className="w-full h-24 object-cover rounded-md border border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-2 -right-2 bg-black/70 border border-gray-700 text-gray-300 hover:text-white hover:bg-black p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                          aria-label="Remove image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <CardFooter className="px-0 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Posting...
                  </span>
                ) : (
                  "Post"
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreatePost;
