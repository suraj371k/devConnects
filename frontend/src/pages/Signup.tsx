import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Lock, Mail, User, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { registerUser } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import GoogleLogin from "@/components/GoogleLogin";

const Signup = () => {

  const { signupUser , loading} = useAuthStore()

  type RegisterUserForm = z.input<typeof registerUser>

  const { register , handleSubmit , formState: {errors} } = useForm<RegisterUserForm>({ resolver: zodResolver(registerUser) })

  const onSubmit: SubmitHandler<RegisterUserForm> = (userData) => {
    const parsed = registerUser.parse(userData)
    console.log("Form data" , parsed)
    signupUser(parsed)
    toast.success("Signup successfull")
  }


  return (
    <div className="min-h-screen bg-black flex justify-center items-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col justify-center items-center bg-zinc-950 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-800 relative z-10"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(39, 39, 42, 0.5)"
        }}
      >
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl"></div>
        
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
        >
          Create Account
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-gray-400 mb-6 text-center"
        >
          Already have an account?{" "}
          <Link 
            to="/login" 
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            Sign in
          </Link>
        </motion.p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="relative flex items-center"
          >
            <User className="absolute left-3 text-gray-400 z-10" size={20} />
            <Input
              className="pl-10 bg-zinc-900 text-white border-zinc-800 rounded-lg py-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
              type="text"
              placeholder="Full name"
              required
              {...register('name')}
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="relative flex items-center"
          >
            <Mail className="absolute left-3 text-gray-400 z-10" size={20} />
            <Input
              className="pl-10 bg-zinc-900 text-white border-zinc-800 rounded-lg py-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
              type="email"
              placeholder="Email address"
              {...register("email")}
              required
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="relative flex items-center"
          >
            <Lock className="absolute left-3 text-gray-400 z-10" size={20} />
            <Input
              className="pl-10 pr-10 bg-zinc-900 text-white border-zinc-800 rounded-lg py-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
              type="password"
              placeholder="Password"
              {...register('password')}
              required
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="space-y-2"
          >
            <Label className="text-gray-300 flex items-center gap-2">
              <Calendar size={16} /> Date of Birth
            </Label>
            <Input
              type="date"
              className="bg-zinc-900 border-zinc-800 text-gray-300 rounded-lg py-5 shadow-inner"
              {...register("dob" as const)}
              required
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 rounded-lg text-white font-semibold transition-all duration-300 mt-2 shadow-lg hover:shadow-blue-500/20"
            >
              {loading ? "Signing up...": "Signup Account"}
            </Button>
          </motion.div>
          <div className="relative text-center py-2">
            <span className="text-xs text-gray-400 bg-zinc-950 px-2 relative z-10">or</span>
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-zinc-800" />
          </div>
          <GoogleLogin />
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;