import { Tab } from "@mui/material";
import { TABS } from "../Data/constants";
import { CustomTabs } from "../custom-tabs";

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

// export function Tabs2({ value, onChange,locations}) {
// console.log(locations)
//   return (
//     <CustomTabs
//       value={value}
//       onChange={onChange}
//       variant="fullWidth"
//       slotProps={{ tab: { px: 0 } }}
//     >
//       {TABS.map((tab) => (
//         <Tab key={tab.value} value={tab.value} label={tab.value} icon={tab.value} />
//       ))}
//     </CustomTabs>
//   );
// }
