import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Access } from "@/types/types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AccessGraphDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  recentAccesses: Access[];
}

const AccessGraphDialog = ({
  open,
  setOpen,
  recentAccesses,
}: AccessGraphDialogProps) => {
  const groupByWeek = (accesses: Access[]) => {
    const weeks: { [key: string]: { week: string; count: number } } = {};

    accesses.forEach((access) => {
      const date = new Date(access.date);
      // (Monday)
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay() + 1);
      const year = startOfWeek.getFullYear();
      // const month = startOfWeek.getMonth();
      const firstDayOfYear = new Date(year, 0, 1);
      const dayOfYear = Math.floor(
        (startOfWeek.getTime() - firstDayOfYear.getTime()) /
        (24 * 60 * 60 * 1000)
      );
      const weekNumber = Math.ceil((dayOfYear + 1) / 7);
      const weekKey = `${year}-W${weekNumber < 10 ? "0" + weekNumber : weekNumber
        }`;
      if (!weeks[weekKey]) {
        weeks[weekKey] = { week: weekKey, count: -1 };
      }
      weeks[weekKey].count += 1;
    });

    // Convert the object to an array and sort by week
    return Object.values(weeks).sort((a, b) => {
      const [aYear, aWeek] = a.week.split("-W").map(Number);
      const [bYear, bWeek] = b.week.split("-W").map(Number);
      // Sort by year first, then by week number
      return aYear === bYear ? aWeek - bWeek : aYear - bYear;
    });
  };

  // Group accesses by week
  const weeklyAccesses = groupByWeek(recentAccesses);
  // Prepare the data for the graph
  const graphData = {
    series: [
      {
        name: "Accesses",
        data: weeklyAccesses.map((weekData, index) => {
          return {
            x: index + 1,
            y: weekData.count,
          };
        }),
      },
    ],
    options: {
      chart: {
        type: "line", // Line chart type
        height: 350,
      },
      xaxis: {
        type: "category",
        categories: weeklyAccesses.map((weekData) => weekData.week),
        title: {
          text: "Week",
        },
      },
      yaxis: {
        title: {
          text: "Accesses",
        },
        stepSize: 10,
        min: 0,
      },
      title: {
        text: "Weekly Accesses",
        align: "center",
      },
      stroke: {
        curve: "smooth",
      },
      markers: {
        size: 5,
        colors: ["#FF4560"],
        strokeColors: "#fff",
        strokeWidth: 1,
      },
      dataLabels: {
        enabled: true,
      },
    } as ApexOptions,
  };

  return (
    // @ts-ignore
    <Dialog open={open} onOpenChange={setOpen} className="w-full md:w-1/2">
      <DialogContent
        className="rounded max-w-[80%]"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>Weekly Access Graph</DialogTitle>
        </DialogHeader>

        <section className="h-full p-3">
          {/* Desktop Content */}
          <div className="hidden h-full lg:block">
            <div className="w-full mt-3 bg-gray-100 c-beige:bg-beige-50 dark:bg-[#0c0e0f] rounded-lg p-1 h-full">
              <Chart
                options={graphData.options}
                series={graphData.series}
                type="line"
                height="380"
              />
            </div>
          </div>
          {/* Mobile Content */}
          <div className="lg:hidden">
            <p>Only viewable on Desktop</p>
          </div>
        </section>
        <DialogFooter>
          <DialogClose asChild></DialogClose>
          <Button variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccessGraphDialog;
