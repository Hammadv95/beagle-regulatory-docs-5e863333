import React from "react";
import { Link } from "react-router-dom";

const SiteHeader = () => {
  return (
    <header className="w-full border-b border-border bg-background">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4"
            alt="Beagle Logo"
            className="h-8 w-8"
          />
          <span className="text-lg font-bold text-primary">beagle</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">A Corgi Company</span>
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
