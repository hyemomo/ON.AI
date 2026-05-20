import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/routes";
import { MantineProvider } from "@mantine/core";
import { theme } from "@/app/theme";

function App() {
  return (
    <MantineProvider theme={theme}>
      <RouterProvider router={router} />
    </MantineProvider>
  );
}

export default App;
