import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Box, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import StuddyBuddyAvatar from "../../assets/images/studybuddyAvatar.png"

const NAV_ITEMS = [
  { label: "Home", icon: HomeRoundedIcon, path: "/home" },
  { label: "Assignments", icon: AssignmentOutlinedIcon, path: "/assignments" },
  { label: "Grades", icon: GridViewOutlinedIcon, path: "/grades" },
  { label: "Calendar", icon: CalendarMonthOutlinedIcon, path: "/calendar" },
];

const BOTTOM_ITEMS = [
  { label: "Settings", icon: SettingsOutlinedIcon, path: "/settings" },
  { label: "Calendar", icon: CalendarMonthOutlinedIcon, path: "/calendar" },
];

interface NavItemProps {
  label: string;
  icon: React.ElementType;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ label, icon: Icon, active, onClick }: NavItemProps) => (
  <Box
    onClick={onClick}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 2,
      py: 1,
      borderRadius: 2,
      cursor: "pointer",
      position: "relative",
      color: active ? "text.primary" : "text.secondary",
      bgcolor: active ? "action.selected" : "transparent",
      fontWeight: active ? 600 : 400,
      transition: "background 0.15s, color 0.15s",
      "&:hover": {
        bgcolor: active ? "action.selected" : "action.hover",
        color: "text.primary",
      },
      "&::before": active
        ? {
            content: '""',
            position: "absolute",
            left: 0,
            top: "20%",
            height: "60%",
            width: 3,
            borderRadius: "0 2px 2px 0",
            bgcolor: "#22c55e",
          }
        : {},
    }}
  >
    <Icon sx={{ fontSize: 20, color: active ? "#22c55e" : "inherit" }} />
    <Typography
      fontSize={14}
      fontWeight={active ? 600 : 400}
      color="inherit"
      sx={{ userSelect: "none" }}
    >
      {label}
    </Typography>
  </Box>
);

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: 200,
        minWidth: 200,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        py: 2,
        position: "sticky",
        top: 0,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          mb: 3,
        }}
      >
        {/* Logo placeholder — swap with your <img> or SVG */}
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          <img src={StuddyBuddyAvatar} width={50} height={50}/>
        </Box>
        <Typography fontWeight={700} fontSize={16} color="text.primary">
          StudyBuddy
        </Typography>
      </Box>

      {/* Main nav */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.path}
            label={item.label}
            icon={item.icon}
            active={location.pathname.startsWith(item.path)}
            onClick={() => navigate(item.path)}
          />
        ))}
      </Box>

      {/* Bottom items */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
        {BOTTOM_ITEMS.map((item) => (
          <NavItem
            key={item.path}
            label={item.label}
            icon={item.icon}
            active={location.pathname.startsWith(item.path)}
            onClick={() => navigate(item.path)}
          />
        ))}
      </Box>

      {/* Profile picture placeholder */}
      <Box
        sx={{
          mx: 2,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {/* Swap this Box for an <Avatar src={userPhotoUrl} /> */}
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            bgcolor: "#e2e8f0",
            border: "2px solid",
            borderColor: "divider",
            flexShrink: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            fontSize: 18,
          }}
        >
          👤
        </Box>
        <Box>
          <Typography fontSize={13} fontWeight={600} lineHeight={1.2}>
            {/* Replace with user name */}
            Student
          </Typography>
          <Typography fontSize={11} color="text.secondary" lineHeight={1.2}>
            {/* Replace with user email/role */}
            student@uni.ac.il
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};