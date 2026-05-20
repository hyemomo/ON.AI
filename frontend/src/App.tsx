import { RouterProvider } from "react-router-dom";
import { router } from "./constants/routes";
import { MantineProvider } from "@mantine/core";
import { theme } from "@/app/theme";

function App() {
  return (
    <MantineProvider theme={theme}>
      {" "}
      <RouterProvider router={router} />
    </MantineProvider>
  );
}

export default App;
