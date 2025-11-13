"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { useRouter } from '@/i18n/routing';

type Language = {
  code: string;
  name: string;
  nativeName: string;
};

const languages: Language[] = [
  { code: "nl", name: "Nederlands", nativeName: "Nederlands" },
  { code: "en", name: "Engels", nativeName: "English" },
  { code: "ro", name: "Roemeens", nativeName: "Română" },
];

export default function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = (params?.locale as string) || 'nl';
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languages.find(l => l.code === currentLocale) || languages[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lang = languages.find(l => l.code === currentLocale);
    if (lang) {
      setSelectedLanguage(lang);
    }
  }, [currentLocale]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    
    // Remove locale from pathname and add new locale
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';
    router.push(pathWithoutLocale, { locale: language.code });
  };

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="language-switcher__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Selecteer taal"
        aria-expanded={isOpen}
      >
        <Globe size={18} />
        <span className="language-switcher__code">{selectedLanguage.code.toUpperCase()}</span>
        <ChevronDown size={16} className={`language-switcher__chevron ${isOpen ? "is-open" : ""}`} />
      </button>

      {isOpen && (
        <div className="language-switcher__dropdown">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-switcher__option ${selectedLanguage.code === language.code ? "is-active" : ""}`}
              onClick={() => handleLanguageSelect(language)}
            >
              <span className="language-switcher__option-name">{language.nativeName}</span>
              <span className="language-switcher__option-code">{language.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

