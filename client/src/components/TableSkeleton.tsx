import type {FC} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";

export const TableSkeleton: FC = () => (
  <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-slate-50">
          {[...Array(7)].map((_, i) => (
            <TableHead key={i}>
              <Skeleton className="h-5 w-24" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(10)].map((_, i) => (
          <TableRow key={i} className="hover:bg-slate-50">
            {[...Array(7)].map((_, j) => (
              <TableCell key={j} className="py-4">
                <Skeleton className="h-5 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);