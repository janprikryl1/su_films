import { AppRouter } from "./AppRouter";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "./utils/queryClient.ts";

function App() {
  return (
      <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-slate-50">
              <AppRouter/>
          </div>
      </QueryClientProvider>
  );
}

export default App;
