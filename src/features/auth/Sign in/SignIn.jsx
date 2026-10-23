import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { login } from "../../../app/api/authApis";

function Signup() {
  const navigate = useNavigate();
  const slides = [
    {
      img: "/img1.png",
      title: "Welcome to Avi India",
      desc: "Manage your projects, teams and growth in one platform.",
    },
    {
      img: "/img2.jpg",
      title: "Streamline Workflow",
      desc: "Collaborate with your team in real-time with ease.",
    },
    {
      img: "/img3.jpg",
      title: "Scale Your Vision",
      desc: "Experience the next generation of project management.",
    },
  ];

  const [index, setIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");

    const identifier = email.trim();

    if (!identifier || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(identifier)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login(identifier, password);

      // The documented endpoint responds with { message: "string" }.
      if (response && typeof response.message === "string") {
        navigate("/auth", {
          state: {
          identifier,
          email: identifier,
          },
        });
      } else {
          setError(
            response?.error ||
            response?.message ||
            "Failed to request OTP. Please try again."
          );
        }
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to request OTP. Please try again."
      );
    } finally {
        setIsSubmitting(false);
      }
  };


  return (
    // FIX: min-h-screen (was h-screen) lets the page grow taller than the
    // viewport when content needs it, instead of forcing a fixed-height
    // layout that clips content.
    <div className="w-full min-h-screen bg-slate-50 grid grid-cols-1 md:grid-cols-2">
      {/* LEFT PORTION – SLIDER WITH ANIMATIONS */}
      {/* FIX: min-h-screen (was h-full) so this column matches the right
          column's natural height instead of being pinned to exactly one
          viewport height. */}
      <div className="relative min-h-screen hidden md:block overflow-hidden bg-teal-950">
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

      {/* RIGHT PORTION – OTP LOGIN FORM SECTION */}
      {/* FIX: removed `overflow-hidden`, `h-full`, and vertical
          `items-center`. Centering content inside a fixed-height,
          clipped container is exactly what made the error banner push
          the top of the form off-screen. min-h-screen + items-start lets
          the column grow naturally with its content and the page scrolls
          normally at any screen size. */}
      <div className="flex items-start justify-center bg-slate-50 min-h-screen py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[720px] px-6 sm:px-10 md:px-16 lg:px-20"
        >
          <div className="mb-10">
            <h1 className="text-3xl font-black text-teal-950 mb-2 tracking-tight">
              Login to Avi India
            </h1>
            <p className="text-teal-800/60 font-medium text-sm">
              Enter your email to receive a one-time verification code
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSendOTP} className="space-y-8">
            <div className="flex flex-col group">
              <label className="text-[9px] font-bold text-teal-900/90 uppercase tracking-[0.15em] mb-1 ml-1 transition-colors group-focus-within:text-teal-600">
                Work Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="you@company.com"
                required
                className="w-full bg-white border border-teal-100 rounded-xl px-4 py-3.5 text-sm text-teal-950 placeholder:text-teal-500 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all"
              />
              <p className="text-xs text-teal-600/70 mt-2 ml-1">
                We'll send a 6-digit verification code to this email
              </p>
            </div>
                
<div className="flex flex-col group">
  <label
    htmlFor="login-password"
    className="text-[9px] font-bold text-teal-900/90 uppercase tracking-[0.15em] mb-1 ml-1 transition-colors group-focus-within:text-teal-600"
  >
    Password
  </label>

  <input
    id="login-password"
    type="password"
    value={password}
    onChange={(e) => {
      setPassword(e.target.value);
      if (error) setError("");
    }}
    placeholder="Enter your password"
    autoComplete="current-password"
    required
    className="w-full bg-white border border-teal-100 rounded-xl px-4 py-3.5 text-sm text-teal-950 placeholder:text-teal-500 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all"
  />
</div>


            <div className="space-y-6">
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
                    <span>Sending Verification Code...</span>
                  </>
                ) : (
                  "Proceed to Verification"
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-teal-100"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-slate-50 text-teal-900/40 font-medium">
                    Secure & encrypted login
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-teal-900 mb-1">
                      Enhanced Security
                    </p>
                    <p className="text-xs text-teal-800/60">
                      OTP verification ensures your account remains secure. The
                      code expires in 60 seconds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <div className="pt-6">
            <p className="mt-6 text-center text-xs text-teal-900/40 font-medium">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-teal-600 cursor-pointer font-bold hover:text-teal-800 underline underline-offset-4"
              >
                Sign Up
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Signup;
