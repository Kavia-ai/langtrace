"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_SIZE, RECIPE_DOCS } from "@/lib/constants";
import { CrewAITrace, processCrewAITrace } from "@/lib/crewai_trace_util";
import { cn } from "@/lib/utils";
import { ArrowTopRightIcon, GearIcon } from "@radix-ui/react-icons";
import {
  BotIcon,
  BrainCircuitIcon,
  ChevronLeftSquareIcon,
  ChevronRightSquareIcon,
  FileIcon,
  RefreshCwIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { toast } from "sonner";
import { TraceComponent } from "../traces/trace-component";
import { ToolsOutputView, ToolsCaptureView, TasksView, ToolsView } from "./agents-view";
import TimelineChart from "./timeline-chart";

export default function AgentKaviaDashboard({ email }: { email: string }) {
  const project_id = useParams()?.project_id as string;
  const [page, setPage] = useState<number>(1);
  const [cachedCurrentPage, setCachedCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentData, setCurrentData] = useState<CrewAITrace[]>([]);
  const [enableFetch, setEnableFetch] = useState(true);
  const [selectedTrace, setSelectedTrace] = useState<CrewAITrace | null>(null);
  const [selectedTraceIndex, setSelectedTraceIndex] = useState<number>(0);

//   useEffect(() => {
//     setEnableFetch(true);
// }, [selectedTrace]); // Add selectedTrace to the dependency array to log whenever it changes

useEffect(() => {
  if (selectedTrace) {
    console.log("Selected Trace:", selectedTrace);
  }
}, [selectedTrace]);

useEffect(() => {
  localStorage.setItem("selectedTraceIndex", selectedTraceIndex.toString()); // Convert number to string for storage
  console.log(selectedTraceIndex);
  
}, [selectedTraceIndex]); // Add selectedTraceIndex to the dependency array

useEffect(() => {
  const storedTraceIndex = localStorage.getItem("selectedTraceIndex");
  if (storedTraceIndex) {
    const index = Number(storedTraceIndex);
    // Make sure index is within bounds of currentData
    if (currentData.length > index) {
      setSelectedTraceIndex(index);
      setSelectedTrace(currentData[index]); // Set selectedTrace based on the index
    }
  }
}, [currentData]); // Dependency on currentData to react to data changes
  
  const fetchOldTraces = () => {
    if (fetchTraces.isRefetching) {
      return;
    }
    if (page <= totalPages) {
      fetchTraces.refetch();
    }
  };

  const fetchTracesCall = useCallback(
    async (pageNum: number) => {
      if (!project_id) return; // Avoid running until project_id is ready
      const apiEndpoint = "/api/traces";

      const body = {
        page: pageNum, // Use the provided pageNum
        pageSize: 1000, // Assume PAGE_SIZE is defined somewhere
        projectId: project_id,
        filters: {
          filters: [
            {
              key: "langtrace.service.version",
              operation: "NOT_EQUALS",
              value: "",
              type: "attribute",
            },
          ],
          operation: "OR",
        },
        group: true,
      };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.message || "Failed to fetch traces");
      }
      return await response.json();
    },
    [project_id]
  );

  const fetchTraces = useQuery({
    queryKey: ["fetch-traces-query", page],
    queryFn: () => fetchTracesCall(page),
    onSuccess: (data) => {
      const newData = data?.traces?.result || [];
      const metadata = data?.traces?.metadata || {};

      const transformedNewData = newData.map((trace: any) => processCrewAITrace(trace));

      if (page === 1) {
        // On the first page, replace currentData with newData
        setCurrentData(transformedNewData);
        setSelectedTrace(transformedNewData[0] || null); // Set the first trace as selected if available
        setSelectedTraceIndex(0); // Reset index to 0
      } else {
        // For subsequent pages, just set currentData with new data
        setCurrentData(transformedNewData);
      }

      // Update page state for next fetch
      setPage((prevPage) => prevPage + 1);
      setEnableFetch(false);
    },
    onError: (error) => {
      setEnableFetch(false);
      toast.error("Failed to fetch traces", {
        description: error instanceof Error ? error.message : String(error),
      });
    },
    refetchOnWindowFocus: false,
    enabled: enableFetch,
  });

  const fetchLatestTraces = () => {
    setPage(1); // Reset to page 1 for latest traces
    setEnableFetch(true); // Enable fetch
  };

  if (fetchTraces.isLoading && currentData.length === 0) {
    return <PageLoading />;
  }


  return (
    <div className="w-full py-6 px-6 flex flex-col gap-3">
      <div className="flex flex-col">
        <div className="flex gap-3 items-center">
          <Image
            alt="KaviaAi Logo"
            src="/kavia.png"
            width={60}
            height={60}
            className={"rounded-md"}
          />
          <p className="text-2xl font-semibold">Kavia Sessions</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Read latest from right to left
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <Button variant="outline" size={"icon"} onClick={fetchLatestTraces}>
            <RefreshCwIcon className="w-4 h-4" />
          </Button>
          <p
            className={cn(
              "text-xs font-semibold",
              fetchTraces.isFetching
                ? "text-orange-500"
                : "text-muted-foreground"
            )}
          >
            {fetchTraces.isFetching
              ? "Fetching sessions..."
              : `Fetched the last ${currentData.length} sessions`}
          </p>
        </div>
        <div className="flex gap-1 items-center">
          <p className="text-xs font-semibold text-muted-foreground">
            Use arrow keys to navigate through traces timeline
          </p>
          <ChevronLeftSquareIcon className="w-6 h-6 text-muted-foreground" />
          <ChevronRightSquareIcon className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
      {(!currentData || currentData.length === 0) && (
        <div className="flex flex-col gap-2 mt-12 w-full items-center justify-center">
          <p className="text-sm font-semibold text-muted-foreground">
            No crew sessions found.
          </p>
          <Link href={RECIPE_DOCS["crewai"]} target="_blank">
            <Button size={"sm"}>
              Learn how to create a crew session
              <ArrowTopRightIcon className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
      {currentData && currentData.length > 0 && (
        <TimelineChart
          setSelectedTrace={setSelectedTrace}
          selectedTrace={selectedTrace}
          selectedTraceIndex={selectedTraceIndex}
          setSelectedTraceIndex={setSelectedTraceIndex}
          data={currentData}
          fetchOldTraces={fetchOldTraces}
          fetchLatestTraces={fetchLatestTraces}
          fetching={fetchTraces.isFetching}
        />
      )}
      {selectedTrace && (
        <>
          <div className="flex gap-3 items-stretch">
            <Card className="w-1/2">
              <CardHeader>
                <CardTitle className="text-xl">Session Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <p className="text-xs font-semibold">STATUS</p>
                <Badge
                  variant={"secondary"}
                  className={cn(
                    "w-fit",
                    selectedTrace?.status === "success"
                      ? "bg-green-600"
                      : "bg-destructive"
                  )}
                >
                  {selectedTrace?.status}
                </Badge>
                <p className="text-xs font-semibold">Trace ID</p>
                <Badge variant={"secondary"} className="w-fit">
                  {selectedTrace?.id || "N/A"}
                </Badge>
                <p className="text-xs font-semibold">START TIME</p>
                <Badge variant={"secondary"} className="w-fit">
                  {selectedTrace?.formatted_start_time || "N/A"}
                </Badge>
                <p className="text-xs font-semibold">TOTAL DURATION</p>
                <Badge variant={"secondary"} className="w-fit">
                  {selectedTrace?.total_duration.toLocaleString()} ms
                </Badge>
              </CardContent>
            </Card>
            <Card className="w-1/4">
              <CardHeader>
                <CardTitle className="text-xl">Usage Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-semibold mt-2">Input</p>
                    {selectedTrace?.input_tokens && (
                      <Badge variant={"secondary"} className="w-fit mt-2">
                        Tokens: {selectedTrace?.input_tokens.toLocaleString()}
                      </Badge>
                    )}
                    {selectedTrace?.input_cost && (
                      <Badge variant={"secondary"} className="w-fit mt-2">
                        Cost: ${selectedTrace?.input_cost.toFixed(4)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-semibold mt-2">Output</p>
                    {selectedTrace?.output_tokens && (
                      <Badge variant={"secondary"} className="w-fit mt-2">
                        Tokens: {selectedTrace?.output_tokens.toLocaleString()}
                      </Badge>
                    )}
                    {selectedTrace?.output_cost && (
                      <Badge variant={"secondary"} className="w-fit mt-2">
                        Cost: ${selectedTrace?.output_cost.toFixed(4)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-semibold mt-2">Total</p>
                    {selectedTrace?.total_tokens && (
                      <Badge variant={"secondary"} className="w-fit mt-2">
                        Tokens: {selectedTrace?.total_tokens.toLocaleString()}
                      </Badge>
                    )}
                    {selectedTrace?.total_cost && (
                      <Badge variant={"secondary"} className="w-fit mt-2">
                        Cost: ${selectedTrace?.total_cost.toFixed(4)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="w-1/4">
              <CardHeader>
                <CardTitle className="text-xl">Libraries Detected</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTrace?.libraries.map((library, i) => {
                  return (
                    <div className="grid grid-cols-2 gap-3" key={i}>
                      <p className="text-xs font-semibold mt-2">
                        {library.name}
                      </p>
                      <Badge variant={"secondary"} className="w-fit mt-2">
                        {library.version}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
          <h1 className="ml-4 text-lg b"  > <b>Agent Name :</b> {selectedTrace?.namespace}</h1>
          <div className="flex gap-3 items-stretch">
            <Card className="w-1/2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-1">
                  <GearIcon className="w-6 h-6" />
                  Tool Details
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 min-h-fit max-h-[500px] overflow-y-scroll">
                {selectedTrace?.tools.length > 0 ? (
                  <ToolsView tools={selectedTrace?.tools} />
                ) : (
                  <p className="text-xs font-semibold">No tools detected</p>
                )}
              </CardContent>
            </Card>
            <Card className="w-1/2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-1">
                <GearIcon className="w-6 h-6" />
                  Tools Capture
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 min-h-fit max-h-[500px] overflow-y-scroll">
                {selectedTrace?.tools_capture.length > 0 ? (
                  <ToolsCaptureView tools_capture={selectedTrace?.tools_capture} />
                ) : (
                  <p className="text-xs font-semibold">No tools capture detected</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 items-stretch">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-1">
                <GearIcon className="w-6 h-6" />
                 Tools Output
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 min-h-fit max-h-[500px] overflow-y-scroll">
                {selectedTrace?.tools_output.length > 0 ? (
                  <ToolsOutputView tools_output={selectedTrace?.tools_output} />
                ) : (
                  <p className="text-xs font-semibold">No tools output detected</p>
                )}
              </CardContent>
            </Card>
        
          </div>
          <TraceComponent trace={selectedTrace} all_trace={currentData}/>
        </>
      )}
    </div>
  );
}

function PageLoading() {
  return (
    <div className="w-full py-6 px-6 flex flex-col gap-3">
      <div className="flex flex-col">
        <div className="flex gap-3 items-center">
          <Image
            alt="CrewAI Logo"
            src="/crewai.png"
            width={60}
            height={30}
            className={"rounded-md"}
          />
          <p className="text-2xl font-semibold">Sessions</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Read latest from right to left
        </p>
      </div>
      <Skeleton className="w-full h-10 rounded-md" />
      <Skeleton className="w-full h-56 rounded-md" />
      <div className="flex gap-3 items-center">
        <Skeleton className="w-1/4 h-56 rounded-md" />
        <Skeleton className="w-1/4 h-56 rounded-md" />
        <Skeleton className="w-1/4 h-56 rounded-md" />
      </div>
      <div className="flex items-center gap-3 justify-between">
        <Skeleton className="w-1/2 h-56 rounded-md" />
        <Skeleton className="w-1/2 h-56 rounded-md" />
      </div>
      <Skeleton className="w-1/2 h-56 rounded-md" />
      <Skeleton className="w-full h-96 rounded-md" />
    </div>
  );
}
