import { RouterProvider } from "react-router-dom";
import { router } from "./constants/routes";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
