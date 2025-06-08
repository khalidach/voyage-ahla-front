// LoginPage.tsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Make sure Input is imported
import { Label } from "@/components/ui/label"; // Make sure Label is imported
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/App"; // Import useAuth from App.tsx

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setIsAuthenticated } = useAuth(); // Get setIsAuthenticated from context

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });
      toast({
        title: "تم تسجيل الدخول بنجاح!",
        description: "أهلاً بك في لوحة التحكم.",
      });
      setIsAuthenticated(true); // Set authentication state to true
      navigate("/admin"); // Navigate to admin dashboard
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description:
          error.response?.data?.msg || "اسم المستخدم أو كلمة المرور غير صحيحة.",
        variant: "destructive",
      });
      console.error("Login error:", error.response?.data || error.message);
      setIsAuthenticated(false); // Ensure state is false on error
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
      dir="rtl"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">تسجيل الدخول</CardTitle>
          <CardDescription>
            أدخل بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              تسجيل الدخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
