import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="p-6 max-w-md w-full text-center space-y-4">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-500">Payment Cancelled</CardTitle>
          <CardDescription>
            You cancelled the payment. No charges were made to your account.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-2 px-6 pb-6">
          <Button onClick={() => navigate(-1)}>Try Again</Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Go Back Home
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default PaymentCancelPage;