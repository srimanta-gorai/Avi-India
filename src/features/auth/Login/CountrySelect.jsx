import { useState } from "react";
import { getCountryCallingCode } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en";

export default function CountrySelect({
  countries,
  value,
  onChange,
  defaultCountry = "SG",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCountry =
    countries.find((c) => c.value === value) ||
    countries.find((c) => c.value === defaultCountry);

  const getFlagEmoji = (countryCode) => {
    return countryCode
      .toUpperCase()
      .replace(/./g, (char) =>
        String.fromCodePoint(127397 + char.charCodeAt()),
      );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-teal-100 rounded-l-xl px-3 py-2.5 text-sm text-teal-950 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all border-r-0 min-w-[120px] justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{getFlagEmoji(selectedCountry.value)}</span>
          <span className="font-mono">{selectedCountry.callingCode}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
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

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-white border border-teal-100 rounded-xl shadow-lg max-h-80 overflow-y-auto">
          <div className="p-2">
            {countries.map((country) => (
              <button
                key={country.value}
                type="button"
                onClick={() => {
                  onChange(country.value);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-all hover:bg-teal-50 ${
                  value === country.value
                    ? "bg-teal-50 text-teal-600 font-medium"
                    : "text-teal-900"
                }`}
              >
                <span className="text-lg">{getFlagEmoji(country.value)}</span>
                <span className="flex-1 text-left truncate">
                  {country.label}
                </span>
                <span className="font-mono text-teal-600 text-xs">
                  {country.callingCode}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
