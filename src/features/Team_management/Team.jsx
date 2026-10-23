import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Building2,
  MapPin,
  Mail,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Edit2,
  Send,
  Camera,
  User,
  X,
} from "lucide-react";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en";
import flags from "react-phone-number-input/flags";
import {
  createTeamMember,
  getTeamMembers,
  updateTeamMember,
  resendInvite,
  uploadFile,
} from "../../app/api/teamGlobal";

const TeamPage = () => {
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Country code states
  const [country, setCountry] = useState("SG");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef(null);
  const [countrySearch, setCountrySearch] = useState("");

  // File upload refs
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // ===== PREVENT BODY SCROLL WHEN SLIDERS ARE OPEN =====
  useEffect(() => {
    const isAnySliderOpen = isAddUserOpen || isEditUserOpen;

    if (isAnySliderOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        const scrollY = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      };
    }
  }, [isAddUserOpen, isEditUserOpen]);

  // API Data states
  const [teamData, setTeamData] = useState({
    total: 0,
    items: [],
  });

  // Form state for new member with field errors
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    email: "",
    designation: "",
    address: "",
    profileImage: null,
    profileImagePreview: null,
    mediaId: null,
  });

  // Field errors for new member
  const [newMemberErrors, setNewMemberErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  // Edit form state
  const [editMember, setEditMember] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    address: "",
    profileImage: null,
    profileImagePreview: null,
    mediaId: null,
  });

  // Field errors for edit member
  const [editMemberErrors, setEditMemberErrors] = useState({
    firstName: "",
    lastName: "",
  });

  const itemsPerPage = 6;

  // Get all countries with their data
  const countries = getCountries().map((countryCode) => ({
    value: countryCode,
    label: en[countryCode],
    callingCode: `+${getCountryCallingCode(countryCode)}`,
    flag: flags[countryCode],
  }));

  const selectedCountry =
    countries.find((c) => c.value === country) ||
    countries.find((c) => c.value === "SG");

  /* ===============================
     FETCH TEAM MEMBERS
  ================================ */
  const fetchTeamMembers = async (showFullPageLoading = false) => {
    if (showFullPageLoading) {
      setLoading(true);
    } else {
      setTableLoading(true);
    }

    setError("");

    const response = await getTeamMembers(
      searchQuery,
      currentPage,
      itemsPerPage,
    );

    if (response.success) {
      setTeamData({
        total: response.data.total || response.data.memberList?.length || 0,
        items: response.data.memberList || [],
      });
    } else {
      setError(response.message || "Failed to load team members");
    }

    if (showFullPageLoading) {
      setLoading(false);
    } else {
      setTableLoading(false);
    }
  };

  // Initial fetch - show full page loading
  useEffect(() => {
    fetchTeamMembers(true);
  }, []);

  // Debounced search - don't show full page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
      fetchTeamMembers(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch when page changes - don't show full page loading
  useEffect(() => {
    fetchTeamMembers(false);
  }, [currentPage]);

  /* ===============================
     FILTER HANDLING
  ================================ */
  const filteredUsers = teamData?.items?.filter((user) => {
    const matchesFilter =
      filterRole === "all" || user.designation === filterRole;
    return matchesFilter;
  });

  // Filter countries based on search
  const filteredCountries = countries.filter(
    (country) =>
      country.label.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.callingCode.includes(countrySearch) ||
      country.value.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  // Use filtered users for display
  const displayUsers = filteredUsers || [];
  const totalFilteredPages = Math.max(
    1,
    Math.ceil(displayUsers.length / itemsPerPage),
  );

  // Paginate filtered results
  const startIndex =
    displayUsers.length > 0 ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = Math.min(startIndex + itemsPerPage, displayUsers.length);
  const paginatedUsers = displayUsers.slice(startIndex, endIndex);

  /* ===============================
     COUNTRY CODE HANDLERS
  ================================ */
  const handleCountrySelect = (countryCode) => {
    setCountry(countryCode);
    setIsCountryDropdownOpen(false);
  };

  /* ===============================
     FILE UPLOAD HANDLERS
  ================================ */
  const handleFileSelect = async (e, isEdit = false) => {
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
    reader.onloadend = () => {
      if (isEdit) {
        setEditMember((prev) => ({
          ...prev,
          profileImage: file,
          profileImagePreview: reader.result,
        }));
      } else {
        setNewMember((prev) => ({
          ...prev,
          profileImage: file,
          profileImagePreview: reader.result,
        }));
      }
    };
    reader.readAsDataURL(file);

    // Upload file to server
    setUploadingImage(true);
    setError("");

    try {
      const uploadResponse = await uploadFile(file, "user");

      if (uploadResponse.success && uploadResponse.data?.mediaId) {
        if (isEdit) {
          setEditMember((prev) => ({
            ...prev,
            mediaId: uploadResponse.data.mediaId,
          }));
        } else {
          setNewMember((prev) => ({
            ...prev,
            mediaId: uploadResponse.data.mediaId,
          }));
        }
        setSuccess("Image uploaded successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(uploadResponse.message || "Failed to upload image");
      }
    } catch (error) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeProfileImage = (isEdit = false) => {
    if (isEdit) {
      setEditMember((prev) => ({
        ...prev,
        profileImage: null,
        profileImagePreview: null,
        mediaId: null,
      }));
      if (editFileInputRef.current) {
        editFileInputRef.current.value = "";
      }
    } else {
      setNewMember((prev) => ({
        ...prev,
        profileImage: null,
        profileImagePreview: null,
        mediaId: null,
      }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /* ===============================
     FORM HANDLERS
  ================================ */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMember((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user types
    if (newMemberErrors[name]) {
      setNewMemberErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditMember((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user types
    if (editMemberErrors[name]) {
      setEditMemberErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 15) {
      setPhoneNumber(value);
      // Clear phone error when user types
      if (newMemberErrors.phoneNumber) {
        setNewMemberErrors((prev) => ({
          ...prev,
          phoneNumber: "",
        }));
      }
    }
  };

  const resetForm = () => {
    setNewMember({
      firstName: "",
      lastName: "",
      email: "",
      designation: "",
      address: "",
      profileImage: null,
      profileImagePreview: null,
      mediaId: null,
    });
    setNewMemberErrors({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    });
    setCountry("SG");
    setPhoneNumber("");
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetEditForm = () => {
    setEditMember({
      firstName: "",
      lastName: "",
      designation: "",
      address: "",
      profileImage: null,
      profileImagePreview: null,
      mediaId: null,
    });
    setEditMemberErrors({
      firstName: "",
      lastName: "",
    });
    setEditingUser(null);
    setError("");
    setSuccess("");
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  /* ===============================
     VALIDATION FUNCTIONS
  ================================ */
  const validateNewMember = () => {
    const errors = {};

    // First Name validation
    if (!newMember.firstName?.trim()) {
      errors.firstName = "First name is required";
    } else if (newMember.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!newMember.lastName?.trim()) {
      errors.lastName = "Last name is required";
    } else if (newMember.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newMember.email?.trim()) {
      errors.email = "Email address is required";
    } else if (!emailRegex.test(newMember.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone number validation
    const phoneDigits = phoneNumber.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length < 10) {
      errors.phoneNumber = "Please enter a valid phone number (min 10 digits)";
    }

    return errors;
  };

  const validateEditMember = () => {
    const errors = {};

    // First Name validation
    if (!editMember.firstName?.trim()) {
      errors.firstName = "First name is required";
    } else if (editMember.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!editMember.lastName?.trim()) {
      errors.lastName = "Last name is required";
    } else if (editMember.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    return errors;
  };

  /* ===============================
     CREATE TEAM MEMBER
  ================================ */
  const handleCreateMember = async () => {
    const validationErrors = validateNewMember();

    if (Object.keys(validationErrors).length > 0) {
      setNewMemberErrors(validationErrors);
      // Scroll to the first error
      const firstErrorField = document.querySelector(
        '[name="firstName"], [name="lastName"], [name="email"]',
      );
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorField.focus();
      }
      return;
    }

    // Check if image is still uploading
    if (uploadingImage) {
      setError("Please wait for the image to finish uploading");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const phoneDigits = phoneNumber.replace(/\D/g, "");
      const payload = {
        firstName: newMember.firstName.trim(),
        lastName: newMember.lastName.trim(),
        email: newMember.email.trim(),
        countryCode: selectedCountry.callingCode.replace("+", ""),
        phoneNumber: phoneDigits,
        designation: newMember.designation?.trim() || null,
        address: newMember.address?.trim() || null,
        profileImage: newMember.mediaId,
      };

      const response = await createTeamMember(payload);

      if (response.success) {
        setSuccess("Team member added successfully");
        await fetchTeamMembers(false);
        setTimeout(() => {
          setIsAddUserOpen(false);
          resetForm();
          setSuccess("");
        }, 1500);
      } else {
        setError(response.error || "Failed to add team member");
      }
    } catch (error) {
      setError("Failed to add team member");
    }

    setSubmitting(false);
  };

  /* ===============================
     EDIT TEAM MEMBER
  ================================ */
  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditMember({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      designation: user.designation || "",
      address: user.address || "",
      profileImage: null,
      profileImagePreview:
        user.profileImageMetaData?.path || user.profileImage || null,
      mediaId: user.profileImage || null,
    });
    setEditMemberErrors({
      firstName: "",
      lastName: "",
    });
    setIsEditUserOpen(true);
  };

  const handleUpdateMember = async () => {
    const validationErrors = validateEditMember();

    if (Object.keys(validationErrors).length > 0) {
      setEditMemberErrors(validationErrors);
      // Scroll to the first error
      const firstErrorField = document.querySelector(
        '[name="edit-firstName"], [name="edit-lastName"]',
      );
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorField.focus();
      }
      return;
    }

    if (!editingUser?.id) {
      setError("User ID not found");
      return;
    }

    // Check if image is still uploading
    if (uploadingImage) {
      setError("Please wait for the image to finish uploading");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        firstName: editMember.firstName.trim(),
        lastName: editMember.lastName.trim(),
        designation: editMember.designation?.trim() || null,
        address: editMember.address?.trim() || null,
      };

      if (editMember.mediaId) {
        payload.profileImage = editMember.mediaId;
      }

      const response = await updateTeamMember(editingUser.id, payload);

      if (response.success) {
        setSuccess("Team member updated successfully");
        await fetchTeamMembers(false);
        setTimeout(() => {
          setIsEditUserOpen(false);
          resetEditForm();
          setSuccess("");
        }, 1500);
      } else {
        setError(response.error || "Failed to update team member");
      }
    } catch (error) {
      setError("Failed to update team member");
    }

    setSubmitting(false);
  };

  /* ===============================
     RESEND INVITE
  ================================ */
  const handleResendInvite = async (userId) => {
    setSubmitting(true);
    setError("");
    setSuccess("");

    const response = await resendInvite({ userId });

    if (response.success) {
      setSuccess("Invite resent successfully");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(response.error || "Failed to resend invite");
      setTimeout(() => setError(""), 3000);
    }

    setSubmitting(false);
  };

  const StatusBadge = ({ status }) => {
    const statusText = status === 100 ? "Active" : "Inactive";
    const styles = {
      Active: "bg-teal-50 text-teal-700 border-teal-200",
      Inactive: "bg-orange-50 text-orange-700 border-orange-200",
    };

    const icons = {
      Active: <CheckCircle className="w-3 h-3" />,
      Inactive: <Clock className="w-3 h-3" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[statusText]}`}
      >
        {icons[statusText]}
        {statusText}
      </span>
    );
  };

  const RoleBadge = ({ role }) => {
    const roleColors = {
      Admin: "bg-purple-50 text-purple-700 border-purple-200",
      Manager: "bg-blue-50 text-blue-700 border-blue-200",
      Editor: "bg-cyan-50 text-cyan-700 border-cyan-200",
      Viewer: "bg-slate-50 text-slate-700 border-slate-200",
      Support: "bg-amber-50 text-amber-700 border-amber-200",
    };

    const color =
      roleColors[role] || "bg-slate-50 text-slate-700 border-slate-200";

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${color}`}
      >
        {role || "Member"}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
    });
  };

  // Get profile image URL
  const getProfileImageUrl = (user) => {
    if (user.profileImageMetaData?.path) {
      return user.profileImageMetaData.path;
    }
    if (user.profileImage) {
      return user.profileImage;
    }
    return null;
  };

  const countryButtonRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDropdown =
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target);
      const isOutsideButton =
        countryButtonRef.current &&
        !countryButtonRef.current.contains(event.target);

      if (isOutsideDropdown && isOutsideButton) {
        setIsCountryDropdownOpen(false);
        setCountrySearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Loading state - only show on initial load
  if (loading && teamData?.items?.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFB]">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader className="w-8 h-8 text-teal-600 animate-spin" />
              <p className="text-teal-600 font-medium">
                Loading team members...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        {/* ===== HEADER SECTION ===== */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Team Members
            </h1>
            <p className="text-slate-500 font-medium">
              Manage your organization users and permissions
            </p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsAddUserOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all font-bold shadow-lg shadow-teal-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Member
          </button>
        </div>

        {/* ===== SEARCH AND FILTERS BAR ===== */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "table" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                <List className="w-4 h-4" /> Table
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "card" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                <LayoutGrid className="w-4 h-4" /> Cards
              </button>
            </div>
          </div>
        </div>

        {/* ===== TABLE VIEW ===== */}
        {viewMode === "table" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative">
            {tableLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <Loader className="w-6 h-6 text-teal-600 animate-spin" />
              </div>
            )}
            {displayUsers.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <Building2 className="w-12 h-12 text-slate-300" />
                  <p className="text-slate-500 font-medium text-lg">
                    No team members found
                  </p>
                  <p className="text-slate-400 text-sm">
                    Try adjusting your search or add a new team member
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          Member Details
                        </th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          Contact
                        </th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">
                          Location
                        </th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          Role
                        </th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          Status
                        </th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginatedUsers.map((user) => {
                        const profileImageUrl = getProfileImageUrl(user);
                        return (
                          <tr
                            key={user.id}
                            className="hover:bg-teal-50/30 transition-colors"
                          >
                            <td className="px-6 py-5 text-nowrap">
                              <div className="flex items-center gap-4">
                                {profileImageUrl ? (
                                  <img
                                    src={profileImageUrl}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="w-12 h-12 rounded-xl object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <span className="text-white font-bold text-lg">
                                      {user.firstName?.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-bold text-slate-900">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-xs text-slate-500 font-medium">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-nowrap">
                              <span className="text-sm font-medium text-slate-600">
                                {user.countryCode && user.phoneNumber
                                  ? `+${user.countryCode} ${user.phoneNumber}`
                                  : "Not provided"}
                              </span>
                            </td>
                            <td className="px-6 py-5 hidden sm:table-cell text-nowrap">
                              <div className="flex items-center gap-2 text-slate-600">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium">
                                  {user.address || "Not set"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-nowrap">
                              <RoleBadge role={user.designation} />
                            </td>
                            <td className="px-6 py-5 text-nowrap">
                              <StatusBadge status={user.status} />
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditClick(user)}
                                  className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                  title="Edit member"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleResendInvite(user.id)}
                                  disabled={submitting}
                                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Resend invite"
                                >
                                  <Send className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {displayUsers.length > 0 && (
                  <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-sm text-slate-500 font-medium">
                      Showing {startIndex + 1}-{endIndex} of{" "}
                      {displayUsers.length} members
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(totalFilteredPages, p + 1),
                          )
                        }
                        disabled={currentPage === totalFilteredPages}
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== CARD VIEW ===== */}
        {viewMode === "card" && (
          <>
            {displayUsers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Building2 className="w-16 h-16 text-slate-300" />
                  <p className="text-slate-500 font-medium text-lg">
                    No team members found
                  </p>
                  <p className="text-slate-400 text-sm">
                    Try adjusting your search or add a new team member
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  {tableLoading && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                      <Loader className="w-6 h-6 text-teal-600 animate-spin" />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedUsers.map((user) => {
                      const profileImageUrl = getProfileImageUrl(user);
                      return (
                        <div
                          key={user.id}
                          className="bg-white rounded-2xl border border-slate-100 hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 overflow-hidden group"
                        >
                          <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-6">
                            <div className="flex justify-between items-start mb-6">
                              {profileImageUrl ? (
                                <img
                                  src={profileImageUrl}
                                  alt={`${user.firstName} ${user.lastName}`}
                                  className="w-14 h-14 rounded-xl object-cover border-2 border-white/20"
                                />
                              ) : (
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                                  {user.firstName?.charAt(0)}
                                </div>
                              )}
                              <StatusBadge status={user.status} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1 leading-tight">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-teal-50 text-sm font-medium opacity-90">
                              {user.email}
                            </p>
                          </div>
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-6 text-slate-500">
                              <MapPin className="w-4 h-4" />
                              <p className="text-xs font-medium">
                                {user.address || "Not set"}
                              </p>
                            </div>

                            <div className="mb-6">
                              <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-slate-500 uppercase tracking-wider">
                                  Role & Contact
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <RoleBadge role={user.designation} />
                                <span className="text-sm font-medium text-slate-600">
                                  {user.countryCode && user.phoneNumber
                                    ? `+${user.countryCode} ${user.phoneNumber}`
                                    : ""}
                                </span>
                              </div>
                            </div>

                            <div className="mb-6">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                  Last Active
                                </p>
                              </div>
                              <p className="text-sm font-bold text-teal-600">
                                {formatDate(user.updatedAt)}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditClick(user)}
                                className="flex-1 py-3 text-sm font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleResendInvite(user.id)}
                                disabled={submitting}
                                className="flex-1 py-3 text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Send className="w-4 h-4" />
                                Resend
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pagination for Card View */}
                {displayUsers.length > 0 && totalFilteredPages > 1 && (
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-sm text-slate-500 font-medium">
                      Showing {startIndex + 1}-{endIndex} of{" "}
                      {displayUsers.length} members
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(totalFilteredPages, p + 1),
                          )
                        }
                        disabled={currentPage === totalFilteredPages}
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ===== ADD USER SLIDER ===== */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-500 animate-in fade-in"
            onClick={() => {
              setIsAddUserOpen(false);
              resetForm();
            }}
          />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-500 ease-out">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between relative">
              <div className="absolute bottom-0 left-0 h-[2px] w-24 bg-gradient-to-r from-teal-500 to-cyan-500" />
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Add Team Member
                </h2>
                <p className="text-slate-400 text-sm font-medium">
                  Invite new members to your organization
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddUserOpen(false);
                  resetForm();
                }}
                className="group p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all duration-200"
              >
                <Plus className="w-6 h-6 rotate-45 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mx-8 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm font-medium">{success}</p>
              </div>
            )}

            {error && (
              <div className="mx-8 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center space-y-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                  Profile Picture
                </label>

                <div className="relative">
                  {/* Image Preview */}
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
                    {newMember.profileImagePreview ? (
                      <img
                        src={newMember.profileImagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Upload Button with loading state */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className={`absolute bottom-0 right-0 p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors shadow-lg ${
                      uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {uploadingImage ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, false)}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </div>

                {/* Uploading indicator */}
                {uploadingImage && (
                  <p className="text-xs text-teal-600 animate-pulse">
                    Uploading image...
                  </p>
                )}

                {/* Remove Image Button (if image is selected) */}
                {newMember.profileImagePreview && !uploadingImage && (
                  <button
                    type="button"
                    onClick={() => removeProfileImage(false)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove Image
                  </button>
                )}

                <p className="text-xs text-slate-400 text-center">
                  Click the camera icon to upload
                  <br />
                  Max size: 5MB (JPG, PNG, GIF)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={newMember.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. John"
                    className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all font-semibold text-slate-900 ${
                      newMemberErrors.firstName
                        ? "border-red-300 bg-red-50"
                        : "border-slate-100"
                    }`}
                  />
                  {newMemberErrors.firstName && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {newMemberErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={newMember.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Smith"
                    className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all font-semibold text-slate-900 ${
                      newMemberErrors.lastName
                        ? "border-red-300 bg-red-50"
                        : "border-slate-100"
                    }`}
                  />
                  {newMemberErrors.lastName && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {newMemberErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={newMember.email}
                    onChange={handleInputChange}
                    placeholder="john.smith@example.com"
                    className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all font-semibold text-slate-900 ${
                      newMemberErrors.email
                        ? "border-red-300 bg-red-50"
                        : "border-slate-100"
                    }`}
                  />
                  {newMemberErrors.email && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {newMemberErrors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile Number Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  {/* Country Code Selector */}
                  <div className="relative flex-shrink-0">
                    <button
                      ref={countryButtonRef}
                      type="button"
                      onClick={() =>
                        setIsCountryDropdownOpen(!isCountryDropdownOpen)
                      }
                      className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-l-2xl px-3 py-3.5 text-sm text-slate-900 focus:outline-none border-r-0 justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {selectedCountry.flag &&
                          selectedCountry.flag({
                            title: selectedCountry.label,
                            className: "w-5 h-5 rounded-sm object-cover",
                          })}
                        <span className="font-mono font-semibold">
                          {selectedCountry.callingCode}
                        </span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform ${isCountryDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Country Dropdown */}
                    {isCountryDropdownOpen && (
                      <div
                        ref={countryDropdownRef}
                        className="absolute z-50 mt-1 w-80 bg-white border border-teal-100 rounded-xl shadow-lg max-h-96 overflow-hidden"
                      >
                        <div className="p-2 border-b border-teal-100">
                          <input
                            type="text"
                            placeholder="Search country..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-teal-100 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/5"
                            autoFocus
                          />
                        </div>

                        <div className="overflow-y-auto max-h-64">
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((countryItem) => (
                              <button
                                key={countryItem.value}
                                type="button"
                                onClick={() => {
                                  handleCountrySelect(countryItem.value);
                                  setIsCountryDropdownOpen(false);
                                  setCountrySearch("");
                                }}
                                className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm transition-all hover:bg-teal-50 ${
                                  country === countryItem.value
                                    ? "bg-teal-50 text-teal-600 font-medium"
                                    : "text-teal-900"
                                }`}
                              >
                                {countryItem.flag &&
                                  countryItem.flag({
                                    title: countryItem.label,
                                    className:
                                      "w-5 h-5 rounded-sm object-cover flex-shrink-0",
                                  })}
                                <span className="flex-1 text-left truncate">
                                  {countryItem.label}
                                </span>
                                <span className="font-mono text-teal-600 text-xs">
                                  {countryItem.callingCode}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-4 text-center text-teal-500 text-sm">
                              No countries found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    required={true}
                    placeholder="Enter phone number"
                    className={`flex-1 bg-slate-50 border rounded-r-2xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-semibold border-l-0 ${
                      newMemberErrors.phoneNumber
                        ? "border-red-300 bg-red-50"
                        : "border-slate-100"
                    }`}
                  />
                </div>
                {newMemberErrors.phoneNumber && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {newMemberErrors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                  Designation
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="designation"
                    value={newMember.designation}
                    onChange={handleInputChange}
                    placeholder="e.g. Admin"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all font-semibold text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
              <button
                onClick={() => {
                  setIsAddUserOpen(false);
                  resetForm();
                }}
                className="flex-1 py-4 text-slate-500 bg-slate-100 border-slate-200 font-bold rounded-2xl shadow-xl shadow-gray-300 hover:shadow-gray-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMember}
                disabled={submitting || uploadingImage}
                className={`flex-1 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-2xl shadow-xl shadow-teal-600/30 hover:shadow-teal-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 ${
                  submitting || uploadingImage
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : uploadingImage ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Invite Member"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT USER SLIDER ===== */}
      {isEditUserOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-500 animate-in fade-in"
            onClick={() => {
              setIsEditUserOpen(false);
              resetEditForm();
            }}
          />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-500 ease-out">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between relative">
              <div className="absolute bottom-0 left-0 h-[2px] w-24 bg-gradient-to-r from-teal-500 to-cyan-500" />
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Edit Team Member
                </h2>
                <p className="text-slate-400 text-sm font-medium">
                  Update member information
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditUserOpen(false);
                  resetEditForm();
                }}
                className="group p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all duration-200"
              >
                <Plus className="w-6 h-6 rotate-45 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mx-8 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm font-medium">{success}</p>
              </div>
            )}

            {error && (
              <div className="mx-8 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center space-y-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                  Profile Picture
                </label>

                <div className="relative">
                  {/* Image Preview */}
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
                    {editMember.profileImagePreview ? (
                      <img
                        src={editMember.profileImagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Upload Button with loading state */}
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className={`absolute bottom-0 right-0 p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors shadow-lg ${
                      uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {uploadingImage ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>

                  {/* Hidden File Input */}
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, true)}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </div>

                {/* Uploading indicator */}
                {uploadingImage && (
                  <p className="text-xs text-teal-600 animate-pulse">
                    Uploading image...
                  </p>
                )}

                {/* Remove Image Button (if image is selected) */}
                {editMember.profileImagePreview && !uploadingImage && (
                  <button
                    type="button"
                    onClick={() => removeProfileImage(true)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove Image
                  </button>
                )}

                <p className="text-xs text-slate-400 text-center">
                  Click the camera icon to upload
                  <br />
                  Max size: 5MB (JPG, PNG, GIF)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="edit-firstName"
                    value={editMember.firstName}
                    onChange={handleEditInputChange}
                    placeholder="e.g. John"
                    className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all font-semibold text-slate-900 ${
                      editMemberErrors.firstName
                        ? "border-red-300 bg-red-50"
                        : "border-slate-100"
                    }`}
                  />
                  {editMemberErrors.firstName && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {editMemberErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="edit-lastName"
                    value={editMember.lastName}
                    onChange={handleEditInputChange}
                    placeholder="e.g. Smith"
                    className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all font-semibold text-slate-900 ${
                      editMemberErrors.lastName
                        ? "border-red-300 bg-red-50"
                        : "border-slate-100"
                    }`}
                  />
                  {editMemberErrors.lastName && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {editMemberErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={editingUser.email}
                    disabled
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={
                      editingUser.countryCode && editingUser.phoneNumber
                        ? `+${editingUser.countryCode} ${editingUser.phoneNumber}`
                        : ""
                    }
                    disabled
                    className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Phone number cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                  Designation
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="edit-designation"
                    value={editMember.designation}
                    onChange={handleEditInputChange}
                    placeholder="e.g. Admin"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="edit-address"
                    value={editMember.address}
                    onChange={handleEditInputChange}
                    placeholder="123 Business St, City, Country"
                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
              <button
                onClick={() => {
                  setIsEditUserOpen(false);
                  resetEditForm();
                }}
                className="flex-1 py-4 text-slate-500 bg-slate-100 border-slate-200 font-bold rounded-2xl shadow-xl shadow-gray-300 hover:shadow-gray-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateMember}
                disabled={submitting || uploadingImage}
                className={`flex-1 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-2xl shadow-xl shadow-teal-600/30 hover:shadow-teal-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 ${
                  submitting || uploadingImage
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : uploadingImage ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Update Member"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
