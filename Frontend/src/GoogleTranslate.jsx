import React, { useEffect, useState } from "react";

const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी" },
    { code: "mr", label: "मराठी" },
];

const GoogleTranslate = () => {
    const [currentLang, setCurrentLang] = useState("en");
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        // Check if already translated
        const match = document.cookie.match(/googtrans=\/en\/(\w+)/);
        if (match) {
            setCurrentLang(match[1]);
        }

        // Load Google Translate script (hidden)
        if (!document.querySelector('script[src*="translate.google.com"]')) {
            window.googleTranslateElementInit = () => {
                if (window.google) {
                    new window.google.translate.TranslateElement(
                        {
                            pageLanguage: "en",
                            includedLanguages: "en,hi,mr",
                            autoDisplay: false,
                        },
                        "google_translate_hidden"
                    );
                    setScriptLoaded(true);
                }
            };

            const script = document.createElement("script");
            script.src =
                "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);
        } else {
            setScriptLoaded(true);
        }
    }, []);

    const handleLanguageChange = (e) => {
        const langCode = e.target.value;
        setCurrentLang(langCode);

        // Try using the Google Translate combo box directly
        const gtCombo = document.querySelector(".goog-te-combo");
        if (gtCombo) {
            gtCombo.value = langCode;
            gtCombo.dispatchEvent(new Event("change"));
            return;
        }

        // Fallback: set cookie and reload
        const domain = window.location.hostname;
        document.cookie = `googtrans=/en/${langCode};path=/;domain=${domain}`;
        document.cookie = `googtrans=/en/${langCode};path=/`;
        window.location.reload();
    };

    return (
        <>
            {/* Hidden container for Google Translate widget */}
            <div
                id="google_translate_hidden"
                style={{ display: "none", position: "absolute", left: "-9999px" }}
            ></div>

            {/* Our custom styled dropdown */}
            <div className="custom-lang-selector">
                <svg
                    className="lang-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                </svg>
                <select
                    value={currentLang}
                    onChange={handleLanguageChange}
                    className="lang-select"
                >
                    {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.label}
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
};

export default GoogleTranslate;