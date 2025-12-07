import Link from "next/link";
import "../css/header.css";

export default function Header() {
  return (
    <div className="m-7 flex items-center justify-between">
      <Link href="/" ><div className="flex items-center gap-2">
        <img src="/logo.png" alt="Cropsy Logo" width={30} />
        <h1 className="text-x ">FarmBrain</h1>
      </div>
      </Link>
      <div className="flex items-center gap-6">
        <img src="/icon/mingcute_notification-fill.png" className="icon" />
        <Link href="/Help"><img src="/icon/material-symbols_help-outline.png" className="icon" /></Link>
      </div>
    </div>
  );
}
