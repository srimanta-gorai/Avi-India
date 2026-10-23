import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { register } from "../../../app/api/authApis";

function Login() {
  const navigate = useNavigate();

  const slides = [
    { img: "/img1.png", title: "Welcome to Avi India", desc: "Manage your projects, teams and growth in one platform." },
    { img: "/img2.jpg", title: "Streamline Workflow", desc: "Collaborate with your team in real-time with ease." },
    { img: "/img3.jpg", title: "Scale Your Vision", desc: "Experience the next generation of project management." },
  ];

  const [index, setIndex] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setIndex((previous) => (previous + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleInputChange = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    if (error) setError("");
  };

  const handleGetStarted = async (event) => {
    event.preventDefault();
    setError("");

    const { name, email, password, phone } = formData;
    if (!name.trim() || !email.trim() || !password || !phone.trim()) {
      setError("Please fill in all four fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the Terms and Privacy Policy.");
      return;
    }

    // Exactly matches the four fields in the official Swagger registration schema.
    const payload = {
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
    };

    setLoading(true);
    try {
      const response = await register(payload);

      // Swagger documents a 201 response with { message: "string" }.
      if (response && typeof response.message === "string") {
        navigate("/login", {
          state: { email: email.trim(), registrationMessage: response.message },
        });
      } else {
        setError(response?.error || response?.message || "Registration could not be completed. Please try again.");
      }
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 grid grid-cols-1 md:grid-cols-2">
      {/* Left image slider */}
      <div className="relative min-h-screen hidden md:block overflow-hidden bg-teal-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <motion.img
              src={slides[index].img}
              className="w-full h-full object-cover"
              alt="Avi India introduction"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6, ease: "easeOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-950/80 via-transparent to-slate-50" />
          </motion.div>
        </AnimatePresence>

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

          <div className="flex gap-2 mt-8 pointer-events-auto">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`Show slide ${slideIndex + 1}`}
                onClick={() => setIndex(slideIndex)}
                className="h-1 w-10 bg-white/20 rounded-full overflow-hidden cursor-pointer"
              >
                {index === slideIndex && (
                  <motion.div
                    className="h-full bg-teal-400"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right registration form */}
      <div className="flex items-start justify-center bg-slate-50 min-h-screen py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[480px] lg:max-w-[520px] xl:max-w-[560px] px-6 sm:px-8 md:px-10 lg:px-12"
        >
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-teal-950 mb-1 tracking-tight">Create Account</h1>
            <p className="text-teal-800/60 font-medium text-sm">Start your journey with Avi India.</p>
          </div>

          {error && (
            <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleGetStarted}>
            <CustomInput
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(event) => handleInputChange("name", event.target.value)}
              required
              autoComplete="name"
            />
            <CustomInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(event) => handleInputChange("email", event.target.value)}
              required
              autoComplete="email"
            />
            <CustomInput
              label="Password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(event) => handleInputChange("password", event.target.value)}
              required
              autoComplete="new-password"
            />
            <CustomInput
              label="Phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(event) => handleInputChange("phone", event.target.value)}
              required
              autoComplete="tel"
            />

            <div className="flex items-start gap-2 py-1">
              <input
                id="termsAccepted"
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-teal-200 text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer flex-shrink-0"
              />
              <label htmlFor="termsAccepted" className="text-[11px] text-teal-900/60 font-medium leading-tight mt-0.5">
                I agree to the <span className="text-teal-600 font-bold">Terms</span> and <span className="text-teal-600 font-bold">Privacy Policy</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-teal-600/20 transition-all duration-300 active:scale-[0.98] flex items-center justify-center ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : "Get Started"}
            </button>
          </form>

          <p className="mt-6 md:mt-8 text-center text-xs text-teal-900/40 font-medium">
            Already have an account?{" "}
            <a href="/login" className="text-teal-600 cursor-pointer font-bold hover:text-teal-800 underline underline-offset-4">Sign In</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function CustomInput({ label, type = "text", placeholder, value, onChange, required = false, autoComplete }) {
  return (
    <div className="flex flex-col group">
      <label className="text-[9px] font-bold text-teal-900/90 uppercase tracking-[0.15em] mb-1 ml-1 transition-colors group-focus-within:text-teal-600">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className="w-full bg-white border border-teal-100 rounded-xl px-4 py-2.5 text-sm text-teal-950 placeholder:text-teal-500 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all"
      />
    </div>
  );
}

export default Login;
