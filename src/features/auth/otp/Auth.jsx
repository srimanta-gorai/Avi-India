import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { resendOTP, verifyOTP } from "../../../app/api/authApis";

function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const identifier = location.state?.identifier || location.state?.email || "";
  const email = location.state?.email || identifier || "your email";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(59);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOtpChange = (value, index) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (error) setError("");

      if (value && index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      newOtp.forEach((digit, index) => {
        if (inputRefs.current[index]) {
          inputRefs.current[index].value = digit;
        }
      });
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };


  const handleResendOTP = async () => {
    if (timer > 0 || isResending) return;

    if (!email || email === "your email") {
      setError("Email is missing. Please log in again.");
      return;
    }

    setIsResending(true);
    setError("");

    try {
      const response = await resendOTP(email);

      if (response && typeof response.message === "string") {
        setOtp(["", "", "", "", "", ""]);
        setTimer(59);

        inputRefs.current.forEach((ref) => {
          if (ref) ref.value = "";
        });

        inputRefs.current[0]?.focus();
      } else {
        setError(
          response?.error ||
            response?.message ||
            "Failed to resend OTP. Please try again."
        );
      }
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to resend OTP. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };


  const fetchAndStoreProfile = async () => {
    const profileResponse = await getProfile();
    console.log("Profile data after verification:", profileResponse);

    if (profileResponse.success && profileResponse.data) {
      const { firstName, lastName, profileImageMetaData, profileImage } =
        profileResponse.data;

      // Store user name in localStorage for topbar
      if (firstName || lastName) {
        localStorage.setItem(
          "userName",
          JSON.stringify({
            firstName: firstName || "",
            lastName: lastName || "",
          }),
        );
      }

      // Store profile image in localStorage
      if (profileImageMetaData?.path) {
        localStorage.setItem("profileImage", profileImageMetaData.path);
      } else if (profileImage) {
        // Fallback to direct profileImage if it's a URL
        localStorage.setItem("profileImage", profileImage);
      }

      // Dispatch event to notify topbar about profile update
      window.dispatchEvent(new Event("profile-updated"));
    }

    return profileResponse;
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");

    if (!identifier) {
      setError("Login information is missing. Please log in again.");
      return;
    }

    if (!/^\d{6}$/.test(otpString)) {
      setError("Please enter all 6 digits of the OTP.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await verifyOTP(identifier, otpString);

      // The documented response includes accessToken and refreshToken.
      if (
        response &&
        typeof response.accessToken === "string" &&
        response.accessToken.length > 0 &&
        typeof response.refreshToken === "string" &&
        response.refreshToken.length > 0
      ) {
        // The verifyOTP helper stores the returned tokens.
        // Navigate only after a valid documented token response.
        navigate("/dashboard", { replace: true });
      } else {
        setError(
         response?.message ||
            response?.error ||
            "OTP verification failed. Please try again."
        );

        setOtp(["", "", "", "", "", ""]);

        inputRefs.current.forEach((ref) => {
          if (ref) ref.value = "";
        });

        inputRefs.current[0]?.focus();
      }
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 grid grid-cols-1 md:grid-cols-2 ">
      {/* LEFT PORTION – BRANDING/ILLUSTRATION SECTION */}
      <div className="hidden min-h-screen overflow-hidden md:flex flex-col items-center justify-center p-12 lg:p-20 bg-gradient-to-br from-teal-600 to-teal-800 text-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl w-full"
        >
          <div className="mb-10">
            <h1 className="text-5xl font-black mb-4 leading-tight">
              Secure Verification
            </h1>
            <p className="text-xl opacity-90 font-medium leading-relaxed">
              Two-factor authentication for enhanced security and peace of mind.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Real-time Protection</h3>
                <p className="opacity-90">
                  Every login attempt is verified with a time-sensitive code.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Enterprise Security</h3>
                <p className="opacity-90">
                  Bank-level encryption and compliance with industry standards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Instant Delivery</h3>
                <p className="opacity-90">
                  Receive your verification code within seconds.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm opacity-80">
              <span className="font-bold">Avi India Security</span> • ISO 27001
              Certified • GDPR Compliant
            </p>
          </div>
        </motion.div>
      </div>

      {/* RIGHT PORTION – OTP VERIFICATION FORM */}
      <div className="flex items-start justify-center bg-slate-50 min-h-screen py-10 ">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-teal-100/50 overflow-hidden border border-teal-100">
            {/* Header - More compact */}
            <div className="p-6 md:p-8 pb-6 bg-gradient-to-r from-teal-50 to-slate-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-teal-950 mb-1">
                    Verify Identity
                  </h1>
                  <p className="text-xs text-teal-800/60 font-medium">
                    Enter the 6-digit verification code
                  </p>
                </div>
              </div>

              <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                <p className="text-xs md:text-sm text-teal-800 font-medium mb-1">
                  Code sent to:{" "}
                  <span className="font-bold text-teal-900">{email}</span>
                </p>
                <p className="text-xs text-teal-800/60">
                  Check your email. Code expires in 60 seconds.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* OTP Input Section - More compact */}
            <div className="p-6 md:p-8 pt-6">
              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-xs font-bold text-teal-900/40 uppercase tracking-[0.15em]">
                      6-digit code
                    </label>
                    <div className="text-xs font-medium text-teal-800">
                      <span
                        className={`font-bold ${timer < 10 ? "text-red-500" : "text-teal-600"}`}
                      >
                        {formatTime(timer)}
                      </span>{" "}
                      left
                    </div>
                  </div>

                  {/* Smaller OTP boxes */}
                  <div className="flex gap-3 justify-center mb-6">
                    {otp.map((digit, index) => (
                      <div
                        key={index}
                        className="relative group"
                        style={{ width: "48px", height: "48px" }}
                      >
                        <input
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(e.target.value, index)
                          }
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          onPaste={index === 0 ? handlePaste : undefined}
                          className="w-full h-full bg-white border border-teal-100 rounded-lg text-center text-xl font-bold text-teal-950 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all duration-200 group-hover:border-teal-200"
                        />
                        <AnimatePresence>
                          {digit && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute inset-0 border border-teal-500 rounded-lg pointer-events-none"
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <p className="text-xs text-teal-900/60 font-medium">
                      No code received?
                    </p>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={timer > 0 || isResending}
                      className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 transition-all duration-300 ${
                        timer > 0 || isResending
                          ? "bg-teal-100 text-teal-900/30 cursor-not-allowed"
                          : "bg-teal-50 text-teal-600 hover:bg-teal-100 hover:text-teal-800 border border-teal-200"
                      }`}
                    >
                      {isResending ? (
                        <>
                          <svg
                            className="animate-spin h-3 w-3"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Resend {timer > 0 && `(${timer}s)`}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Buttons - More compact */}
                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className={`w-full ${
                      isVerifying
                        ? "bg-teal-400 cursor-not-allowed"
                        : "bg-teal-600 hover:bg-teal-700"
                    } text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-600/20 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2`}
                  >
                    {isVerifying ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="text-sm">Verifying...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm">Verify & Continue</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full bg-white border border-teal-100 hover:border-teal-200 text-teal-950 py-3 rounded-xl font-medium text-sm transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add custom animation for shake */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default OtpVerification;
