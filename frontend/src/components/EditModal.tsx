// components/SimpleModal.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, Calendar } from "lucide-react";

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimpleModal = ({ isOpen, onClose }: SimpleModalProps) => {
  const [experiences, setExperiences] = useState([
    { id: 1, title: "", company: "", description: "", from: "", to: "" }
  ]);

  const addExperience = () => {
    setExperiences(prev => [...prev, { 
      id: Date.now(), 
      title: "", 
      company: "", 
      description: "", 
      from: "", 
      to: "" 
    }]);
  };

  const removeExperience = (id: number) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-black border border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                
                <div className="space-y-3">
                  <Label htmlFor="about" className="text-sm font-medium text-white">About</Label>
                  <Textarea 
                    id="about"
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px] resize-none bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="linkedin" className="text-sm font-medium text-white">LinkedIn</Label>
                    <Input 
                      id="linkedin"
                      placeholder="https://linkedin.com/in/username"
                      type="url"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="github" className="text-sm font-medium text-white">GitHub</Label>
                    <Input 
                      id="github"
                      placeholder="https://github.com/username"
                      type="url"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="website" className="text-sm font-medium text-white">Website</Label>
                  <Input 
                    id="website"
                    placeholder="https://yourwebsite.com"
                    type="url"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                  />
                </div>
              </div>

              {/* Experience Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Work Experience</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExperience}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Experience
                  </Button>
                </div>

                <div className="space-y-4">
                  {experiences.map((exp, index) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="relative"
                    >
                      <Card className="border-2 border-dashed border-zinc-700 hover:border-zinc-600 transition-colors bg-zinc-800/50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <Badge variant="secondary" className="bg-blue-900/30 text-blue-300 border-blue-700">
                              Experience {index + 1}
                            </Badge>
                            {experiences.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeExperience(exp.id)}
                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <Label htmlFor={`title-${exp.id}`} className="text-sm font-medium text-white">Job Title</Label>
                                <Input 
                                  id={`title-${exp.id}`}
                                  placeholder="e.g., Senior Developer"
                                  value={exp.title}
                                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                                />
                              </div>

                              <div className="space-y-3">
                                <Label htmlFor={`company-${exp.id}`} className="text-sm font-medium text-white">Company</Label>
                                <Input 
                                  id={`company-${exp.id}`}
                                  placeholder="e.g., Google"
                                  value={exp.company}
                                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor={`description-${exp.id}`} className="text-sm font-medium text-white">Description</Label>
                              <Textarea 
                                id={`description-${exp.id}`}
                                placeholder="Describe your role and responsibilities..."
                                value={exp.description}
                                className="min-h-[80px] resize-none bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <Label htmlFor={`from-${exp.id}`} className="text-sm font-medium text-white flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-zinc-400" />
                                  From
                                </Label>
                                <Input 
                                  id={`from-${exp.id}`}
                                  type="month"
                                  value={exp.from}
                                  className="bg-zinc-800 border-zinc-700 text-white"
                                />
                              </div>

                              <div className="space-y-3">
                                <Label htmlFor={`to-${exp.id}`} className="text-sm font-medium text-white flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-zinc-400" />
                                  To
                                </Label>
                                <Input 
                                  id={`to-${exp.id}`}
                                  type="month"
                                  value={exp.to}
                                  className="bg-zinc-800 border-zinc-700 text-white"
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 cursor-pointer "
                >
                  Cancel
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};