
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AddExpense from "@/pages/add-expense";
import Stats from "@/pages/stats";
import Profile from "@/pages/profile";
import Onboarding from "@/pages/onboarding";
import { getProfile } from "@/lib/storage";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const profile = getProfile();
  if (!profile) return <Redirect to="/welcome" />;
  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/welcome" component={Onboarding} />
      <Route path="/">
        {(params) => <ProtectedRoute component={Home} {...params} />}
      </Route>
      <Route path="/add/:id?">
        {(params) => <ProtectedRoute component={AddExpense} {...params} />}
      </Route>
      <Route path="/stats">
        {(params) => <ProtectedRoute component={Stats} {...params} />}
      </Route>
      <Route path="/profile">
        {(params) => <ProtectedRoute component={Profile} {...params} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
