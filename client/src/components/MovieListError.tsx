import type {FC} from "react";

type Props = {
    error: Error;
}

export const MovieListError:FC<Props> = ({error}) => {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-red-600 bg-red-50 border border-red-200 p-6 rounded-lg">
          Chyba při načítání dat: {error.message}
        </div>
      </div>
    );
}