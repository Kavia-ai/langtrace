import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CrewAITrace } from "@/lib/crewai_trace_util";
import { cn } from "@/lib/utils";
import { CircularProgress } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis } from "recharts";

const chartConfig = {
  start_time: {
    label: "start time",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function TimelineChart({
  data,
  fetchOldTraces,
  fetchLatestTraces,
  fetching,
  setSelectedTrace,
  selectedTrace,
  selectedTraceIndex,
  setSelectedTraceIndex,
}: {
  data: CrewAITrace[];
  fetchOldTraces: () => void;
  fetchLatestTraces: () => void;
  fetching: boolean;
  setSelectedTrace: (trace: CrewAITrace) => void;
  selectedTrace: CrewAITrace | null;
  selectedTraceIndex: number | null;
  setSelectedTraceIndex: (index: number) => void;
}) {
  const barSize = 20;
  const barGap = 4;
  const groupGap = 20;
  const totalGroups = data.length;
  const [style, setStyle] = useState({ width: "200px", height: "200px" });

  useEffect(() => {
    const width = totalGroups * (barSize + groupGap);
    setStyle({ width: `${width}px`, height: "200px" });
  }, [totalGroups]);

  // Initialize selectedTraceIndex to 0 if it's null
  useEffect(() => {
    if (selectedTraceIndex === null && data.length > 0) {
      setSelectedTraceIndex(0);
      setSelectedTrace(data[0]);
    }
  }, [selectedTraceIndex, data, setSelectedTraceIndex, setSelectedTrace]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedTraceIndex === null) return;
      if (e.key === "ArrowRight") {
        handleNextTrace();
      } else if (e.key === "ArrowLeft") {
        handlePreviousTrace();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTraceIndex, data]);

  const handlePreviousTrace = () => {
    if (selectedTraceIndex !== null && selectedTraceIndex > 0) {
      const newIndex = selectedTraceIndex - 1;
      setSelectedTrace(data[newIndex]);
      setSelectedTraceIndex(newIndex);
      localStorage.setItem("selectedTraceIndex", newIndex.toString());
    }
  };

  const handleNextTrace = () => {
    if (selectedTraceIndex !== null && selectedTraceIndex < data.length - 1) {
      const newIndex = selectedTraceIndex + 1;
      setSelectedTrace(data[newIndex]);
      setSelectedTraceIndex(newIndex);
      localStorage.setItem("selectedTraceIndex", newIndex.toString());
    }
  };

  return (
    <Card className="flex items-center relative">
      <Button
        className="h-[230px] shadow-md"
        disabled={fetching || selectedTraceIndex === null || selectedTraceIndex === data.length - 1}
        variant={"ghost"}
        onClick={handleNextTrace} // Updated to handleNextTrace
      >
        {!fetching ? (
          <ChevronLeft size={16} />
        ) : (
          <CircularProgress className="text-primary-foreground" size={16} />
        )}
      </Button>
      <CardContent className="overflow-x-auto">
        <ChartContainer
          style={style}
          config={chartConfig}
          className="h-[200px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
            barSize={barSize}
            barGap={barGap}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="formatted_start_time"
              tickLine={true}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(-8)}
              reversed
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="total_duration">
              {data.map((entry, index) => (
                <Cell
                  onClick={() => {
                    setSelectedTrace(entry);
                    setSelectedTraceIndex(index);
                    localStorage.setItem("selectedTraceIndex", index.toString());
                  }}
                  radius={4}
                  className={cn(
                    "hover:cursor-pointer hover:fill-orange-600",
                    selectedTrace?.id === entry.id
                      ? "fill-orange-600"
                      : "fill-blue-600"
                  )}
                  key={entry.id || index} // Use unique key
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <Button
        variant={"secondary"}
        className="h-[230px] shadow-md"
        disabled={fetching || selectedTraceIndex === null || selectedTraceIndex === 0}
        onClick={handlePreviousTrace} // Updated to handlePreviousTrace
      >
        {!fetching ? (
          <ChevronRight size={16} />
        ) : (
          <CircularProgress className="text-primary-foreground" size={16} />
        )}
      </Button>
    </Card>
  );
}
