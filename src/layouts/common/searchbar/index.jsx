import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import { memo, useState, useCallback } from "react";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Dialog, { dialogClasses } from "@mui/material/Dialog";

import { useRouter } from "src/routes/hooks";

import Label from "src/components/label";
import SvgColor from "src/components/svg-color";

import Scrollbar from "src/components/scrollbar";
import SearchNotFound from "src/components/search-not-found";

import ResultItem from "./result-item";
import { useNavData } from "../../dashboard/config-navigation";
import { applyFilter, groupedData, getAllItems } from "./utils";
import { useBoolean } from "src/myApp/hooks/use-boolean";
import { useResponsive } from "src/myApp/hooks/use-responsive";
import { useEventListener } from "src/myApp/hooks/use-event-listener";

// ----------------------------------------------------------------------

function Searchbar() {
  const theme = useTheme();

  const router = useRouter();

  const search = useBoolean();

  const lgUp = useResponsive("up", "lg");

  const [searchQuery, setSearchQuery] = useState("");

  const navData = useNavData();

  const handleClose = useCallback(() => {
    search.onFalse();
    setSearchQuery("");
  }, [search]);

  const handleKeyDown = (event) => {
    if (event.key === "k" && event.metaKey) {
      search.onToggle();
      setSearchQuery("");
    }
  };

  useEventListener("keydown", handleKeyDown);

  const handleClick = useCallback(
    (path) => {
      if (path.includes("http")) {
        window.open(path);
      } else {
        router.push(path);
      }
      handleClose();
    },
    [handleClose, router],
  );

  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const dataFiltered = applyFilter({
    inputData: getAllItems({ data: navData }),
    query: searchQuery,
  });

  const notFound = searchQuery && !dataFiltered.length;

  const renderItems = () => {
    const data = groupedData(dataFiltered);

    return Object.keys(data)
      .sort((a, b) => -b.localeCompare(a))
      .map((group, index) => (
        <List key={group || index} disablePadding>
          {data[group].map((item) => {
            const { title, path } = item;

            const partsTitle = parse(title, match(title, searchQuery));

            const partsPath = parse(path, match(path, searchQuery));

            return (
              <ResultItem
                path={partsPath}
                title={partsTitle}
                key={`${title}${path}`}
                groupLabel={searchQuery && group}
                onClickItem={() => handleClick(path)}
              />
            );
          })}
        </List>
      ));
  };

  const renderButton = (
    <Stack direction="row" alignItems="center">
      <IconButton onClick={search.onTrue}>
        <SvgColor src="/assets/icons/components/ic_search.svg" />
      </IconButton>

      {lgUp && (
        <Label sx={{ px: 0.75, fontSize: 12, color: "text.secondary" }}>
          ⌘
        </Label>
      )}
    </Stack>
  );

  return (
    <>
      {renderButton}

      <Dialog
        fullWidth
        maxWidth="sm"
        open={search.value}
        onClose={handleClose}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: 0,
        }}
        PaperProps={{
          sx: {
            mt: 15,
            overflow: "unset",
          },
        }}
        sx={{
          [`& .${dialogClasses.container}`]: {
            alignItems: "flex-start",
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}>
          <InputBase
            fullWidth
            autoFocus
            placeholder="الوصول السريع . . ."
            value={searchQuery}
            onChange={handleSearch}
            startAdornment={
              <InputAdornment position="start">
                <SvgColor
                  src="/assets/icons/components/ic_search.svg"
                  width={24}
                  sx={{ color: "text.disabled" }}
                />
              </InputAdornment>
            }
            endAdornment={
              <Label sx={{ letterSpacing: 1, color: "text.secondary" }}>
                esc
              </Label>
            }
            inputProps={{
              className: "custom-textarea",
            }}
          />
        </Box>

        <Scrollbar sx={{ p: 3, pt: 2, height: 400 }}>
          {notFound ? (
            <SearchNotFound query={searchQuery} sx={{ py: 10 }} />
          ) : (
            renderItems()
          )}
        </Scrollbar>
      </Dialog>
    </>
  );
}

export default memo(Searchbar);
