// import {
//   Box,
//   Paper,
//   Typography,
//   ToggleButtonGroup,
//   ToggleButton,
//   Tooltip,
//   Button,
// } from "@mui/material";
// import SvgColor from "src/components/svg-color";
//

// import LoadingState from "src/myApp/components/LoadingState";
// import ErrorState from "src/myApp/components/ErrorState";
// import DraggableSnackbar from "src/myApp/components/DraggableSnackbar";

// import { useMemo, useState, memo } from "react";
// import { closestCenter, DndContext } from "@dnd-kit/core";
// import DroppableList from "src/myApp/Dynamic-Sequence/sections/SequenceManager.droppableList";
// import SequenceActions from "src/myApp/Dynamic-Sequence/sections/SequenceManager.sequenceActions";
// import SequenceInfo from "src/myApp/Dynamic-Sequence/sections/SequenceManager.sequenceInfo";
// import { useAuthUser } from "src/auth/context/jwt/utils";

// // ميمو للعناصر غير المتغيرة
// const GroupToggleButton = memo(({ group, onClick }) => (
//   <ToggleButton
//     value={group}
//     sx={{ minWidth: 120 }}
//     onClick={() => onClick(group)}>
//     <Tooltip title={<strong>{group}</strong>}>
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-around",
//           width: "100%",
//           textAlign: "center",
//         }}>
//         <strong>{group}</strong>
//       </Box>
//     </Tooltip>
//   </ToggleButton>
// ));

// const SequenceManagerPresentational = ({
//   title,
//   tasks,
//   sensors,
//   snackbar,
//   setSnackbar,
//   isReviewMode,
//   isLoading,
//   error,
//   hasTasks,
//   hasChanges,
//   changedCount,
//   footerText,
//   onDragEnd,
//   onReview,
//   onReset,
//   children,
// }) => {
//   const [activeGroup, setActiveGroup] = useState("all");
//   const [groupedView, setGroupedView] = useState(false);
//   const [activeToggle, setActiveToggle] = useState("normalView");
//   const { fullName, role } = useAuthUser();

//   // استخراج المجموعات الفريدة مع التخزين المؤقت
//   const { uniqueGroups, groupCounts } = useMemo(() => {
//     const groups = [...new Set(tasks.map((task) => task.group))];
//     const counts = {};

//     groups.forEach((group) => {
//       counts[group] = tasks.filter((t) => t.group === group).length;
//     });

//     return {
//       uniqueGroups: ["all", ...groups.sort()],
//       groupCounts: counts,
//     };
//   }, [tasks]);

//   // تصفية المهام حسب المجموعة النشطة
//   const filteredTasks = useMemo(() => {
//     if (activeGroup === "all") return tasks;
//     return tasks.filter((task) => task.group === activeGroup);
//   }, [tasks, activeGroup]);

//   // تجميع المهام إذا كان groupedView = true
//   const groupedTasks = useMemo(() => {
//     if (!groupedView || activeGroup !== "all") return [];

//     const groups = {};
//     filteredTasks.forEach((task) => {
//       if (!groups[task.group]) groups[task.group] = [];
//       groups[task.group].push(task);
//     });

//     return Object.entries(groups)
//       .map(([group, items]) => ({
//         group,
//         items,
//       }))
//       .sort((a, b) => a.group.localeCompare(b.group));
//   }, [filteredTasks, groupedView, activeGroup]);

//   const handleToggleChange = (e, newValue) => {
//     if (!newValue) return;

//     setActiveToggle(newValue);

//     if (newValue === "groupedView") {
//       setGroupedView(true);
//       setActiveGroup("all");
//     } else if (newValue === "normalView") {
//       setGroupedView(false);
//       setActiveGroup("all");
//     } else {
//       // مجموعة محددة
//       setGroupedView(false);
//       setActiveGroup(newValue);
//     }
//   };

//   // تحقق إذا كان يجب عرض زر المجموعتين
//   const shouldShowGroupedButton = tasks.length !== 6;

//   // استخراج المجموعات للإظهار (استبعاد BOP-29)
//   const displayGroups = useMemo(
//     () => uniqueGroups.filter((group) => group !== "all" && group !== "BOP-29"),
//     [uniqueGroups]
//   );

//   if (isLoading) return <LoadingState message="جارٍ تحميل البيانات..." />;
//   if (error) return <ErrorState message={error.message} />;

//   return (
//     <Box sx={{ width: "80%", mx: "auto", mt: 4 }}>
//       <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
//         <Typography variant="h5" align="center" sx={{ mb: 2 }}>
//           {isReviewMode ? "📋 مراجعة الترتيب الجديد" : title}
//         </Typography>

//         {!isReviewMode ? (
//           <>
//             <SequenceInfo
//               totalTasks={tasks.length}
//               changedTasks={tasks.filter((t) => t.changed).length}
//               activeGroup={activeGroup}
//               groupedView={groupedView}
//             />

//             <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
//               <ToggleButtonGroup
//                 value={activeToggle}
//                 exclusive
//                 onChange={handleToggleChange}
//                 sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//                 {/* زر عرض عادي */}
//                 <ToggleButton value="normalView" sx={{ minWidth: 120 }}>
//                   <Tooltip title={`عرض جميع ${title} في قائمة واحدة`}>
//                     <Box
//                       sx={{
//                         display: "flex",
//                         justifyContent: "center",
//                         width: "100%",
//                       }}>
//                       {tasks.length !== 6 ? `دمج ${title} وترتيبها` : title}
//                     </Box>
//                   </Tooltip>
//                 </ToggleButton>

//                 {/* زر عرض مجمع */}
//                 {shouldShowGroupedButton && (
//                   <ToggleButton value="groupedView" sx={{ minWidth: 120 }}>
//                     <Tooltip title="عرض كل مجموعة في قسم منفصل">
//                       <Box
//                         sx={{
//                           display: "flex",
//                           justifyContent: "center",
//                           width: "100%",
//                         }}>
//                         مجموعتين
//                       </Box>
//                     </Tooltip>
//                   </ToggleButton>
//                 )}

//                 {/* أزرار المجموعات الفردية */}
//                 {displayGroups.map((group) => (
//                   <GroupToggleButton
//                     key={group}
//                     group={group}
//                     onClick={(group) => handleToggleChange(null, group)}
//                   />
//                 ))}
//               </ToggleButtonGroup>
//             </Box>

//             {/* Action Buttons */}
//             <SequenceActions
//               hasTasks={hasTasks}
//               hasChanges={hasChanges}
//               onReview={onReview}
//               onReset={onReset}
//               userAuth={role}
//             />

//             <DndContext
//               sensors={sensors}
//               collisionDetection={closestCenter}
//               onDragEnd={onDragEnd}>
//               {groupedView && activeGroup === "all" ? (
//                 groupedTasks.map(({ group, items }) => (
//                   <Box key={group} sx={{ mb: 4 }}>
//                     <Paper
//                       elevation={0}
//                       sx={{
//                         p: 1,
//                         mb: 2,
//                         backgroundColor: "grey.50",
//                         borderLeft: 4,
//                         borderColor: "primary.main",
//                         borderRadius: "12px 0 0 12px",
//                       }}>
//                       <Typography variant="" color="GrayText" display={'flex'} fontWeight={600}>
//                         <strong
//                           style={{
//                             display: "flex",
//                             justifyContent: "space-between",
//                             alignItems: "baseline",
//                             width: "100px",
//                           }}>
//                           <SvgColor  src="/assets/icons/" icon="pajamas:work-item-task" /> {group}{" "}
//                         </strong>

//                       </Typography>
//                     </Paper>

//                     <DroppableList tasks={items} groupId={group} />
//                   </Box>
//                 ))
//               ) : (
//                 <DroppableList tasks={filteredTasks} />
//               )}
//             </DndContext>

//             <Box
//               sx={{
//                 mt: 3,
//                 pt: 2,
//                 borderTop: 1,
//                 borderColor: "divider",
//                 display: "flex",
//                 justifyContent: "space-between",
//               }}>
//               <Typography variant="body2" color="text.secondary" >
//                 {footerText}
//               </Typography>
//               <Typography variant="body2" color="text.secondary" >
//                 عدد العناصر : <strong> {tasks.length} </strong>
//               </Typography>
//             </Box>
//           </>
//         ) : (
//           // عرض وضع المراجعة
//           <Box sx={{ mt: 2 }}>{children}</Box>
//         )}

//         <DraggableSnackbar
//           open={snackbar.open}
//           message={snackbar.message}
//           onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
//         />
//       </Paper>
//     </Box>
//   );
// };

// export default memo(SequenceManagerPresentational);
