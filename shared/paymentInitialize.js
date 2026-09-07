import axios from "axios";

export const initializeSubscriptionPayment = async (req, res) => {
  //console.log("Pay show");
  try {
    const {
      subID,
      subName,
      subPeriod,
      subAmount,
      noOfStaff,
      subSpace,
      currency,
      userMail,
      userCompany,
      userClt_id,
    } = req.body;

    if (!userMail) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    if (!subAmount || Number(subAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription amount",
      });
    }

    /*
      Paystack expects amount in kobo.

      Example:
      ₦10,000 = 1,000,000 kobo
    */
    const amount = Math.round(Number(subAmount) * 100);

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: userMail,
        amount,
        currency: currency || "NGN",

        // Optional metadata
        metadata: {
          subscription: {
            subID,
            subName,
            subPeriod,
            subAmount: Number(subAmount),
            noOfStaff,
            subSpace,
          },

          customer: {
            email: userMail,
            company: userCompany,
            client_id: userClt_id,
          },
        },

        // Optional callback URL
        // callback_url:
        //   `${process.env.FRONTEND_URL}/subscription/payment/callback`,
        callback_url:
          `http://localhost:5173/payment`,
      },
      {
        headers: {
          Authorization: `Bearer sk_test_299b04eacac50673751c8d0a25be5d43f36bffb4`,
          //Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Payment initialized successfully",
      data: response.data.data,
    });

  } catch (error) {
    console.error(
      "Paystack initialization error:",
      error?.response?.data || error?.message
    );

    return res.status(500).json({
      success: false,
      message:
        error?.response?.data?.message ||
        "Unable to initialize Paystack payment",
    });
  }
};