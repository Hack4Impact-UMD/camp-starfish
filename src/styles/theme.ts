import { MantineTheme, MantineThemeOverride, NotificationProps } from "@mantine/core";
import { campStarfishFonts } from "./fonts";

export const theme: MantineThemeOverride = {
  colors: {
    neutral: [
      "#FFFFFF",
      "#FAFAFB",
      "#F0F3F5",
      "#DEE1E3",
      "#C0C6C9",
      "#3B4E57",
      "#2F424C",
      "#1D323D",
      "#1A80D8",
      "#1460A3",
    ],
    blue: [
      "#E6EAEC",
      "#BDC9CF",
      "#9DAFB8",
      "#718A98",
      "#557484",
      "#2B5165",
      "#274A5C",
      "#1F3A48",
      "#182D38",
      "#12222A",
    ],
    orange: [
      "#FEF3E9",
      "#FCD9BA",
      "#FACCA3",
      "#F8AC69",
      "#F69C4C",
      "#F4831F",
      "#DE771C",
      "#AB5C16",
      "#864811",
      "#66370D",
    ],
    green: [
      "#E6F8EF",
      "#B2E9CE",
      "#99E2BF",
      "#59CF96",
      "#39C681",
      "#07B862",
      "#06A759",
      "#058145",
      "#046536",
      "#034D29",
    ],
    aqua: [
      "#EAF9FB",
      "#BDECF2",
      "#9DE3EC",
      "#6BD5E3",
      "#55CEDE",
      "#2BC2D6",
      "#27B1CE",
      "#007F90",
      "#186B76",
      "#12515A",
    ],
    success: [
      "#E9F4EC",
      "#B9DCC3",
      "#98CBA6",
      "#68B37E",
      "#4BA565",
      "#1E8E3E",
      "#1B8138",
      "#15632B",
      "#114E22",
      "#0D3C1A",
    ],
    error: [
      "#FBEAEA",
      "#F1BFBF",
      "#EB9F9F",
      "#E27474",
      "#DC5959",
      "#D32F2F",
      "#C02B2B",
      "#942121",
      "#741A1A",
      "#591414",
    ],
    warning: [
      "#FDF7E6",
      "#FAE6B0",
      "#F8DA8A",
      "#F4C954",
      "#F2BF33",
      "#EFAF00",
      "#D99F00",
      "#A77A00",
      "#836000",
      "#644A00",
    ],
  },
  primaryShade: 5,
  primaryColor: "blue",
  fontFamily: `${campStarfishFonts.join(', ')}, sans-serif`,
  headings: {
    fontFamily: `Lato, sans-serif`,
    fontWeight: '500'
  },
  defaultRadius: "xl",
  cursorType: "pointer",
  components: {
    //theme for general toast component notification 
    Notification: {
      styles: (theme: MantineTheme, props: NotificationProps) => {
        const { variant = 'success' } = props;
        const accent = theme.colors[variant][4];
        return {
          root: {
            backgroundColor: theme.white,
            border: `1px solid ${theme.colors.neutral[3]}`,
            borderRadius: theme.radius.md,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
            padding: '20px 16px',
            height: 90,
          },
          title: {
            fontWeight: 700,
            color: accent,
            fontSize: 18,
          },
          icon: {
            color: variant
          },
          description: {
            color: theme.colors.neutral[5],
            fontWeight: 500,
            fontSize: 14,
          },
          closeButton: {
            color: theme.colors.neutral[6],
          },
        };
      },
      defaultProps: {
        withCloseButton: true,
        withBorder: false,
        closeButtonProps: {
          iconSize: 90
        }
      },
    },
  },
};