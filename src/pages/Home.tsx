import { Link } from "react-router-dom";
import beagleLogo from "@/assets/beagle-logo.png";
import { FileText, HelpCircle, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative" style={{ backgroundColor: '#fffaf4' }}>
      <Link to="/admin" className="absolute top-4 right-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
        Admin
      </Link>
      <div className="flex flex-col items-center mb-12">
        <img src={beagleLogo} alt="Beagle" className="h-36 mb-4" />
        


      </div>

      <div className="w-full max-w-md space-y-4">
        <Link to="/docs">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group border-border/60">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  State Regulatory Policies
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse and search state-level regulatory policy documents.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/docs?type=pms_report_requests">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group border-border/60">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  PMS Report Requests
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse PMS report request documents.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/faq">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group border-border/60">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  FAQs
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Find answers to frequently asked questions.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>);

};

export default Home;