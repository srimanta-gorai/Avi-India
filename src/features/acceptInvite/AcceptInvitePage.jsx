import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyInviteLink } from "../../app/api/authApis";

function AcceptInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isVerifying, setIsVerifying] = useState(true);
  const [inviteDetails, setInviteDetails] = useState(null);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const slides = [
    {
      img: "/img1.png",
      title: "Join Your Team on Avi India",
      desc: "Complete your account setup to start collaborating with your team.",
    },
    {
      img: "/img2.jpg",
      title: "Streamline Collaboration",
      desc: "Work together with your team in real-time from day one.",
    },
    {
      img: "/img3.jpg",
      title: "Enterprise Security",
      desc: "Your workspace is protected with bank-level encryption.",
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setError("No invitation token found");
      setIsVerifying(false);
    }
  }, [token]);

  const verifyToken = async () => {
    setIsVerifying(true);
    setError("");

    try {
      const payload = {
        token: token,
        email: "",
      };

      const response = await verifyInviteLink(payload);
      console.log("Verify invite response:", response);

      if (response.success && response.data) {
        setInviteDetails(response.data);
      } else {
        setError(response.message || "Invalid or expired invitation link");
      }
    } catch (error) {
      console.error("Error verifying invitation:", error);
      setError("Failed to verify invitation. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAcceptInvite = async (e) => {
    e.preventDefault();

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setFormError("First name and last name are required");
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    // Here you would call your accept invitation API
    // const response = await acceptInvite({
    //   token,
    //   firstName,
    //   lastName,
    //   password
    // });

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // On success, navigate to dashboard or login
      navigate("/dashboard");
    }, 1500);
  };

  // Show loading state while verifying token
  if (isVerifying) {
    return (
      <div className="w-full h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-teal-600 font-medium">
            Verifying your invitation...
          </p>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (error) {
    return (
      <div className="w-full h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-teal-950 mb-2">
              Invalid Invitation
            </h2>
            <p className="text-teal-600/70 mb-6">{error}</p>
            <p className="text-sm text-teal-500/60 mb-6">
              Please contact your administrator for a new invitation link.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-50 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
      {/* LEFT PORTION – SLIDER WITH ANIMATIONS */}
      <div className="relative h-full hidden md:block overflow-hidden bg-teal-950">
        <AnimatePresence>
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.8,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="absolute inset-0"
          >
            <motion.img
              src={slides[index].img}
              className="w-full h-full object-cover"
              alt="Background"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6, ease: "easeOut" }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-950/80 via-transparent to-slate-50" />
          </motion.div>
        </AnimatePresence>

        {/* Floating Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-12 lg:p-16 text-white z-10 pointer-events-none">
          <motion.div
            key={`content-${index}`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-sm"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-3 leading-tight drop-shadow-xl">
              {slides[index].title}
            </h2>
            <p className="text-sm lg:text-base opacity-90 font-semibold leading-relaxed drop-shadow-md">
              {slides[index].desc}
            </p>
          </motion.div>

          {/* Progress Bar Container */}
          <div className="flex gap-2 mt-8 pointer-events-auto">
            {slides.map((_, i) => (
              <div
                key={i}
                className="h-1 w-10 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                onClick={() => setIndex(i)}
              >
                {index === i && (
                  <motion.div
                    layoutId="progress"
                    className="h-full bg-teal-400"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PORTION – ACCEPT INVITATION FORM */}
      <div className="flex items-center justify-center overflow-hidden bg-slate-50 h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[720px] p-20"
        >
          {/* Invitation Badge */}
          <div className="mb-6 inline-flex items-center gap-2 bg-teal-100 text-teal-800 px-4 py-2 rounded-full">
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
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
            <span className="text-xs font-bold">Team Invitation</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-teal-950 mb-2 tracking-tight">
              Join Your Team
            </h1>
            <p className="text-teal-800/60 font-medium text-sm">
              You've been invited to join Avi India. Complete your account setup
              to get started.
            </p>

            {/* Invitation Details */}
            {inviteDetails && (
              <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <p className="text-sm text-teal-800">
                  <span className="font-semibold">Invited by:</span>{" "}
                  {inviteDetails.invitedBy || "Your Administrator"}
                </p>
                <p className="text-sm text-teal-800 mt-1">
                  <span className="font-semibold">Organization:</span>{" "}
                  {inviteDetails.organisation || "Avi India"}
                </p>
                <p className="text-sm text-teal-800 mt-1">
                  <span className="font-semibold">Email:</span>{" "}
                  {inviteDetails.email || "Not provided"}
                </p>
              </div>
            )}
          </div>

          {/* Form Error Message */}
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{formError}</p>
            </div>
          )}

          <form onSubmit={handleAcceptInvite} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col group">
                <label className="text-[9px] font-bold text-teal-900/90 uppercase tracking-[0.15em] mb-1 ml-1 transition-colors group-focus-within:text-teal-600">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (formError) setFormError("");
                  }}
                  placeholder="John"
                  required
                  className="w-full bg-white border border-teal-100 rounded-xl px-4 py-3.5 text-sm text-teal-950 placeholder:text-teal-500 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all"
                />
              </div>

              <div className="flex flex-col group">
                <label className="text-[9px] font-bold text-teal-900/90 uppercase tracking-[0.15em] mb-1 ml-1 transition-colors group-focus-within:text-teal-600">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (formError) setFormError("");
                  }}
                  placeholder="Doe"
                  required
                  className="w-full bg-white border border-teal-100 rounded-xl px-4 py-3.5 text-sm text-teal-950 placeholder:text-teal-500 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col group">
              <label className="text-[9px] font-bold text-teal-900/90 uppercase tracking-[0.15em] mb-1 ml-1 transition-colors group-focus-within:text-teal-600">
                Email Address
              </label>
              <input
                type="email"
                value={inviteDetails?.email || ""}
                disabled
                className="w-full bg-teal-50 border border-teal-100 rounded-xl px-4 py-3.5 text-sm text-teal-600 cursor-not-allowed"
              />
              <p className="text-xs text-teal-500/60 mt-1 ml-1">
                Email cannot be changed
              </p>
            </div>

            <div className="flex flex-col group">
              <label className="text-[9px] font-bold text-teal-900/90 uppercase tracking-[0.15em] mb-1 ml-1 transition-colors group-focus-within:text-teal-600">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formError) setFormError("");
                }}
                placeholder="Create a strong password"
                required
                className="w-full bg-white border border-teal-100 rounded-xl px-4 py-3.5 text-sm text-teal-950 placeholder:text-teal-500 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all"
              />
              <p className="text-xs text-teal-500/60 mt-1 ml-1">
                Minimum 8 characters
              </p>
            </div>

            <div className="flex flex-col group">
              <label className="text-[9px] font-bold text-teal-900/90 uppercase tracking-[0.15em] mb-1 ml-1 transition-colors group-focus-within:text-teal-600">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formError) setFormError("");
                }}
                placeholder="Re-enter your password"
                required
                className="w-full bg-white border border-teal-100 rounded-xl px-4 py-3.5 text-sm text-teal-950 placeholder:text-teal-500 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all"
              />
            </div>

            <div className="space-y-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${
                  isSubmitting
                    ? "bg-teal-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700"
                } text-white py-3.5 rounded-xl font-bold shadow-lg shadow-teal-600/20 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
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
                    <span>Setting up your account...</span>
                  </>
                ) : (
                  "Accept Invitation & Join"
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-teal-100"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-slate-50 text-teal-900/40 font-medium">
                    Secure enterprise onboarding
                  </span>
                </div>
              </div>

              <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-100">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <svg
                      className="w-5 h-5 text-teal-600"
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
                    <p className="text-xs font-semibold text-teal-900 mb-1">
                      Secure Team Access
                    </p>
                    <p className="text-xs text-teal-800/60">
                      You're being onboarded to a secure enterprise workspace.
                      Your account will be protected with industry-standard
                      encryption.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <div className="pt-6">
            <p className="text-center text-xs text-teal-900/30">
              © 2026 Avi India. All rights reserved. Enterprise-grade security.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AcceptInvitePage;
