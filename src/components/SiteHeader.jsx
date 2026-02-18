import React from "react";
import { Link } from "react-router-dom";

const SiteHeader = () => {
  return (
    <header className="w-full border-b border-border bg-background">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://beagleprotected.com/assets/beagle-logo-CcCLgaIr.png"
            alt="Beagle"
            className="h-12"
          />
        </Link>
        <Link
          to="/admin/upload"
          className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          data-testid="header-admin-link"
        >
          Admin
        </Link>
      </div>
    </header>
  );
};

export default SiteHeader;
