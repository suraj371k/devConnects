import { Button } from "@/components/ui/button";
import { backendUrl } from "@/lib/backendUrl";
import { FcGoogle } from "react-icons/fc";

const GoogleLogin = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <Button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full bg-white text-black hover:bg-zinc-100 border border-zinc-300 flex items-center gap-2"
      variant="secondary"
    >
      <FcGoogle size={18} /> Continue with Google
    </Button>
  );
};

export default GoogleLogin;

