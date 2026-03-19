import CommonForm from "@/components/common-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  signInFormControls,
  signUpFormControls,
  initialSignInFormData,
  initialSignUpFormData,
} from "@/config";
import { registrationServices, googleAuthService } from "@/services/loginservices/index";
import { GraduationCap } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import { loginServices } from "@/services/loginservices/index";
import { GoogleLogin } from "@react-oauth/google";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  function handleTabChange(value) {
    setActiveTab(value);
  }

  async function handleLoginUser(e) {
    e.preventDefault();
    try {
      const res = await loginServices(signInFormData);
      if (res?.success) {
        const { user, accessToken } = res.data;
        login(user, accessToken);
        navigate("/");
      } else {
        console.error("Login failed:", res?.message);
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  }

  async function handleRegisterUser(e) {
    e.preventDefault();
    try {
      await registrationServices(signUpFormData);
      setActiveTab("signin");
    } catch (err) {
      console.error("Registration error:", err);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    try {
      const res = await googleAuthService(credentialResponse.credential);
      if (res?.success) {
        const { user, accessToken } = res.data;
        const normalizedUser = {
          ...user,
          userName: user.userName || user.name,
          userEmail: user.userEmail || user.email,
        };
        login(normalizedUser, accessToken);
        navigate("/");
      } else {
        console.error("Google Login failed:", res?.message);
      }
    } catch (err) {
      console.error("Google Login error:", err);
    }
  }

  function handleGoogleFailure() {
    console.error("Google Login Failed");
  }

  function checkIfSignInFormIsValid() {
    return signInFormData.userEmail?.trim() && signInFormData.password?.trim();
  }

  function checkIfSignUpFormIsValid() {
    return (
      signUpFormData.userName?.trim() &&
      signUpFormData.userEmail?.trim() &&
      signUpFormData.password?.trim()
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 dark:from-slate-950 dark:via-background dark:to-indigo-950/30">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="font-extrabold text-2xl tracking-tight text-primary">EDUHUB</span>
        </Link>
      </header>

      <div className="flex items-center justify-center flex-1 p-4">
        <div className="w-full max-w-md space-y-4">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card className="p-6 space-y-4">
                <CardHeader>
                  <CardTitle>Sign in to your account</CardTitle>
                  <CardDescription>Enter your email and password</CardDescription>
                </CardHeader>
                <CardContent>
                  <CommonForm
                    formControls={signInFormControls}
                    buttonText="Sign In"
                    formData={signInFormData}
                    setFormData={setSignInFormData}
                    isButtonDisabled={!checkIfSignInFormIsValid()}
                    handleSubmit={handleLoginUser}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="p-6 space-y-4">
                <CardHeader>
                  <CardTitle>Create a new account</CardTitle>
                  <CardDescription>Enter your details to get started</CardDescription>
                </CardHeader>
                <CardContent>
                  <CommonForm
                    formControls={signUpFormControls}
                    buttonText="Sign Up"
                    formData={signUpFormData}
                    setFormData={setSignUpFormData}
                    isButtonDisabled={!checkIfSignUpFormIsValid()}
                    handleSubmit={handleRegisterUser}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Single GoogleLogin instance — outside Tabs so it only mounts once */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;