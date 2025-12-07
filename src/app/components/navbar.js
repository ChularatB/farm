"use client";
import Link from "next/link";
import { useState } from "react";
import {
  MdHome,
  MdOutlineHistory,
  MdPerson,
} from "react-icons/md";
import { VscSettingsGear, VscSettings } from "react-icons/vsc";

export default function Navbar() {
  const [active, setActive] = useState(0);

  const tabs = [
    { icon: <MdHome size={26} />, label: "Home", link: "/" },
    { icon: <VscSettings size={26} />, label: "Control", link: "/Control" },
    { icon: <MdOutlineHistory size={26} />, label: "History", link: "/History" },
    { icon: <VscSettingsGear size={26} />, label: "Setting", link: "/Setting" },
    { icon: <MdPerson size={26} />, label: "Profile", link: "/Profile" },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] text-white rounded-3xl px-6 py-3 shadow-xl flex items-center justify-between bg-gradient-to-r from-teal-800 to-teal-200">
      {tabs.map((tab, index) => {
        const content = (
          <>
            <span
              className={`transition-all duration-300 text-black ${
                active === index ? "scale-110 opacity-100 p-1.5 bg-white text-black rounded-xl" : "opacity-70"
              }`}
            >
              {tab.icon}
            </span>

            {active === index && (
              <span className="w-2 h-2 bg-white rounded-full mt-1 animate-bounce" />
            )}
          </>
        );

        return tab.link ? (
          <Link
            href={tab.link}
            key={index}
            className="flex flex-col items-center gap-1 relative"
            onClick={() => setActive(index)}
          >
            {content}
          </Link>
        ) : (
          <button
            key={index}
            onClick={() => setActive(index)}
            className="flex flex-col items-center gap-1 relative"
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
