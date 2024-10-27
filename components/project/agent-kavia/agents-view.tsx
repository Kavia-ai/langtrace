import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CrewAIAgent, CrewAIMemory, CrewAITask, CrewAITool } from "@/lib/crewai_trace_util";
import { cn } from "@/lib/utils";
import { MoveDiagonal } from "lucide-react";
import { useState } from "react";
import { JSONTree } from "react-json-tree";
import { useTheme } from "next-themes";
import { jsontheme } from "@/lib/constants";
import { toast } from "sonner";



export function TasksView({ tasks }: { tasks: CrewAITask[] }) {
  return (
    <Accordion type="multiple" className="w-full">
      {tasks.map((task, index) => (
        <AccordionItem value={index.toString()} key={index}>
          <AccordionTrigger>{`Task ${index + 1} - ${task?.id}`}</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-1 rounded-md p-2">
              <p className="text-xs font-semibold mt-2">ID</p>
              <p className="w-fit mt-2">{task?.id || "N/A"}</p>
              <p className="text-xs font-semibold mt-2">Description</p>
              <ExpandableP
                content={task?.description || "N/A"}
                className="mt-2"
              />
              <p className="text-xs font-semibold mt-2">Agent</p>
              <p className="w-fit mt-2">{task?.agent || "N/A"}</p>
              {task?.tools &&
                task?.tools?.length > 0 &&
                task?.tools?.map((tool, i) => (
                  <>
                    <p className="text-xs font-semibold mt-2 flex gap-1 items-center">
                      <Badge>{`Tool ${i + 1}`}</Badge>
                      Name
                    </p>
                    <p className="text-xs font-semibold mt-2">
                      {tool?.name || "N/A"}
                    </p>
                    <p className="text-xs font-semibold mt-2 flex gap-1 items-center">
                      <Badge>{`Tool ${i + 1}`}</Badge>
                      Description
                    </p>
                    <ExpandableP content={tool?.description || "N/A"} />
                  </>
                ))}
              <p className="text-xs font-semibold mt-2">Used Tools</p>
              <p className="text-xs font-semibold mt-2">
                {task?.used_tools || "N/A"}
              </p>
              <p className="text-xs font-semibold mt-2">Tool Errors</p>
              <ExpandableP content={task?.tool_errors || "N/A"} />
              <p className="text-xs font-semibold mt-2">Human Input</p>
              <p className="text-xs font-semibold mt-2">
                {task?.human_input || "False"}
              </p>
              <p className="text-xs font-semibold mt-2">Expected Output</p>
              <ExpandableP
                content={task?.expected_output || "N/A"}
                className="mt-2"
              />
              <p className="text-xs font-semibold mt-2">Result</p>
              <ExpandableP content={task?.result || "N/A"} className="mt-2" />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function ToolsView({ tools }: any) {
  // console.log(tools);

  return (
    <Accordion type="multiple" className="w-full">
      {tools.map((tool: any, index: number) => (
        <AccordionItem value={index.toString()} key={index}>
          <AccordionTrigger>{`Tool ${index + 1} - ${tool?.name || "N/A"}`}</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-1 rounded-md p-2">
              {/* Tool Name */}
              <p className="text-md font-semibold mt-2">Name</p>
              <p className="w-fit mt-2">{tool?.name || "N/A"}</p>

              {/* Tool Description */}
              <p className="text-md font-semibold mt-2">Description</p>
              <ExpandableP content={tool?.description || "N/A"} className="mt-2" />

              {/* Parameter Properties */}
              <p className="text-md font-semibold mt-2">Parameter</p> 
              {tool?.parameter ? (
                <div className="w-full grid grid gap-2">
                  {Object.entries(tool.parameter.properties || {}).map(([key, value]: [string, any]) => (
                    <div key={key}>
                      <p className="text-sm font-semibold mt-2">{key}</p>
                      <p className="w-fit mt-2">{value?.description || "N/A"}</p>
                    </div>
                  ))}
                  <p className="text-xs font-semibold mt-2">Required</p>
                  <p className="w-fit mt-2">{tool.parameter?.required?.join(", ") || "N/A"}</p>
                  <p className="text-xs font-semibold mt-2">Strict : {tool.parameter?.strict ? "True" : "False"}</p>
                  {/* <p className="w-fit mt-2"></p> */}
                </div>
              ) : (
                <p className="w-fit mt-2">N/A</p>
              )}

          
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}


export function ToolsCaptureView({ tools_capture } : any) {
 
  const { theme } = useTheme();  // Using theme from next-themes

  return (
    <Accordion type="multiple" className="w-full">
      {tools_capture.map((tool: any, index: number) => (
        <AccordionItem value={index.toString()} key={index}>
          <AccordionTrigger>{`ID: ${tool.id}`}</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-1 rounded-md p-2">
              <p className="text-xs font-semibold mt-2">Name</p>
              <ExpandableP
                content={tool.function?.name || "N/A"}
                className="mt-2"
              />
              <p className="text-xs font-semibold mt-2">Arguments</p>
              {/* <ExpandableP
                content={tool.function?.arguments || "N/A"}
                className="mt-2"
              /> */}
               {tool.function?.arguments ? (
                <JSONTree
                  data={tool.function.arguments}
                  theme={jsontheme}
                  invertTheme={theme === "light"}
                  shouldExpandNodeInitially={() => true}
                  labelRenderer={([key]) => <strong>{key}</strong>}
                  valueRenderer={(raw: any) => <span className="overflow-x-hidden">{raw}</span>}
                  postprocessValue={(raw: any) => {
                    if (typeof raw === "string") {
                      try {
                        return JSON.parse(raw);
                      } catch (e) {
                        return raw;
                      }
                    }
                    return raw;
                  }}
                />
              ) : (
                "N/A"
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function ToolsOutputView({ tools_output } : any) {
  // console.log(tools_output);
  const { theme } = useTheme();  // Using theme from next-themes

  return (
    <Accordion type="multiple" className="w-full">
      {tools_output.map((tool: any, index: number) => (
        <AccordionItem value={index.toString()} key={index}>
          <AccordionTrigger>{`ID: ${tool.tool_call_id}`}</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-1 rounded-md p-2">
              <p className="text-xs font-semibold mt-2">Name</p>
              <p className="w-fit mt-2">{tool.name || "N/A"}</p>
              <p className="text-xs font-semibold mt-2">Role</p>
              <p className="w-fit mt-2">{tool.role || "N/A"}</p>
              <p className="text-xs font-semibold mt-2">Content</p>
              {/* <ExpandableP
                content={tool.content || "N/A"}
                className="mt-2"
              /> */}
              {tool.content ? (
                
                <JSONTree
                  data={tool.content}
                  theme={jsontheme}
                  invertTheme={theme === "light"}
                  shouldExpandNodeInitially={() => true}
                  labelRenderer={([key]) => <strong>{key}</strong>}
                  valueRenderer={(raw: any) => <span className="overflow-x-hidden">{raw}</span>}
                  postprocessValue={(raw: any) => {
                    if (typeof raw === "string") {
                      try {
                        return JSON.parse(raw);
                      } catch (e) {
                        return raw;
                      }
                    }
                    return raw;
                  }}
                />
              ) : (
                "N/A"
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function ExpandableP({
  content,
  className,
}: {
  content: any;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={cn(
        "flex w-fit",
        !expanded ? "min-h-fit max-h-24 overflow-y-scroll" : "",
        className
      )}
    >
      <p>{content}</p>
      <Button
        variant={"ghost"}
        onClick={() => setExpanded(!expanded)}
        size={"sm"}
      >
        <MoveDiagonal size={16} />
      </Button>
    </div>
  );
}
