import { Link } from "react-router-dom";
import beagleLogo from "@/assets/beagle-logo.png";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center mb-12">
        <img src={beagleLogo} alt="Beagle" className="h-28 mb-4" />
        


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
      </div>
    </div>);

};

export default Home;