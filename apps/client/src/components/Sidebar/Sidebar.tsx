import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { Avatar, Box, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import StuddyBuddyAvatar from "../../assets/images/studybuddyAvatar.png";
import { useAuth } from "../../contexts/AuthContext";

const NAV_ITEMS = [
  { label: "בית", icon: HomeRoundedIcon, path: "/home" },
  { label: "מטלות", icon: AssignmentOutlinedIcon, path: "/assignments" },
  { label: "ציונים", icon: GridViewOutlinedIcon, path: "/grades" },
  { label: "לוח שנה", icon: CalendarMonthOutlinedIcon, path: "/calendar" },
  { label: "ייבוא סילבוס", icon: UploadFileOutlinedIcon, path: "/syllabus" },
];

const BOTTOM_ITEMS = [
  { label: "הגדרות", icon: SettingsOutlinedIcon, path: "/settings" },
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

type SidebarProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export const Sidebar = ({ mobile = false, onNavigate }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName = user?.username || "Student";
  const displayEmail = user?.email || "student@uni.ac.il";
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        width: mobile ? 260 : 200,
        minWidth: mobile ? 260 : 200,
        height: mobile ? "100%" : "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: mobile ? "none" : "1px solid",
        borderColor: "divider",
        py: 2,
        position: mobile ? "static" : "sticky",
        top: mobile ? "auto" : 0,
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
          <img
            src={StuddyBuddyAvatar}
            width={50}
            height={50}
            alt="StudyBuddy"
          />
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
            onClick={() => {
              navigate(item.path);
              onNavigate?.();
            }}
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
            onClick={() => {
              navigate(item.path);
              onNavigate?.();
            }}
          />
        ))}
      </Box>

      {/* User details */}
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
        <Avatar
          src={user?.profileImage || undefined}
          sx={{
            width: 36,
            height: 36,
            bgcolor: "#e2e8f0",
            color: "text.secondary",
            border: "2px solid",
            borderColor: "divider",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          {!user?.profileImage ? firstLetter : null}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography fontSize={13} fontWeight={600} lineHeight={1.2} noWrap>
            {displayName}
          </Typography>

          <Typography
            fontSize={11}
            color="text.secondary"
            lineHeight={1.2}
            noWrap
          >
            {displayEmail}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
