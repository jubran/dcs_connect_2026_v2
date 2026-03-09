import React, { useState } from "react";
import useSWR from "swr";
import { Card, CardHeader } from "@mui/material";
import { fetcher } from "src/myApp/utils/axios";
import {
  buildEventsApiUrl,
  processEventsData,
} from "src/myApp/DynamicSearch/services/SearchManager.api";
import SearchForm from "../components/SearchManager.form";
import { useEventsSearch } from "../hooks/SearchManager.useSearch";
import PrintView from "src/myApp/DynamicDashboared/eventsView/PrintView/PrintView";
import SearchResults from "../components/SearchManager.rsults";

const EventsSearchPage = () => {
  const [searchUrl, setSearchUrl] = useState(null);
  const [openPrint, setOpenPrint] = useState(false);

  const {
    searchCriteria,
    updateSearchCriteria,
    executeSearch,
    resetSearch,
    isSearchDisabled,
  } = useEventsSearch();

  const { data: rawData, error, isLoading } = useSWR(searchUrl, fetcher);
  const data = processEventsData(rawData);

  const handleSearch = async () => {
    try {
      const searchParams = {
        startDate: searchCriteria.startDate?.format("YYYY-MM-DD"),
        endDate: searchCriteria.endDate?.format("YYYY-MM-DD"),
        location: searchCriteria.location.trim(),
      };
      const url = buildEventsApiUrl(searchParams);
      setSearchUrl(url);
    } catch (error) {
      alert(`⚠️ ${error.message}`);
    }
  };

  const handleReset = () => {
    resetSearch();
    setSearchUrl(null);
  };

  const handleOpenPrint = () => setOpenPrint(true);
  const handleClosePrint = () => setOpenPrint(false);

  return (
    <Card sx={{ p: 2 }}>
      <CardHeader title="بحث متقدم في الأحداث" />

      <SearchForm
        searchCriteria={searchCriteria}
        onCriteriaChange={updateSearchCriteria}
        onSearch={handleSearch}
        onReset={handleReset}
        isSearchDisabled={isSearchDisabled}
        onOpenPrint={handleOpenPrint}
        hasData={data && data.length > 0}
      />

      <SearchResults
        isLoading={isLoading}
        error={error}
        data={data}
        hasSearched={!!searchUrl}
        searchUrl={searchUrl}
      />

      <PrintView
        open={openPrint}
        onClose={handleClosePrint}
        dataIs={data || []}
        searchCriteria={{
          startDate: searchCriteria.startDate?.format("YYYY-MM-DD"),
          endDate: searchCriteria.endDate?.format("YYYY-MM-DD"),
          location: searchCriteria.location.trim(),
        }}
      />
    </Card>
  );
};

export default EventsSearchPage;
