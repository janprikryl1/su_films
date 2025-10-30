import type {ColumnDef} from "@tanstack/react-table";
import type {IMovie} from "@/utils/types/IMovie.ts";
import {Button} from "@/components/ui/button.tsx";
import {ArrowUpDown, Star} from "lucide-react";
import {formatCurrency, formatRuntime, getRatingColor} from "@/utils/functions.ts";
import {Badge} from "@/components/ui/badge.tsx";

export const movieListColumns: ColumnDef<IMovie>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Název
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium line-clamp-2 min-w-[200px]">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "release_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Rok
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date: string = row.getValue("release_date");
      return <span>{date ? date.substring(0, 4) : 'N/A'}</span>;
    },
  },
  {
    accessorKey: "runtime",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Délka
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const runtime = row.getValue("runtime");
      return <span>{runtime ? formatRuntime(runtime as number) : 'N/A'}</span>;
    },
  },
  {
    accessorKey: "vote_average",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Hodnocení
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const rating = parseFloat(row.getValue("vote_average"));
      return (
         <div className={`${getRatingColor(rating)} rounded-full px-2 py-1 flex items-center justify-center gap-1 shrink-0 w-fit`}>
            <Star className="w-3 h-3 fill-current" />
            <span className="font-medium">{rating.toFixed(1)}</span>
          </div>
      );
    },
  },
   {
    accessorKey: "vote_count",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Počet hlasů
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const count = row.getValue("vote_count") as number;
      return <span>{count.toLocaleString('cs-CZ')}</span>;
    }
  },
  {
    accessorKey: "budget",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Rozpočet
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const budget = row.getValue("budget") as number;
      return <span>{budget > 0 ? formatCurrency(budget) : 'N/A'}</span>;
    },
  },
  {
    accessorKey: "revenue",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tržby
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const revenue = row.getValue("revenue") as number;
      return <span>{revenue > 0 ? formatCurrency(revenue) : 'N/A'}</span>;
    },
  },
  {
    accessorKey: "popularity",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Popularita
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const popularity = row.getValue("popularity") as number;
      return <span>{popularity.toLocaleString('cs-CZ')}</span>;
    }
  },
  {
    accessorKey: "genres",
    header: "Žánry",
    cell: ({ row }) => {
      const genres: string = row.getValue("genres");
      if (!genres) return null;
      return (
         <div className="flex flex-wrap gap-1">
            {genres.split(',').slice(0, 2).map((genre, idx) => (
              <Badge key={idx} variant="secondary" className="bg-slate-700 text-white border-0 text-xs">
                {genre.trim()}
              </Badge>
            ))}
          </div>
      );
    },
  },
  {
    accessorKey: "spoken_languages",
    header: "Jazyky",
    cell: ({ row }) => {
      const languages: string = row.getValue("spoken_languages");
      if (!languages) return <span>N/A</span>;
      return (
         <div className="flex flex-wrap gap-1">
            {languages.split(',').slice(0, 2).map((lang, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {lang.trim()}
              </Badge>
            ))}
          </div>
      );
    },
  },
];
