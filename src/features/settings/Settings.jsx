import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Loader,
  X,
} from "lucide-react";
import { getProfile, updateProfile } from "../../app/api/authApis";
import { uploadFile } from "../../app/api/teamGlobal";

export default function SettingsProfilePage() {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "",
    designation: "",
    company: "Avi India Construction",
    location: "India",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [mediaId, setMediaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ===============================
     FETCH PROFILE DATA
  ================================ */
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError("");

    const response = await getProfile();

    if (response.success) {
      const { data } = response;
      setFormData((prev) => ({
        ...prev,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        countryCode: data.countryCode || "",
        designation: data.designation || "",
        company: prev.company,
        location: prev.location,
      }));

      // Set profile image if exists
      if (data.profileImageMetaData?.path) {
        setProfileImagePreview(data.profileImageMetaData.path);
        setMediaId(data.profileImage || null);
      } else if (data.profileImage) {
        setProfileImagePreview(data.profileImage);
        setMediaId(data.profileImage);
      }

      // Also update localStorage for topbar sync
      if (data.firstName || data.lastName) {
        localStorage.setItem(
          "userName",
          JSON.stringify({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
          }),
        );
        window.dispatchEvent(new Event("profile-updated"));
      }
    } else {
      setError(response.message || "Failed to load profile data");
    }

    setLoading(false);
  };

  /* ==============================
     LOAD SAVED IMAGE ON PAGE REFRESH
  ================================ */
  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage && !profileImagePreview) {
      setProfileImagePreview(savedImage);
    }
  }, []);

  /* ===============================
     SAVE NAME CHANGES (SYNC TOPBAR)
  ================================ */
  useEffect(() => {
    if (formData.firstName || formData.lastName) {
      localStorage.setItem(
        "userName",
        JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      );
      window.dispatchEvent(new Event("profile-updated"));
    }
  }, [formData.firstName, formData.lastName]);

  /* ===============================
     SYNC PROFILE IMAGE TO TOPBAR
  ================================ */
  useEffect(() => {
    if (profileImagePreview) {
      localStorage.setItem("profileImage", profileImagePreview);
      window.dispatchEvent(new Event("profile-updated"));
    }
  }, [profileImagePreview]);

  const initials =
    `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase() ||
    "U";

  /* ===============================
     INPUT HANDLER
  ================================ */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  /* ===============================
     IMAGE UPLOAD HANDLER - FIXED
  ================================ */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file to server with folder name "profile"
    setUploadingImage(true);
    setError("");

    try {
      // Pass 'profile' as the folder name
      const uploadResponse = await uploadFile(file, "user");

      if (uploadResponse.success && uploadResponse.data?.mediaId) {
        setMediaId(uploadResponse.data.mediaId);
        setSuccess("Image uploaded successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(uploadResponse.message || "Failed to upload image");
        // Revert preview if upload fails
        fetchProfileData();
      }
    } catch (error) {
      setError("Failed to upload image. Please try again.");
      // Revert preview if upload fails
      fetchProfileData();
    } finally {
      setUploadingImage(false);
    }
  };

  /* ===============================
     REMOVE IMAGE HANDLER
  ================================ */
  const handleRemoveImage = () => {
    setProfileImagePreview(null);
    setMediaId(null);
    localStorage.removeItem("profileImage");
    window.dispatchEvent(new Event("profile-updated"));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ===============================
     SAVE PROFILE HANDLER
  ================================ */
  const handleSaveChanges = async () => {
    // Validate required fields
    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      setError("First name and last name are required");
      return;
    }

    // Check if image is still uploading
    if (uploadingImage) {
      setError("Please wait for the image to finish uploading");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      countryCode: formData.countryCode || "65",
      phoneNumber: formData.phoneNumber?.replace(/\D/g, "") || "",
      designation: formData.designation?.trim() || null,
    };

    // Add profileImage to payload if mediaId exists
    if (mediaId) {
      payload.profileImage = mediaId;
    }

    const response = await updateProfile(payload);

    if (response.success) {
      setSuccess("Profile updated successfully");

      // Refresh profile data to get latest
      await fetchProfileData();

      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(response.message || "Failed to update profile");
      setTimeout(() => setError(""), 3000);
    }

    setSaving(false);
  };

  /* ===============================
     CANCEL HANDLER
  ================================ */
  const handleCancel = () => {
    fetchProfileData(); // Reset to original data
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format phone number for display
  const formattedPhone = formData.phoneNumber
    ? `${formData.countryCode ? "+" + formData.countryCode : ""} ${formData.phoneNumber}`
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-2 sm:py-2 lg:py-4 px-2">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-2 sm:p-2 lg:p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="w-8 h-8 text-teal-600 animate-spin mb-4" />
            <p className="text-teal-600 font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 sm:py-2 lg:py-4 px-2">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-2 sm:p-2 lg:p-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* ================= Profile Picture ================= */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-teal-950 mb-4 sm:mb-6">
            Profile Picture
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Profile"
                  className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full object-cover border-2 border-teal-100"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white">
                    {initials}
                  </span>
                </div>
              )}

              {/* Remove Image Button */}
              {profileImagePreview && !uploadingImage && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-center sm:text-left">
              <div className="flex flex-col sm:flex-row gap-3">
                <label
                  htmlFor="photo-upload"
                  className={`cursor-pointer inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-2.5 rounded-lg hover:bg-teal-700 transition text-sm sm:text-base shadow-md shadow-teal-600/20 ${
                    uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploadingImage ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera size={18} />
                  )}
                  {uploadingImage ? "Uploading..." : "Change Photo"}
                </label>

                {profileImagePreview && !uploadingImage && (
                  <button
                    onClick={handleRemoveImage}
                    className="inline-flex items-center justify-center gap-2 border border-red-200 text-red-600 px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-2.5 rounded-lg hover:bg-red-50 transition text-sm sm:text-base"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />

              {uploadingImage && (
                <p className="text-xs text-teal-600 animate-pulse mt-2">
                  Uploading image to server...
                </p>
              )}

              <p className="text-xs sm:text-sm text-teal-600/60 mt-2">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* ================= Personal Information ================= */}
        <h2 className="text-xl sm:text-2xl font-bold text-teal-950 mb-4 sm:mb-6">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required={true}
            placeholder="Enter first name"
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required={true}
            placeholder="Enter last name"
          />

          <IconInput
            label="Email Address"
            icon={Mail}
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={true}
            helpText="Email cannot be changed"
          />

          <IconInput
            label="Phone Number"
            icon={Phone}
            name="phoneNumber"
            value={formattedPhone}
            onChange={handleInputChange}
            disabled={true}
            helpText="Contact support to change phone number"
          />

          <Input
            label="Designation"
            name="designation"
            value={formData.designation || ""}
            onChange={handleInputChange}
            placeholder="e.g., Quantity Surveyor"
          />

          <IconInput
            label="Company"
            icon={Building}
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            placeholder="Company name"
          />

          <IconInput
            label="Location"
            icon={MapPin}
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Your location"
          />
        </div>

        {/* ================= Actions ================= */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6 sm:mt-8">
          <button
            onClick={handleCancel}
            disabled={saving || uploadingImage}
            className="px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-2.5 border border-teal-200 rounded-lg text-sm sm:text-base text-teal-700 hover:bg-teal-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={saving || uploadingImage}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 ${
              saving || uploadingImage ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : uploadingImage ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= Reusable Components ================= */

function Input({
  label,
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "",
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-teal-900 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-3 py-2 sm:px-4 sm:py-3 border border-teal-100 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm sm:text-base transition ${
          disabled ? "bg-teal-50 text-teal-600 cursor-not-allowed" : "bg-white"
        }`}
      />
    </div>
  );
}

function IconInput({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  disabled = false,
  placeholder = "",
  helpText = "",
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-teal-900 mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-teal-400"
          size={16}
        />
        <input
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-teal-100 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm sm:text-base transition ${
            disabled
              ? "bg-teal-50 text-teal-600 cursor-not-allowed"
              : "bg-white"
          }`}
        />
      </div>
      {helpText && <p className="text-xs text-teal-500/60 mt-1">{helpText}</p>}
    </div>
  );
}
