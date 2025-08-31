"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ✅ Import from website-actions
import { getVisitChartData } from "@/lib/website-actions"

export const description = "An interactive area chart"

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  visits: {
    label: "Visits",
    color: "hsl(200, 100%, 70%)", // Bright cyan-blue
  },
  unique_visits: {
    label: "Unique Visits",
    color: "hsl(280, 100%, 80%)", // Bright purple
  },
} satisfies ChartConfig

export interface ChartProps {
  username: string
}

export default function Chart({ username }: ChartProps) {   // ✅ destructure props
  const [timeRange, setTimeRange] = React.useState("90d")
  const [chartData, setChartData] = React.useState<
    { date: string; visits: number; unique_visits?: number }[]
  >([])

  React.useEffect(() => {
    async function fetchData() {
      try {
        
        const data = await getVisitChartData(username)  // ✅ now just the string

        const viewerTZ = Intl.DateTimeFormat().resolvedOptions().timeZone

        const formatted = data.map(
          (item: { date: string; visits: number; unique_visits?: number }) => {
            const utcDate = new Date(item.date + "T00:00:00Z")
            const localString = utcDate.toLocaleDateString("en-CA", {
              timeZone: viewerTZ,
            })
            return {
              date: localString,
              visits: item.visits,
              unique_visits: item.unique_visits ?? 0,
            }
          }
        )

        setChartData(formatted)
      } catch (error) {
        console.error("Error fetching chart data:", error)
      }
    }

    fetchData()
  }, [username])   // ✅ add username as dependency

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date(
      Math.max(...chartData.map((i) => new Date(i.date).getTime()))
    )
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="pt-0 bg-black border-gray-800 text-white">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b border-gray-800 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-white">Area Chart - Interactive</CardTitle>
          <CardDescription className="text-gray-300">
            Showing visitor data for your live site
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex bg-gray-900 border-gray-700 text-white hover:bg-gray-800">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl bg-gray-900 border-gray-700 text-white">
            <SelectItem
              value="90d"
              className="rounded-lg hover:bg-gray-800 focus:bg-gray-800"
            >
              Last 3 months
            </SelectItem>
            <SelectItem
              value="30d"
              className="rounded-lg hover:bg-gray-800 focus:bg-gray-800"
            >
              Last 30 days
            </SelectItem>
            <SelectItem
              value="7d"
              className="rounded-lg hover:bg-gray-800 focus:bg-gray-800"
            >
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(200, 100%, 70%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(200, 100%, 70%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(280, 100%, 80%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(280, 100%, 80%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(0, 0%, 20%)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tick={{ fill: "white" }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                  className="bg-gray-900 border-gray-700 text-white [&_*]:text-white [&_.recharts-tooltip-item-value]:text-white"
                />
              }
            />
            <Area
              dataKey="unique_visits"
              type="natural"
              fill="url(#fillMobile)"
              stroke="hsl(280, 100%, 80%)"
              stackId="a"
            />
            <Area
              dataKey="visits"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="hsl(200, 100%, 70%)"
              stackId="a"
            />
            <ChartLegend />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
