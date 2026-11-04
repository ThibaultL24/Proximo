// src/App.tsx
import { AuthProvider } from "./hooks/use-auth";
import { TerritoryProvider } from "./context/territory-context";
import { AppRouter } from "./app/router";

function App() {
  return (
    <AuthProvider>
      <TerritoryProvider>
        <AppRouter />
      </TerritoryProvider>
    </AuthProvider>
  );
}

export default App;
