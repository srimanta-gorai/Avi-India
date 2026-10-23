import React, { useState, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin } from 'lucide-react';

export default function SettingsProfilePage() {
  const [formData, setFormData] = useState({
    firstName: 'Sandip',
    lastName: 'Hazra',
    email: 'sandip.hazra@company.com',
    phone: '+91 98765 43210',
    jobTitle: 'Quantity Surveyor',
    company: 'Avi India Construction',
    location: 'India'
  });

  const [profileImage, setProfileImage] = useState(null);

  /* ===============================
     LOAD DATA ON PAGE REFRESH
  ================================ */
  useEffect(() => {
    const savedImage = localStorage.getItem('profileImage');
    const savedUser = JSON.parse(localStorage.getItem('userName'));

    if (savedImage) {
      setProfileImage(savedImage);
    }

    if (savedUser) {
      setFormData(prev => ({
        ...prev,
        firstName: savedUser.firstName || prev.firstName,
        lastName: savedUser.lastName || prev.lastName
      }));
    }
  }, []);

  /* ===============================
     SAVE NAME CHANGES (SYNC TOPBAR)
    ================================ */
  useEffect(() => {
    localStorage.setItem(
      'userName',
      JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName
      })
    );

    window.dispatchEvent(new Event('profile-updated'));
  }, [formData.firstName, formData.lastName]);

  const initials =
    `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase();

  /* ===============================
     INPUT HANDLER
  ================================ */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /* ===============================
     IMAGE UPLOAD HANDLER
  ================================ */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const imageData = event.target.result;

        setProfileImage(imageData);
        localStorage.setItem('profileImage', imageData);

        // 🔥 Notify TopBar instantly
        window.dispatchEvent(new Event('profile-updated'));
      };

      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image under 5MB');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">

        {/* ================= Profile Picture ================= */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Profile Picture
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white">
                  {initials}
                </span>
              </div>
            )}

            <div className="text-center sm:text-left">
              <label
                htmlFor="photo-upload"
                className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-2.5 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
              >
                <Camera size={18} />
                Change Photo
              </label>

              <input
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageUpload}
                className="hidden"
              />

              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* ================= Personal Information ================= */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
          <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />

          <IconInput label="Email Address" icon={Mail} name="email" value={formData.email} onChange={handleInputChange} />
          <IconInput label="Phone Number" icon={Phone} name="phone" value={formData.phone} onChange={handleInputChange} />

          <Input label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} />
          {/* <Input label="Company" name="company" value={formData.company} onChange={handleInputChange} /> */}
          <IconInput label="Location" icon={MapPin} name="location" value={formData.location} onChange={handleInputChange} />

          {/* <div className="md:col-span-2">
            <IconInput label="Location" icon={MapPin} name="location" value={formData.location} onChange={handleInputChange} />
          </div> */}
        </div>

        {/* ================= Actions ================= */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6 sm:mt-8">
          <button className="px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base">
            Cancel
          </button>
          <button className="px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= Reusable Components ================= */

function Input({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
      />
    </div>
  );
}

function IconInput({ label, icon: Icon, name, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          name={name}
          value={value}
          onChange={onChange}
          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
        />
      </div>
    </div>
  );
}
