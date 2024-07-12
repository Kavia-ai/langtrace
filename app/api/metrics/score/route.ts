import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import { TraceService } from "@/lib/services/trace_service";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      redirect("/login");
    }

    const { projectId, testIds, lastNHours, filters } = await req.json();

    if (!projectId) {
      return NextResponse.json(
        {
          error: "Please provide a projectId",
        },
        { status: 400 }
      );
    }
    1;
    const email = session?.user?.email as string;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "user not found",
        },
        { status: 404 }
      );
    }

    // check if this user has access to this project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        teamId: user.teamId,
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          error: "User does not have access to this project",
        },
        { status: 403 }
      );
    }

    const traceService = new TraceService();
    const spans = await traceService.GetSpansInProject(
      projectId,
      lastNHours,
      filters
    );

    let evaluations = [];
    const dateScoreMap: any = {};

    for (const testId of testIds) {
      evaluations = await prisma.evaluation.findMany({
        where: {
          projectId,
          testId,
          spanId: { in: [...spans.map((span) => span.span_id)] },
        },
        include: {
          Test: true,
        },
      });

      evaluations.forEach((evaluation) => {
        const span = spans.find((span) => span.span_id === evaluation.spanId);
        if (!span) return;
        const date = span.start_time.split("T")[0];

        if (!dateScoreMap[date]) {
          dateScoreMap[date] = {};
        }

        if (!dateScoreMap[date][`${testId}-${evaluation.Test?.name}`]) {
          dateScoreMap[date][`${testId}-${evaluation.Test?.name}`] = [0, 0];
        }

        const total =
          dateScoreMap[date][`${testId}-${evaluation.Test?.name}`][0] +
            evaluation.ltUserScore || 0;
        dateScoreMap[date][`${testId}-${evaluation.Test?.name}`][0] = total;
        dateScoreMap[date][`${testId}-${evaluation.Test?.name}`][1] += 1;
      });
    }

    const metricsChartData = Object.entries(dateScoreMap).map(
      ([date, scoresByTestId]) => {
        const entry: any = { date };
        Object.entries(scoresByTestId as any).forEach(
          ([testId, scores]: any) => {
            entry[testId] = scores[0];
          }
        );
        return entry;
      }
    );

    // calculate score % test wise and not date wise
    // const scoresChartData: any = {
    //   "test-1": 10,
    // };
    const scoresChartData: any = {};
    Object.entries(dateScoreMap).map(([date, scoresByTestId]) => {
      Object.entries(scoresByTestId as any).forEach(([testId, scores]: any) => {
        if (!scoresChartData[testId]) {
          scoresChartData[testId] = 0;
        }
        if (scores[1] === 0) {
          scoresChartData[testId] = 0;
        }
        scoresChartData[testId] = scores[0] / scores[1];
      });
    });

    metricsChartData.sort(
      (a, b) =>
        new Date(a.date as string).getTime() -
        new Date(b.date as string).getTime()
    );

    return NextResponse.json({
      metrics: metricsChartData,
      scores: scoresChartData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
