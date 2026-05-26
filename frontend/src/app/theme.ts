import { createTheme } from "@mantine/core";
import { border, coralScale, shadow, surface, text } from "@/tokens/color";

export const theme = createTheme({
  colors: {
    coral: coralScale,
  },

  primaryColor: "coral",
  primaryShade: 5,

  fontFamily: "'Plus Jakarta Sans', 'Apple SD Gothic Neo', sans-serif",
  defaultRadius: "md",

  components: {
    Card: {
      defaultProps: {
        radius: "lg",
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: border.default,
          boxShadow: shadow.card,
          backgroundColor: surface.white,
          transition: "all 160ms ease-out",

          "&:hover": {
            borderColor: border.strong,
            boxShadow: shadow.cardHover,
            transform: "translateY(-1px)",
          },
        },
      },
    },

    Button: {
      styles: {
        root: {
          fontWeight: 600,
          transition: "all 160ms ease-out",
        },
      },
    },

    Badge: {
      defaultProps: {
        radius: "xl",
      },
    },

    TextInput: {
      styles: {
        input: {
          borderColor: border.default,
          backgroundColor: surface.white,
          fontSize: 15,

          "&:focus": {
            borderColor: coralScale[3],
          },

          "&::placeholder": {
            color: text.muted,
          },
        },
      },
    },

    Textarea: {
      styles: {
        input: {
          borderColor: border.default,
          backgroundColor: surface.white,

          "&:focus": {
            borderColor: coralScale[3],
          },

          "&::placeholder": {
            color: text.muted,
          },
        },
      },
    },

    Select: {
      styles: {
        input: {
          borderColor: border.default,
          backgroundColor: surface.white,

          "&:focus": {
            borderColor: coralScale[3],
          },

          "&::placeholder": {
            color: text.muted,
          },
        },
      },
    },
  },
});
