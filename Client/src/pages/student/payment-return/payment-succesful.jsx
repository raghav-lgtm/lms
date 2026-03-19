import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { captureAndFinalizePaymentService } from "@/services/studentservices/index";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PaypalPaymentReturnPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function capturePayment() {
      const params = new URLSearchParams(location.search);
      const paymentId = params.get("paymentId");
      const payerId = params.get("PayerID");
      const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));

      console.log("params:", { paymentId, payerId, orderId }); // verify values

      if (!paymentId || !payerId || !orderId) {
        console.error("Missing payment params");
        navigate("/");
        return;
      }

      try {
        const res = await captureAndFinalizePaymentService({ orderId, paymentId, payerId });
        if (res?.success) {
          sessionStorage.removeItem("currentOrderId");
          navigate("/student/my-courses");
        } else {
          console.error("Capture failed:", res?.message);
          navigate("/payment-cancel");
        }
      } catch (error) {
        console.error("Payment capture error:", error);
        navigate("/payment-cancel");
      }
    }

    capturePayment();
  }, [location.search]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Processing payment... Please wait</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

export default PaypalPaymentReturnPage;