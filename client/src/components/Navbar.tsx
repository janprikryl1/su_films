import type { FC } from "react";
import { Film, Menu } from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Link} from "react-router-dom";

export const Navbar: FC = () => {
  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[90%] mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/">
              <div className="flex items-center gap-2">
                <Film className="w-8 h-8 text-blue-600" />
                <span className="font-bold text-xl">Filmová databáze</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/movie-list">
                Filmy
              </Link>
              <Link to="/clustering">
                Clustering
              </Link>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Menu</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem><Link to="/movie-list">Filmy</Link></DropdownMenuItem>
                  <DropdownMenuItem><Link to="/clustering">Clustering</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
