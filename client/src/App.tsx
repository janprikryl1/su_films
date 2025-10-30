import { AppRouter } from "./AppRouter";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "./utils/queryClient.ts";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}

export default App;
