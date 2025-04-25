
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { BarChart2, Activity, FileText } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoggingIn(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome to Med Report Analyzer",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-medical-primary p-3 rounded-full">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-medical-dark">Med Report Analyzer</h1>
          <p className="text-gray-600 mt-2">Upload and analyze your medical reports</p>
        </div>
        
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-medical-primary hover:bg-medical-dark" 
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-sm text-gray-600">
            <div>
              Demo credentials:
            </div>
            <div className="grid grid-cols-2 gap-2 w-full text-xs">
              <div className="border rounded p-2">
                <div className="font-bold">User</div>
                <div>username: usuario1</div>
                <div>password: usuario1</div>
              </div>
              <div className="border rounded p-2">
                <div className="font-bold">Admin</div>
                <div>username: admin</div>
                <div>password: admin</div>
              </div>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-10">
          <p className="text-center text-gray-500 font-medium mb-6">Key Features</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow-md flex flex-col items-center text-center">
              <div className="bg-blue-100 p-2 rounded-full mb-3">
                <FileText className="h-5 w-5 text-medical-primary" />
              </div>
              <h3 className="font-medium">Analyze Reports</h3>
              <p className="text-sm text-gray-600 mt-1">Upload and scan your medical documents</p>
            </div>
            <div className="bg-white p-4 rounded shadow-md flex flex-col items-center text-center">
              <div className="bg-blue-100 p-2 rounded-full mb-3">
                <BarChart2 className="h-5 w-5 text-medical-primary" />
              </div>
              <h3 className="font-medium">Track History</h3>
              <p className="text-sm text-gray-600 mt-1">View all your historical reports</p>
            </div>
            <div className="bg-white p-4 rounded shadow-md flex flex-col items-center text-center">
              <div className="bg-blue-100 p-2 rounded-full mb-3">
                <Activity className="h-5 w-5 text-medical-primary" />
              </div>
              <h3 className="font-medium">Health Insights</h3>
              <p className="text-sm text-gray-600 mt-1">Get personalized recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
