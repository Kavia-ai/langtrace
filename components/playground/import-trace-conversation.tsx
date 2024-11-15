import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PAGE_SIZE } from "@/lib/constants";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { StackIcon } from "@radix-ui/react-icons";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useBottomScrollListener } from "react-bottom-scroll-listener";
import { useQuery } from "react-query";
import { toast } from "sonner";
import { Spinner } from "../shared/spinner";
import { Button } from "../ui/button";

export default function ImportTraceConversation({
  setMessages,
}: {
  setMessages: (messages: any) => void;
}) {
  const project_id = useParams()?.project_id as string;
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentData, setCurrentData] = useState<any>([]);
  const [showLoader, setShowLoader] = useState(false);
  const [enableFetch, setEnableFetch] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    setShowLoader(true);
    setCurrentData([]);
    setPage(1);
    setTotalPages(1);
    setEnableFetch(true);
  }, []);

  const scrollableDivRef = useBottomScrollListener(() => {
    if (fetchTraces.isRefetching) {
      return;
    }
    if (page <= totalPages) {
      setShowLoader(true);
      fetchTraces.refetch();
    }
  });

  const fetchTraces = useQuery({
    queryKey: ["fetch-traces-query"],
    queryFn: async () => {
      const apiEndpoint = "/api/traces";
      const body = {
        page,
        pageSize: PAGE_SIZE,
        projectId: project_id,
        filters: {
          operation: "OR",
          filters: [
            {
              key: "langtrace.service.type",
              operation: "EQUALS",
              value: "llm",
              type: "attribute",
            },
          ],
        },
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
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      const newData = data?.traces?.result || [];
      const metadata = data?.traces?.metadata || {};

      setTotalPages(parseInt(metadata?.total_pages) || 1);
      if (parseInt(metadata?.page) <= parseInt(metadata?.total_pages)) {
        setPage(parseInt(metadata?.page) + 1);
      }

      if (currentData.length > 0) {
        const updatedData = [...currentData, ...newData];
        setCurrentData(updatedData);
      } else {
        setCurrentData(newData);
      }

      setEnableFetch(false);
      setShowLoader(false);
    },
    onError: (error) => {
      setEnableFetch(false);
      setShowLoader(false);
      toast.error("Failed to fetch traces", {
        description: error instanceof Error ? error.message : String(error),
      });
    },
    refetchOnWindowFocus: false,
    enabled: enableFetch,
  });

  const parseTraceData = (trace: any) => {
    let model = "";
    let promptFinal: string = "";
    let responseFinal: string = "";

    for (const span of trace) {
      if (span.attributes) {
        const attributes = JSON.parse(span.attributes);

        if (span.events) {
          const events: any[] = JSON.parse(span.events);

          const promptEvent = events.find(
            (event: any) => event.name === "gen_ai.content.prompt"
          );
          if (promptEvent?.attributes?.["gen_ai.prompt"]) {
            const promptJSONString = promptEvent.attributes["gen_ai.prompt"];
            const promptsJSON = JSON.parse(promptJSONString);
            promptFinal = promptsJSON[0].content || "";
          }

          const responseEvent = events.find(
            (event: any) => event.name === "gen_ai.content.completion"
          );
          if (responseEvent?.attributes?.["gen_ai.completion"]) {
            const responseJSONString =
              responseEvent.attributes["gen_ai.completion"];
            const responseJSON = JSON.parse(responseJSONString);
            responseFinal = responseJSON[0].content || "";
          }
        }

        if (!model) {
          model =
            attributes["gen_ai.response.model"] ||
            attributes["gen_ai.request.model"] ||
            attributes["llm.model"] ||
            "";
        }
      }
    }

    return { model, promptFinal, responseFinal };
  };

  const handleRowClick = (promptFinal: string, responseFinal: string) => {
    if (promptFinal.length && responseFinal.length) {
      const inputMessage = { role: "user", content: promptFinal };
      const outputMessage = { role: "assistant", content: responseFinal };

      setMessages([inputMessage, outputMessage]);
      setOpenDialog(false);
    }
  };

  // const handleRowClick = async (promptFinal: string, responseFinal: string) => {
  //   try {
  //     const response = await fetch(`http://localhost:3000/api/trace?projectId=cm2m13vxo000j105v6sv5nnk4&traces=0xe4b58d56528b595337c699acf7262c23&spanId=0xc20e5db37444f917`, {
  //       method: 'GET',
  //       headers: {
  //         'Accept': '*/*',
  //         'Content-Type': 'application/json',
  //       }
  //     });
      
      
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch trace data');
  //     }
  
  //     const data = await response.json();
      
  //     // Parse events from the response
  //     const data_original = JSON.parse(data);
  //     const events = JSON.parse(data_original.events);

  //     console.log(events);

  //     // // Find prompt and completion events
  //     const promptEvent = events.find((event: any) => event.name === "gen_ai.content.prompt");
  //     const promptContent = promptEvent?.attributes?.["gen_ai.prompt"];
  
  //     if (promptContent) {
  //       try {
  //         const parsedPromptContent = JSON.parse(promptContent);
  //         // Find the user message in the conversation
  //         const userMessage = parsedPromptContent.find((msg: any) => msg.role === "user");
  //         const systemMessage = parsedPromptContent.find((msg: any) => msg.role === "system");

  //         if (userMessage) {
  //           const messages = [];
  //           if (systemMessage) {
  //             messages.push({ role: "system", content: systemMessage.content });
  //           }
  //           messages.push({ role: "user", content: userMessage.content });
            
  //           setMessages(messages);
  //           setOpenDialog(false);
  //         }
  //       } catch (parseError) {
  //         console.error('Error parsing prompt content:', parseError);
  //         toast.error('Failed to parse conversation data');
  //   }
  //     } else {
  //       toast.error('No valid conversation found in the trace');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching trace:', error);
  //     toast.error('Failed to fetch trace data');
  //   }
  // };

  return (
    <Dialog
      open={openDialog}
      onOpenChange={(isOpen) => {
        setOpenDialog(isOpen);
        if (isOpen) {
          setShowLoader(true);
          setCurrentData([]);
          setPage(1);
          setTotalPages(1);
          setEnableFetch(true);
        }
      }}
    >
      <DialogTrigger>
        <Button
          type="button"
          size="sm"
          className="w-full flex justify-start gap-2"
          variant={"ghost"}
          onClick={() => {
            setOpenDialog(true);
          }}
        >
          <StackIcon className="h-4 w-4" />
          Import Traced Conversation
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-6xl h-[600px] overflow-y-scroll">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="text-left text-lg mb-4">
            Select a conversation to import
          </Label>
          <div className="grid grid-cols-13 items-center p-3 bg-muted">
            <p className="col-span-2 text-xs font-medium">Model</p>
            <p className="col-span-5 text-xs font-medium">Input</p>
            <p className="col-span-5 text-xs font-medium">Output</p>
          </div>

          {fetchTraces.isLoading || !fetchTraces?.data || !currentData ? (
            <PageSkeleton />
          ) : (
            <div
              className="flex flex-col rounded-md border border-muted h-[450px] overflow-y-scroll"
              ref={scrollableDivRef as any}
            >
              {!fetchTraces.isLoading &&
                fetchTraces?.data &&
                currentData?.map((trace: any, i: number) => {
                  const { model, promptFinal, responseFinal } =
                    parseTraceData(trace);

                  return (
                    <div
                      key={i}
                      className="px-3 py-4 hover:bg-accent cursor-pointer grid grid-cols-12 items-center gap-y-4 gap-x-4"
                      onClick={() => handleRowClick(promptFinal, responseFinal)}
                    >
                      <p className="col-span-2 text-xs">{model}</p>

                      <p className="col-span-4 text-xs overflow-hidden max-h-[3.5rem] line-clamp-3 break-words">
                        {promptFinal}
                      </p>
                      <p className="col-span-5 text-xs overflow-hidden max-h-[3.5rem] line-clamp-3 break-words">
                        {responseFinal}
                      </p>
                    </div>
                  );
                })}
              {showLoader && (
                <div className="flex justify-center py-8">
                  <Spinner className="h-8 w-8 text-center" />
                </div>
              )}
              {page < totalPages && (
                <div className="bg-gradient-to-t from-muted-foreground to-transparent absolute bottom-0 left-0 right-0 h-12" />
              )}
              {!fetchTraces.isLoading &&
                fetchTraces?.data &&
                currentData?.length === 0 &&
                !showLoader && (
                  <div className="flex flex-col gap-3 items-center justify-center p-4">
                    <p className="text-muted-foreground text-sm mb-3">
                      No traces available. Get started by setting up Langtrace
                      in your application.
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-muted max-h-screen">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="px-3 py-2 grid grid-cols-12 items-center">
          <div className="col-span-3 bg-muted h-4 w-full rounded-sm" />
          <div className="col-span-4 bg-muted h-4 w-full rounded-sm" />
          <div className="col-span-5 bg-muted h-4 w-full rounded-sm" />
        </div>
      ))}
    </div>
  );
}
