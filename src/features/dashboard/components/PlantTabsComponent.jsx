import { Tab } from "@mui/material";
import { TABS } from "./PlantConstants";
import { CustomTabs } from "./custom-tabs";

export function Tabs({ value, onChange }) {
  return (
    <CustomTabs
      value={value}
      onChange={onChange}
      variant="fullWidth"
      slotProps={{ tab: { px: 0 } }}
    >
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={tab.label}
          icon={tab.icon}
        />
      ))}
    </CustomTabs>
  );
}