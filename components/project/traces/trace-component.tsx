import ConversationView from "@/components/shared/conversation-view";
import LanggraphView from "@/components/shared/langgraph-view";
import TraceGraph, { AttributesTabs } from "@/components/traces/trace_graph";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CrewAITrace } from "@/lib/crewai_trace_util";
import { Trace } from "@/lib/trace_util";
import {
  calculateTotalTime,
  convertTracesToHierarchy,
} from "@/lib/trace_utils";
import { cn, getVendorFromSpan } from "@/lib/utils";
import { ChevronLeft, ChevronRight, CodeIcon, MessageCircle, NetworkIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function TraceComponent({ trace , all_trace}: { trace: CrewAITrace , all_trace: CrewAITrace[];}) {
  const [selectedTrace, setSelectedTrace] = useState<any[]>(trace.trace_hierarchy);
  // const [allcurrentTrace, setallcurrentTrace] = useState<any[]>(
  //   all_trace.map((trace) => trace.trace_hierarchy).flat()
  // );
  const [allcurrentTrace, setAllCurrentTrace] = useState<any[]>([]);

  // const [selectedVendors, setSelectedVendors] = useState<string[]>(trace.vendors );
  const [selectedVendors, setSelectedVendors] = useState<string[]>(trace.vendors);

  const [includesLanggraph, setIncludesLanggraph] = useState<boolean>(false);
  const [spansView, setSpansView] = useState<"SPANS" | "ATTRIBUTES" | "CONVERSATION" | "LANGGRAPH">("SPANS");
  const [span, setSpan] = useState<any | null>(null);
  const [attributes, setAttributes] = useState<any | null>(null);
  const [events, setEvents] = useState<any | null>(null);


  const gotoplayground = () => {
    const urlPath = window.location.pathname;
    const pathSegments = urlPath.split('/');
    
    // Extract the project ID from the URL (3rd segment)
    const projectId = pathSegments[2];
    
    // Extract trace_id and span_id from the first trace in trace_hierarchy
    const traceId = trace.trace_hierarchy[0]?.trace_id;
    const spanId = trace.trace_hierarchy[0]?.span_id;
    
    // Construct the new URL with the query parameters
    const playgroundUrl = `/project/${projectId}/playground?projectId=${projectId}&traces=${traceId}&spanId=${spanId}`;
    
    // Navigate to the playground URL
    window.location.href = playgroundUrl;
  };
 
  useEffect(() => {
    setSelectedTrace(trace.trace_hierarchy);
    setSelectedVendors(trace.vendors);
    console.log(selectedVendors);
    if (trace.vendors.includes("langgraph")) setIncludesLanggraph(true);
    setAllCurrentTrace(combineTraces(all_trace)); // Use the combine function to set allcurrentTrace
    if (!open) setSpansView("SPANS");
  }, [trace, open]);


  const combineTraces = (traces: CrewAITrace[]): any[] => {
    const flattenedTraces = traces.map((trace) => trace.trace_hierarchy).flat();
    const combined: any[] = [];

    for (let i = 0; i < flattenedTraces.length; i++) {
      const currentTrace = flattenedTraces[i];

      // If it's the first trace or the name is different from the last one, add it to combined
      if (i === 0 || currentTrace.name !== flattenedTraces[i - 1].name) {
        combined.push({ ...currentTrace, children: [...(currentTrace.children || [])] });
      } else {
        // If the name is the same as the last one, accumulate children
        const lastCombinedTrace = combined[combined.length - 1];
        lastCombinedTrace.children.push(...(currentTrace.children || []));
      }
    }

    return combined;
  };

  
  return (
    <div className="flex md:flex-row flex-col items-stretch w-full">
      <div
        className={cn(
          "flex flex-col border border-muted rounded-md p-4",
          spansView !== "SPANS" ? "md:w-1/2 md:border-r-0 md:rounded-tr-none md:rounded-br-none w-full" : "w-full"
        )}
      >
        <p className="text-xl font-semibold mb-2">Session Drilldown</p>
        <div>
          <SpansView
            trace={trace}
            allcurrentTrace={allcurrentTrace}
            selectedTrace={selectedTrace}
            setSelectedTrace={setSelectedTrace}
            selectedVendors={selectedVendors}
            setSelectedVendors={setSelectedVendors}
            setSpansView={setSpansView}
            setSpan={setSpan}
            setAttributes={setAttributes}
            setEvents={setEvents}
          />
        </div>
      </div>
      {(spansView === "ATTRIBUTES" || spansView === "CONVERSATION" || spansView === "LANGGRAPH") &&
        span &&
        attributes &&
        events && (
          <div className="md:pl-2 flex flex-col gap-3 md:w-1/2 w-full md:border-l-2 md:rounded-tl-none md:rounded-bl-none border border-muted rounded-md p-2">
            <div className="flex gap-2 items-center justify-end w-full">
              {/* <Button size={"sm"} variant={"ghost"} 
              // onClick={handlePreviousTrace} 
              // disabled={!trace.previousTrace}
              >
                <ChevronLeft size={16} className="mr-2" />
              </Button>
              <Button size={"sm"} variant={"ghost"} 
              // onClick={handleNextTrace} 
              // disabled={!trace.nextTrace}
              >
                <ChevronRight size={16} className="mr-2" />
              </Button> */}
              <Button
                className="w-fit bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                size={"sm"}
                variant={"secondary"}  // Changed from "outline" to "secondary"
                onClick={gotoplayground}  // Attach the gotoplayground function
              >
                Go to Playground
              </Button>

              <Button
                className="w-fit"
                size={"sm"}
                variant={"outline"}
                disabled={spansView === "ATTRIBUTES"}
                onClick={() => setSpansView("ATTRIBUTES")}
              >
                <CodeIcon size={16} className="mr-2" />
                Attributes
              </Button>
              <Button
                className="w-fit"
                size={"sm"}
                variant={"outline"}
                disabled={spansView === "CONVERSATION"}
                onClick={() => setSpansView("CONVERSATION")}
              >
                <MessageCircle size={16} className="mr-2 fill-primary" />
                LLM Conversations
              </Button>
              {includesLanggraph && (
                <Button className="w-fit" variant={"secondary"} onClick={() => setSpansView("LANGGRAPH")}>
                  <NetworkIcon size={16} className="mr-2" />
                  Langgraph
                </Button>
              )}
              <Button className="w-fit" size={"sm"} variant={"destructive"} onClick={() => setSpansView("SPANS")}>
                <XIcon size={16} />
              </Button>
            </div>
            <div className={cn(spansView === "CONVERSATION" ? "" : "overflow-y-scroll h-[90vh]", "mt-12")}>
              {spansView === "ATTRIBUTES" && (
                <AttributesTabs span={span} attributes={attributes} events={events} />
              )}
              {spansView === "CONVERSATION" && span && (
                <ConversationView className="py-6 h-[85vh]" span={span} />
              )}
              {spansView === "LANGGRAPH" && <LanggraphView trace={trace.sorted_trace} />}
            </div>
          </div>
        )}
    </div>
  );
}

function SpansView({
  trace,
  selectedTrace,
  allcurrentTrace,
  setSelectedTrace,
  selectedVendors,
  setSelectedVendors,
  setSpansView,
  setSpan,
  setAttributes,
  setEvents,
}: {
  trace: Trace;
  selectedTrace: any[];
  allcurrentTrace: any[];
  setSelectedTrace: (trace: any[]) => void;
  selectedVendors: string[];
  setSelectedVendors: (vendors: string[]) => void;
  setSpansView: (spansView: "SPANS" | "ATTRIBUTES" | "CONVERSATION" | "LANGGRAPH") => void;
  setSpan: (span: any) => void;
  setAttributes: (attributes: any) => void;
  setEvents: (events: any) => void;
}) {
  const [isGroupView, setIsGroupView] = useState<boolean>(false);

  return (
    <>
      <div className="flex flex-col gap-3 pb-3">
        <ul className="flex flex-col gap-2">
          <li className="text-xs font-semibold text-muted-foreground">
            Tip 1: Hover over any span line to see additional attributes and events. Attributes contain the request parameters and events contain logs and errors.
          </li>
          <li className="text-xs font-semibold text-muted-foreground">
            Tip 2: Click on attributes or events to copy them to your clipboard.
          </li>
        </ul>

        <div className="flex gap-2 items-center flex-wrap">
        {["Group View", ...trace.vendors].map((vendor, i) => (
            <div className="flex items-center space-x-2 py-3" key={i}>
              <Checkbox
                id={vendor}
                checked={vendor === "Group View" ? isGroupView : selectedVendors.includes(vendor)}
                onCheckedChange={(checked) => {
                  if (vendor === "Group View") {
                    // Use type assertion or checks here to ensure correct handling of CheckedState
                    const isChecked = checked === true; // Handle the boolean state directly
                    setIsGroupView(isChecked); // Update the Group View state

                    if (isChecked) {
                      setSelectedTrace(allcurrentTrace); // Show all traces when checked
                    } else {
                      // Show selected traces when unchecked
                      const updatedVendors = checked
                      ? [...selectedVendors, vendor]
                      : selectedVendors.filter((v) => v !== vendor);
                    setSelectedVendors(updatedVendors);

                    // Filter traces based on selected vendors
                    const filteredTraces = trace.sorted_trace.filter((span) =>
                      updatedVendors.includes(getVendorFromSpan(span))
                    );

                    setSelectedTrace(
                      updatedVendors.length === trace.vendors.length
                        ? trace.trace_hierarchy
                        : convertTracesToHierarchy(filteredTraces)
                    );
                    }
                  } else {
                    const updatedVendors = checked
                      ? [...selectedVendors, vendor]
                      : selectedVendors.filter((v) => v !== vendor);
                    setSelectedVendors(updatedVendors);

                    // Filter traces based on selected vendors
                    const filteredTraces = trace.sorted_trace.filter((span) =>
                      updatedVendors.includes(getVendorFromSpan(span))
                    );

                    setSelectedTrace(
                      updatedVendors.length === trace.vendors.length
                        ? trace.trace_hierarchy
                        : convertTracesToHierarchy(filteredTraces)
                    );
                  }
                }}
              />
              <label htmlFor={vendor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {vendor}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-x-scroll pb-12">
        <TraceGraph
          spans={selectedTrace}
          allspans={allcurrentTrace}
          totalSpans={trace.sorted_trace.length}
          totalTime={calculateTotalTime(trace.sorted_trace)}
          startTime={trace.start_time.toString()}
          setSpansView={setSpansView}
          setSpan={setSpan}
          setAttributes={setAttributes}
          setEvents={setEvents}
        />
      </div>
    </>
  );
}
