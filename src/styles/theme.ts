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
    DatePicker: {
      defaultProps: {
        firstDayOfWeek: 0,

      },
      classNames: {
        calendarHeader: "mb-[20px]",
        calendarHeaderLevel: "!text-[14px] !font-bold text-primary-5",
        weekday: "!text-neutral-5 !font-[600] !text-[14px]  border-none",

        day: `
          !text-[14px] h-[38px] !text-primary-6 !p-[1px]
          hover:bg-primary-0
          data-[selected]:bg-link-0 data-[selected]:text-white
          data-[selected]:hover:bg-primary-6
          data-[in-range]:bg-[rgba(34,139,230,0.2)]
          data-[first-in-range]:!bg-link-0 data-[first-in-range]:!text-white data-[first-in-range]:!rounded-sm 
          data-[last-in-range]:!bg-link-0 data-[last-in-range]:!text-white data-[last-in-range]:!rounded-sm
        `,
        root: "!border !border-primary-5 !rounded-lg !p-2",

      }
    },
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
    TextInput: {
      classNames: {
        input: "bg-primary-0 rounded-md border-none px-3 py-2 text-sm text-neutral-5 placeholder:text-neutral-5 "
      },
      defaultProps: {
        radius: "md",
        size: "sm",
        styles: {
          input: {
            backgroundColor: "#C0C6C9", // neutral.4
            border: 'none', // Remove borders for all text inputs
          },
        },
      },
    },
    DatePickerInput: {
      defaultProps: {
        styles: {
          input: {
            backgroundColor: "#C0C6C9", // neutral.4 (matching TextInput)
            border: 'none', // Remove borders for all date inputs
          },
          // Calendar dropdown styling
          calendarHeaderControl: {
            width: 28,
            height: 28,
            fontSize: 14,
          },
          calendarHeader: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 8,
          },
          calendarHeaderLevel: {
            fontWeight: 600,
            fontSize: "15px",
            textAlign: "center" as const,
            flex: 1,
          },
          day: {
            fontVariantNumeric: "tabular-nums",
            fontFeatureSettings: "'tnum' 1",
            fontFamily: "Inter, sans-serif",
            width: 32,
            height: 32,
            lineHeight: "32px",
            textAlign: "center" as const,
          },
        },
      },
    },
    Button: {
      defaultProps: {
        radius: "xl",
        size: "md",
        styles: {
          root: {
            textTransform: "uppercase" as const,
            fontWeight: 500,
            fontSize: "14px",
          },
        },
      },
    },
    Title: {
      defaultProps: {
        fw: 700,
      },
    },
    Text: {
      defaultProps: {
        fw: 500,
      },
    },
    Radio: {
      defaultProps: {
        styles: {
          radio: {
            width: 16,
            height: 16,
            marginTop: 2,
            '&:checked': {
              backgroundColor: 'var(--mantine-color-blue-filled)',
              borderColor: 'var(--mantine-color-blue-filled)',
            }
          },
          icon: {
            display: 'none' // Hide default white dot for solid bullets
          }
        },
      },
    },

  },
};