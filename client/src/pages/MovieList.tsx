import { useState, type FC, useEffect } from "react";
import { useGetMovies } from "../utils/api/useGetMovies";
import { Plus, X } from "lucide-react";
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { TableSkeleton } from "@/components/TableSkeleton.tsx";
import { Input } from "@/components/ui/input.tsx";
import type { FilterCondition } from "@/utils/types/FilterCondition.ts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {movieListColumns} from "@/components/movieListColumns.tsx";
import {filterableColumns, getColumnType, getDefaultOperator, operators} from "@/utils/filters.ts";
import {MovieListError} from "@/components/MovieListError.tsx";

const limit = 20;

export const MovieList: FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [activeFilters, setActiveFilters] = useState<FilterCondition[]>([]);
  const [debouncedFilters, setDebouncedFilters] = useState<FilterCondition[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const validFilters = activeFilters.filter(f => f.value !== "");
      setDebouncedFilters(validFilters);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [activeFilters]);

  const { isPending, error, data } = useGetMovies(currentPage, limit, debouncedFilters);
  const totalPages = data ? Math.ceil(data.total_count / limit) : 1;


  const table = useReactTable({
    data: data?.results ?? [],
    columns: movieListColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });


  const addFilter = () => {
    const defaultColumn = filterableColumns[0];
    setActiveFilters([
      ...activeFilters,
      {
        column: defaultColumn.id,
        operator: getDefaultOperator(defaultColumn.id),
        value: "",
      },
    ]);
  };

  const removeFilter = (index: number) => {
    setActiveFilters(activeFilters.filter((_, i) => i !== index));
  };

  const updateFilter = <K extends keyof FilterCondition>(
    index: number,
    key: K,
    value: FilterCondition[K]
  ) => {
    const newFilters = [...activeFilters];
    newFilters[index][key] = value;

    if (key === 'column') {
      newFilters[index].operator = getDefaultOperator(value as string);
    }

    setActiveFilters(newFilters);
  };

  if (error) {
    return <MovieListError error={error} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex flex-col gap-3 mb-6">
              {activeFilters.map((filter, index) => {
                const columnType = getColumnType(filter.column);
                const currentOperators = operators[columnType];

                return (
                  <div key={index} className="flex flex-wrap items-center gap-2">
                    <Select
                      value={filter.column}
                      onValueChange={(val) => updateFilter(index, 'column', val)}
                    >
                      <SelectTrigger className="w-full sm:w-[180px] bg-white">
                        <SelectValue placeholder="Vyberte sloupec" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterableColumns.map(col => (
                          <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                     <Select
                      value={filter.operator}
                      onValueChange={(val) => updateFilter(index, 'operator', val)}
                    >
                      <SelectTrigger className="w-full sm:w-[130px] bg-white">
                        <SelectValue placeholder="Vyberte operátor" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentOperators.map(op => (
                          <SelectItem key={op.id} value={op.id}>{op.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type={columnType === 'numeric' ? 'number' : 'text'}
                      placeholder="Zadejte hodnotu..."
                      value={filter.value}
                      onChange={(e) => updateFilter(index, 'value', e.target.value)}
                      className="w-full sm:w-[200px] bg-white"
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-500 hover:bg-red-50"
                      onClick={() => removeFilter(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}

              <Button
                variant="outline"
                className="self-start"
                onClick={addFilter}
              >
                <Plus className="w-4 h-4 mr-2" />
                Přidat filtr
              </Button>
            </div>

            <div className="text-slate-600">
              {isPending && !data ? (
                  <Skeleton className="h-5 w-32"/>
              ) : (
                  <span>Celkem {data?.total_count.toLocaleString('cs-CZ')} filmů</span>
              )}
            </div>
          </div>
        </div>

        {isPending && !data ? (
            <TableSkeleton/>
        ) : (
            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow
                          key={headerGroup.id}
                          className="hover:bg-slate-50 bg-slate-100/50"
                      >
                        {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="font-semibold text-slate-700">
                              {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3 text-slate-700">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={movieListColumns.length}
                      className="h-24 text-center text-slate-500"
                    >
                      Nebyly nalezeny žádné výsledky.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isPending}
            variant="outline"
            className="disabled:opacity-50"
          >
            Předchozí
          </Button>

          <span className="px-4 text-slate-700">
                Stránka {currentPage} / {totalPages > 0 ? totalPages : 1}
          </span>

          <Button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={!data?.next || isPending}
            variant="outline"
            className="disabled:opacity-50"
          >
            Další
          </Button>
        </div>
      </div>
    </div>
  );
};