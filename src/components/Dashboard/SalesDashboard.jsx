import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext"; // Adjust the path as needed
import PropTypes from "prop-types";
import {
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiChevronRight,
  FiThermometer,
  FiCalendar,
  FiRefreshCw,
} from "react-icons/fi";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const TeamPerformance = ({ teamPerformance, isLoading, selectedUserId }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: selectedUserId ? 1 : 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3">
            <div className="h-4 bg-gray-200 rounded-full w-3/4 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!teamPerformance || teamPerformance.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">
          {selectedUserId
            ? "No performance data available for this user"
            : "No performance data available"}
        </p>
      </div>
    );
  }

  const maxValue = selectedUserId
    ? teamPerformance[0]?.value || 1
    : Math.max(...teamPerformance.map((member) => member.value));

  return (
    <div className="space-y-4">
      {teamPerformance.map((member) => (
        <div
          key={member.name}
          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center">
            <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-medium">
              {member.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{member.name}</p>
              <p className="text-xs text-gray-500">{member.role}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
              <div
                className="h-2 rounded-full bg-indigo-600"
                style={{
                  width: `${Math.min(100, (member.value / maxValue) * 100)}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {member.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

TeamPerformance.propTypes = {
  teamPerformance: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
      role: PropTypes.string,
    })
  ),
  isLoading: PropTypes.bool,
  selectedUserId: PropTypes.string,
};

TeamPerformance.defaultProps = {
  teamPerformance: [],
  isLoading: false,
  selectedUserId: null,
};

const RecentActivity = ({ recentActivity, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center p-3">
            <div className="h-4 bg-gray-200 rounded-full w-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!recentActivity || recentActivity.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">No recent activity to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentActivity.map((activity) => (
        <div
          key={activity.id}
          className="p-3 hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="relative">
                <div
                  className={`p-2 rounded-lg ${
                    activity.amount
                      ? "bg-green-100 text-green-600"
                      : "bg-indigo-100 text-indigo-600"
                  }`}
                >
                  {activity.amount ? (
                    <FiDollarSign size={16} />
                  ) : (
                    <FiUsers size={16} />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.action}
                  </p>
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {activity.userInitials}
                  </span>
                </div>
                <p
                  className="text-xs text-gray-500 mt-0.5 truncate"
                  style={{ maxWidth: "180px" }} // You can adjust this width as needed
                  title={activity.company}
                >
                  {activity.company}
                </p>
                {activity.amount && (
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    ₹{activity.amount.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap ml-2 self-start">
              {activity.time}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

RecentActivity.propTypes = {
  recentActivity: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      action: PropTypes.string,
      amount: PropTypes.number,
      company: PropTypes.string,
      time: PropTypes.string,
      user: PropTypes.string,
      userInitials: PropTypes.string,
    })
  ),
  isLoading: PropTypes.bool,
};

RecentActivity.defaultProps = {
  recentActivity: [],
  isLoading: false,
};
const EducationDistribution = ({ leadCategories, isLoading }) => {
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B"]; // Blue, Green, Amber

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (
    !leadCategories ||
    leadCategories.length === 0 ||
    leadCategories.reduce((sum, cat) => sum + cat.value, 0) === 0
  ) {
    return (
      <div className="h-60 flex items-center justify-center">
        <p className="text-gray-500">No education data available</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={leadCategories}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={70}
              fill="#8884d8"
              dataKey="value"
            >
              {leadCategories.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {leadCategories.map((category, index) => (
          <div key={index} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-gray-600">
              {category.name}: {category.value}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

EducationDistribution.propTypes = {
  leadCategories: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
    })
  ),
  isLoading: PropTypes.bool,
};

EducationDistribution.defaultProps = {
  leadCategories: [],
  isLoading: false,
};
const LeadDistribution = ({ leadSources, isLoading }) => {
  // Set colors: Hot = red, Warm = orange, Cold = blue
  const COLORS = ["#EF4444", "#F59E0B", "#3B82F6"]; // Red, Orange, Blue

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!leadSources || leadSources.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-gray-500">No lead data available</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={leadSources}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {leadSources.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {leadSources.map((source, index) => (
          <div key={index} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-gray-600">
              {source.name}: {source.value}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

LeadDistribution.propTypes = {
  leadSources: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
    })
  ),
  isLoading: PropTypes.bool,
};

LeadDistribution.defaultProps = {
  leadSources: [],
  isLoading: false,
};

const CustomTooltip = ({ active, payload, label, timePeriod }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    let timeLabel = "";

    switch (timePeriod) {
      case "week":
        timeLabel = `Day: ${label}`;
        break;
      case "month":
        timeLabel = `Week: ${label}`;
        break;
      case "quarter":
        timeLabel = `Month: ${label}`;
        break;
      case "year":
        timeLabel = `Month: ${label}`;
        break;
      default:
        timeLabel = `Period: ${label}`;
    }

    return (
      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-900">{timeLabel}</p>
        <p className="text-sm" style={{ color: payload[0].color }}>
          Revenue: ₹{payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {dataPoint.dealCount} closed deal(s)
        </p>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
  timePeriod: PropTypes.string,
};

CustomTooltip.defaultProps = {
  active: false,
  payload: [],
  label: "",
  timePeriod: "quarter",
};

const SalesDashboard = () => {
  const userDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);

  const [timePeriod, setTimePeriod] = useState("quarter");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isUserFilterOpen, setIsUserFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    revenue: 0,
    revenuePrevQuarter: 0,
    growth: 0,
    hotLeads: 0,
    hotLeadsPrevQuarter: 0,
    warmLeads: 0,
    warmLeadsPrevQuarter: 0,
    coldLeads: 0,
    coldLeadsPrevQuarter: 0,
    projectedTCV: 0,
    projectedTCVPrevQuarter: 0,
    chartData: [],
    leadSources: [],
    teamPerformance: [],
    recentActivity: [],
  });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("Team");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const currentUser = useAuth()?.user;
  const [currentPeriodInfo, setCurrentPeriodInfo] = useState("");
  const [currentDateRange, setCurrentDateRange] = useState({
    start: new Date(),
    end: new Date(),
  });

  const getCurrentQuarter = () => {
    const now = new Date();
    const month = now.getMonth();
    if (month >= 3 && month <= 5) return "Q1 (Apr-Jun)";
    if (month >= 6 && month <= 8) return "Q2 (Jul-Sep)";
    if (month >= 9 && month <= 11) return "Q3 (Oct-Dec)";
    return "Q4 (Jan-Mar)";
  };

  const getDateRange = (period) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    let start, end;

    switch (period) {
      case "week":
        start = new Date();
        start.setDate(day - now.getDay());
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;

      case "month":
        start = new Date(year, month, 1);
        end = new Date(year, month + 1, 0);
        break;

      case "quarter":
        if (month >= 3 && month <= 5) {
          start = new Date(year, 3, 1); // April 1
          end = new Date(year, 5, 30); // June 30
        } else if (month >= 6 && month <= 8) {
          start = new Date(year, 6, 1); // July 1
          end = new Date(year, 8, 30); // September 30
        } else if (month >= 9 && month <= 11) {
          start = new Date(year, 9, 1); // October 1
          end = new Date(year, 11, 31); // December 31
        } else {
          start = new Date(year, 0, 1); // January 1
          end = new Date(year, 2, 31); // March 31
        }
        break;

      case "year":
        if (month < 3) {
          start = new Date(year - 1, 3, 1); // April 1 of previous year
          end = new Date(year, 2, 31); // March 31 of current year
        } else {
          start = new Date(year, 3, 1); // April 1 of current year
          end = new Date(year + 1, 2, 31); // March 31 of next year
        }
        break;

      default:
        return getDateRange("quarter");
    }

    return { start, end };
  };

  const getNextDateRange = (period, currentStart) => {
    const start = new Date(currentStart);
    let newStart, newEnd;

    switch (period) {
      case "week":
        newStart = new Date(start);
        newStart.setDate(start.getDate() + 7);
        newEnd = new Date(newStart);
        newEnd.setDate(newStart.getDate() + 6);
        break;

      case "month":
        newStart = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        newEnd = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);
        break;

      case "quarter":
        const quarterMonth = start.getMonth();
        if (quarterMonth >= 0 && quarterMonth <= 2) {
          // Q4 -> Q1
          newStart = new Date(start.getFullYear(), 3, 1);
          newEnd = new Date(start.getFullYear(), 5, 30);
        } else if (quarterMonth >= 3 && quarterMonth <= 5) {
          // Q1 -> Q2
          newStart = new Date(start.getFullYear(), 6, 1);
          newEnd = new Date(start.getFullYear(), 8, 30);
        } else if (quarterMonth >= 6 && quarterMonth <= 8) {
          // Q2 -> Q3
          newStart = new Date(start.getFullYear(), 9, 1);
          newEnd = new Date(start.getFullYear(), 11, 31);
        } else {
          // Q3 -> Q4
          newStart = new Date(start.getFullYear() + 1, 0, 1);
          newEnd = new Date(start.getFullYear() + 1, 2, 31);
        }
        break;

      case "year":
        newStart = new Date(start.getFullYear() + 1, 3, 1);
        newEnd = new Date(start.getFullYear() + 2, 2, 31);
        break;

      default:
        return getDateRange(period);
    }

    return { start: newStart, end: newEnd };
  };

  const getPrevDateRange = (period, currentStart) => {
    const start = new Date(currentStart);
    let newStart, newEnd;

    switch (period) {
      case "week":
        newStart = new Date(start);
        newStart.setDate(start.getDate() - 7);
        newEnd = new Date(newStart);
        newEnd.setDate(newStart.getDate() + 6);
        break;

      case "month":
        newStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
        newEnd = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);
        break;

      case "quarter":
        const quarterMonth = start.getMonth();
        if (quarterMonth >= 0 && quarterMonth <= 2) {
          newStart = new Date(start.getFullYear() - 1, 9, 1);
          newEnd = new Date(start.getFullYear() - 1, 11, 31);
        } else if (quarterMonth >= 3 && quarterMonth <= 5) {
          newStart = new Date(start.getFullYear(), 0, 1);
          newEnd = new Date(start.getFullYear(), 2, 31);
        } else if (quarterMonth >= 6 && quarterMonth <= 8) {
          newStart = new Date(start.getFullYear(), 3, 1);
          newEnd = new Date(start.getFullYear(), 5, 30);
        } else {
          newStart = new Date(start.getFullYear(), 6, 1);
          newEnd = new Date(start.getFullYear(), 8, 30);
        }
        break;

      case "year":
        newStart = new Date(start.getFullYear() - 1, 3, 1);
        newEnd = new Date(start.getFullYear(), 2, 31);
        break;

      default:
        return getDateRange(period);
    }

    return { start: newStart, end: newEnd };
  };

  const getPreviousQuarterDateRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    let start, end;

    if (month >= 3 && month <= 5) {
      start = new Date(year - 1, 0, 1);
      end = new Date(year - 1, 2, 31);
    } else if (month >= 6 && month <= 8) {
      start = new Date(year, 3, 1);
      end = new Date(year, 5, 30);
    } else if (month >= 9 && month <= 11) {
      start = new Date(year, 6, 1);
      end = new Date(year, 8, 30);
    } else {
      start = new Date(year, 9, 1);
      end = new Date(year, 11, 31);
    }

    return { start, end };
  };
  const updatePeriodInfo = (range, isCurrentPeriod = true) => {
    const { start, end } = range;
    let info = "";
    const now = new Date();
    const isCurrent = isCurrentPeriod && start <= now && end >= now;

    switch (timePeriod) {
      case "week":
        info = `${
          isCurrent ? "Current " : ""
        }Week: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;
        break;
      case "month":
        info = `${isCurrent ? "Current " : ""}Month: ${start.toLocaleDateString(
          "default",
          { month: "long" }
        )} ${start.getFullYear()}`;
        break;
      case "quarter":
        const month = start.getMonth();
        let quarter, quarterMonths;

        if (month >= 3 && month <= 5) {
          quarter = "Q1";
          quarterMonths = "Apr-Jun";
        } else if (month >= 6 && month <= 8) {
          quarter = "Q2";
          quarterMonths = "Jul-Sep";
        } else if (month >= 9 && month <= 11) {
          quarter = "Q3";
          quarterMonths = "Oct-Dec";
        } else {
          quarter = "Q4";
          quarterMonths = "Jan-Mar";
        }

        info = `${
          isCurrent ? "Current " : ""
        }Quarter: ${quarter} (${quarterMonths}) ${start.getFullYear()}`;
        break;
      case "year":
        info = `${
          isCurrent ? "Current " : ""
        }Fiscal Year: ${start.getFullYear()}-${end.getFullYear()}`;
        break;
      default:
        info = `${isCurrent ? "Current " : ""}Quarter: ${getCurrentQuarter()}`;
    }

    setCurrentPeriodInfo(info);
  };

  const processLeadsData = (input) => {
    const leadCategories = {
      Engineering: 0,
      MBA: 0,
      Others: 0,
    };

    // Handle both QuerySnapshot and filtered doc arrays
    let docs = [];
    let forEachFn;

    if (input && input.docs) {
      // It's a QuerySnapshot
      docs = input.docs;
      forEachFn = (callback) => {
        docs.forEach((doc) => callback(doc));
      };
    } else if (Array.isArray(input)) {
      // It's an array of documents
      docs = input;
      forEachFn = (callback) => {
        docs.forEach((doc) => callback(doc));
      };
    } else {
      // Invalid input
      console.error("Invalid input to processLeadsData:", input);
      return {
        revenue: 0,
        hotLeads: 0,
        warmLeads: 0,
        coldLeads: 0,
        projectedTCV: 0,
        chartData: [],
        leadSources: [],
        teamPerformance: [],
        recentActivity: [],
      };
    }

    let revenue = 0;
    let hotLeads = 0;
    let warmLeads = 0;
    let coldLeads = 0;
    let projectedTCV = 0;
    const leadSources = { hot: 0, warm: 0, cold: 0 };
    const teamPerformance = {};
    const recentActivity = [];
    const revenueByDate = {};
    const chartData = [];
    const timePoints =
      timePeriod === "week"
        ? 7
        : timePeriod === "month"
        ? 4
        : timePeriod === "quarter"
        ? 3
        : 12;

    forEachFn((doc) => {
      const lead = docs === input ? doc : doc.data();

      if (selectedUserId) {
        const selectedUserObj = users.find((u) => u.id === selectedUserId);
        if (lead.assignedTo?.uid !== selectedUserObj?.uid) {
          return;
        }
      }
      if (lead.courseType) {
        if (lead.courseType.includes("Engineering")) {
          leadCategories.Engineering++;
        } else if (lead.courseType.includes("MBA")) {
          leadCategories.MBA++;
        } else {
          leadCategories.Others++;
        }
      } else {
        leadCategories.Others++;
      }

      if (lead.phase === "hot") {
        hotLeads++;
        leadSources.hot++;
      } else if (lead.phase === "warm") {
        warmLeads++;
        leadSources.warm++;
      } else if (lead.phase === "cold") {
        coldLeads++;
        leadSources.cold++;
      }

      if (lead.phase === "closed" && lead.totalCost) {
        revenue += lead.totalCost;

        if (lead.closedDate) {
          try {
            const closedDate = new Date(lead.closedDate);
            if (Number.isNaN(closedDate.getTime()))
              throw new Error("Invalid date");

            let dateKey;
            if (timePeriod === "week") {
              dateKey = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                closedDate.getDay()
              ];
            } else if (timePeriod === "month") {
              const firstDay = new Date(
                closedDate.getFullYear(),
                closedDate.getMonth(),
                1
              );
              const pastDaysOfMonth = closedDate.getDate() - 1;
              dateKey = `Week ${
                Math.floor((firstDay.getDay() + pastDaysOfMonth) / 7) + 1
              }`;
            } else if (timePeriod === "quarter") {
              dateKey = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ][closedDate.getMonth()];
            } else {
              const month = closedDate.getMonth();
              dateKey = [
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
                "Jan",
                "Feb",
                "Mar",
              ][month < 3 ? month + 9 : month - 3];
            }

            if (!revenueByDate[dateKey]) {
              revenueByDate[dateKey] = { revenue: 0, dealCount: 0 };
            }
            revenueByDate[dateKey].revenue += lead.totalCost;
            revenueByDate[dateKey].dealCount += 1;
          } catch (e) {
            console.error("Error processing closed date:", e);
          }
        }
      }

      if (lead.tcv) {
        projectedTCV += lead.tcv;
      }

      if (lead.assignedTo && lead.assignedTo.uid) {
        const user = users.find((u) => u.uid === lead.assignedTo.uid);
        const memberId = user ? user.id : lead.assignedTo.uid;
        const memberName = lead.assignedTo.name;

        if (!teamPerformance[memberId]) {
          teamPerformance[memberId] = {
            name: memberName,
            value: 0,
            role: lead.assignedTo.role || "Sales Rep",
          };
        }
        teamPerformance[memberId].value++;
      }

      recentActivity.push({
        id: doc.id,
        action: lead.phase === "closed" ? "Closed deal" : "New lead",
        amount: lead.phase === "closed" ? lead.totalCost : null,
        company: lead.businessName,
        user: lead.assignedTo?.name || "Unassigned",
        userInitials: lead.assignedTo?.name
          ? lead.assignedTo.name
              .split(" ")
              .map((n) => n[0])
              .join("")
          : "NA",
        time: new Date(lead.createdAt).toLocaleDateString(),
      });
    });

    // Generate chart data
    for (let i = 0; i < timePoints; i++) {
      let dateKey;
      if (timePeriod === "week") {
        dateKey = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i];
      } else if (timePeriod === "month") {
        dateKey = `Week ${i + 1}`;
      } else if (timePeriod === "quarter") {
        const now = new Date();
        const quarterMonth = now.getMonth();
        if (quarterMonth >= 3 && quarterMonth <= 5) {
          dateKey = ["Apr", "May", "Jun"][i];
        } else if (quarterMonth >= 6 && quarterMonth <= 8) {
          dateKey = ["Jul", "Aug", "Sep"][i];
        } else if (quarterMonth >= 9 && quarterMonth <= 11) {
          dateKey = ["Oct", "Nov", "Dec"][i];
        } else {
          dateKey = ["Jan", "Feb", "Mar"][i];
        }
      } else {
        const fiscalMonths = [
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
          "Jan",
          "Feb",
          "Mar",
        ];
        dateKey = fiscalMonths[i];
      }

      const now = new Date();
      const currentMonth = now.getMonth();
      let isCurrentMonth = false;

      if (timePeriod === "year") {
        const fiscalMonthIndex =
          currentMonth < 3 ? currentMonth + 9 : currentMonth - 3;
        isCurrentMonth = i === fiscalMonthIndex;
      } else if (timePeriod === "quarter") {
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        isCurrentMonth = currentMonth - quarterStartMonth === i;
      }

      chartData.push({
        name: dateKey,
        revenue: revenueByDate[dateKey]?.revenue || 0,
        dealCount: revenueByDate[dateKey]?.dealCount || 0,
        leads: Math.floor(
          ((hotLeads + warmLeads + coldLeads) * (0.7 + Math.random() * 0.6)) /
            timePoints
        ),
        currentMonth: isCurrentMonth,
      });
    }

    return {
      revenue,
      hotLeads,
      warmLeads,
      coldLeads,
      projectedTCV,
      chartData,
      leadCategories: [
        { name: "Engineering", value: leadCategories.Engineering },
        { name: "MBA", value: leadCategories.MBA },
        { name: "Others", value: leadCategories.Others },
      ],
      leadSources: [
        { name: "Hot", value: leadSources.hot },
        { name: "Warm", value: leadSources.warm },
        { name: "Cold", value: leadSources.cold },
      ],
      teamPerformance: Object.values(teamPerformance).sort(
        (a, b) => b.value - a.value
      ),
      recentActivity: recentActivity
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5),
    };
  };

  const fetchAllUsers = async () => {
    setIsLoadingUsers(true);
    
    try {
      const usersRef = collection(db, "users");
      
      let usersQuery;
      if (currentUser?.department === "sales") {
        usersQuery = query(usersRef, where("department", "==", "sales"));
      } else if (currentUser?.department === "Admin") {
        usersQuery = query(usersRef);
      } else {
        usersQuery = query(
          usersRef,
          where("department", "==", currentUser?.department || "")
        );
      }

      const usersSnapshot = await getDocs(usersQuery);
      
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredUsers = usersData;
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error.message);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchDataForRange = async (range) => {
    setIsLoading(true);

    // Define calculateGrowth here so it's available in all code paths
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current === 0 ? 0 : 100;
      return ((current - previous) / previous) * 100;
    };

    try {
      const { start, end } = range;
      const currentStart = start.getTime();
      const currentEnd = end.getTime();

      // Fetch current period data
      const leadsRef = collection(db, "leads");

      try {
        // First try with the composite index query
        let currentLeadsQuery = query(
          leadsRef,
          where("createdAt", ">=", currentStart),
          where("createdAt", "<=", currentEnd),
          ...(selectedUserId
            ? [
                where(
                  "assignedTo.uid",
                  "==",
                  users.find((u) => u.id === selectedUserId)?.uid
                ),
              ]
            : [])
        );

        const currentSnapshot = await getDocs(currentLeadsQuery);
        const currentData = processLeadsData(currentSnapshot);

        // Fetch previous quarter data for comparison
        const prevQuarterDateRange = getPreviousQuarterDateRange();
        const prevStart = prevQuarterDateRange.start.getTime();
        const prevEnd = prevQuarterDateRange.end.getTime();

        let prevLeadsQuery = query(
          leadsRef,
          where("createdAt", ">=", prevStart),
          where("createdAt", "<=", prevEnd),
          ...(selectedUserId
            ? [
                where(
                  "assignedTo.uid",
                  "==",
                  users.find((u) => u.id === selectedUserId)?.uid
                ),
              ]
            : [])
        );

        const prevSnapshot = await getDocs(prevLeadsQuery);
        const prevData = processLeadsData(prevSnapshot);

        const growth = {
          revenue: calculateGrowth(currentData.revenue, prevData.revenue),
          hotLeads: calculateGrowth(currentData.hotLeads, prevData.hotLeads),
          warmLeads: calculateGrowth(currentData.warmLeads, prevData.warmLeads),
          coldLeads: calculateGrowth(currentData.coldLeads, prevData.coldLeads),
          projectedTCV: calculateGrowth(
            currentData.projectedTCV,
            prevData.projectedTCV
          ),
        };

        setDashboardData({
          ...currentData,
          revenuePrevQuarter: prevData.revenue,
          hotLeadsPrevQuarter: prevData.hotLeads,
          warmLeadsPrevQuarter: prevData.warmLeads,
          coldLeadsPrevQuarter: prevData.coldLeads,
          projectedTCVPrevQuarter: prevData.projectedTCV,
          growth: growth.revenue,
        });
      } catch (error) {
        if (error.code === "failed-precondition") {
          console.warn(
            "Falling back to client-side filtering due to missing index"
          );

          // Fallback approach with client-side filtering
          const allLeadsQuery = query(
            leadsRef,
            where("createdAt", ">=", currentStart),
            where("createdAt", "<=", currentEnd)
          );

          const snapshot = await getDocs(allLeadsQuery);
          let filteredDocs = snapshot.docs;

          if (selectedUserId) {
            const selectedUserObj = users.find((u) => u.id === selectedUserId);
            filteredDocs = snapshot.docs.filter(
              (doc) => doc.data().assignedTo?.uid === selectedUserObj?.uid
            );
          }

          const currentData = processLeadsData({
            docs: filteredDocs,
            forEach: (callback) => filteredDocs.forEach(callback),
          });

          // Similar fallback for previous quarter data
          const prevQuarterDateRange = getPreviousQuarterDateRange();
          const prevStart = prevQuarterDateRange.start.getTime();
          const prevEnd = prevQuarterDateRange.end.getTime();

          const prevAllLeadsQuery = query(
            leadsRef,
            where("createdAt", ">=", prevStart),
            where("createdAt", "<=", prevEnd)
          );

          const prevSnapshot = await getDocs(prevAllLeadsQuery);
          let prevFilteredDocs = prevSnapshot.docs;

          if (selectedUserId) {
            const selectedUserObj = users.find((u) => u.id === selectedUserId);
            prevFilteredDocs = prevSnapshot.docs.filter(
              (doc) => doc.data().assignedTo?.uid === selectedUserObj?.uid
            );
          }

          const prevData = processLeadsData({
            docs: prevFilteredDocs,
            forEach: (callback) => prevFilteredDocs.forEach(callback),
          });

          // Calculate growth percentages
          const growth = {
            revenue: calculateGrowth(currentData.revenue, prevData.revenue),
            hotLeads: calculateGrowth(currentData.hotLeads, prevData.hotLeads),
            warmLeads: calculateGrowth(
              currentData.warmLeads,
              prevData.warmLeads
            ),
            coldLeads: calculateGrowth(
              currentData.coldLeads,
              prevData.coldLeads
            ),
            projectedTCV: calculateGrowth(
              currentData.projectedTCV,
              prevData.projectedTCV
            ),
          };

          setDashboardData({
            ...currentData,
            revenuePrevQuarter: prevData.revenue,
            hotLeadsPrevQuarter: prevData.hotLeads,
            warmLeadsPrevQuarter: prevData.warmLeads,
            coldLeadsPrevQuarter: prevData.coldLeads,
            projectedTCVPrevQuarter: prevData.projectedTCV,
            growth: growth.revenue,
          });

          console.error(
            "Firestore index missing. Please create this index:",
            error.message
          );
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData({
        revenue: 0,
        revenuePrevQuarter: 0,
        growth: 0,
        hotLeads: 0,
        hotLeadsPrevQuarter: 0,
        warmLeads: 0,
        warmLeadsPrevQuarter: 0,
        coldLeads: 0,
        coldLeadsPrevQuarter: 0,
        projectedTCV: 0,
        projectedTCVPrevQuarter: 0,
        chartData: [],
        leadSources: [],
        teamPerformance: [],
        recentActivity: [],
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleNextPeriod = () => {
    const newRange = getNextDateRange(timePeriod, currentDateRange.start);
    setCurrentDateRange(newRange);
    updatePeriodInfo(newRange);
    fetchDataForRange(newRange);
  };

  const handlePrevPeriod = () => {
    const newRange = getPrevDateRange(timePeriod, currentDateRange.start);
    setCurrentDateRange(newRange);
    updatePeriodInfo(newRange);
    fetchDataForRange(newRange);
  };
  const handleUserSelect = (user) => {
    if (user === "Team") {
      setSelectedUser("Team");
      setSelectedUserId(null);
    } else {
      setSelectedUser(user.name);
      setSelectedUserId(user.id);
    }
    setIsUserFilterOpen(false);
  };

  const handleRefresh = () => {
    const newRange = getDateRange(timePeriod);
    setCurrentDateRange(newRange);
    updatePeriodInfo(newRange);
    fetchDataForRange(newRange);
  };

  // WITH THIS:
  useEffect(() => {
    fetchAllUsers(); // Changed function name here
    const initialRange = getDateRange(timePeriod);
    setCurrentDateRange(initialRange);
    updatePeriodInfo(initialRange);
    fetchDataForRange(initialRange);
  }, []);

  useEffect(() => {
    const newRange = getDateRange(timePeriod);
    setCurrentDateRange(newRange);
    updatePeriodInfo(newRange);
    fetchDataForRange(newRange);
  }, [timePeriod, selectedUserId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserFilterOpen(false);
      }

      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      <div className="mx-auto max-w-8xl w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Sales Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Key metrics and performance indicators
            </p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <FiCalendar className="mr-1" />
              <button
                onClick={handlePrevPeriod}
                className="p-1 rounded-full hover:bg-gray-200"
                disabled={isLoading}
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>
              <span className="mx-1">
                {currentPeriodInfo || getCurrentQuarter()}
              </span>
              <button
                onClick={handleNextPeriod}
                className="p-1 rounded-full hover:bg-gray-200"
                disabled={isLoading}
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
              <span className="mx-2">|</span>
              <span>Today: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setIsUserFilterOpen(!isUserFilterOpen)}
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <FiUsers className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {selectedUser}
                </span>
                {isUserFilterOpen ? (
                  <FiChevronUp className="text-gray-500" />
                ) : (
                  <FiChevronDown className="text-gray-500" />
                )}
              </button>

              {isUserFilterOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="p-3 max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => handleUserSelect("Team")}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedUser === "Team"
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Team
                    </button>
                    {users.map((user) => (
                      <button
                        type="button"
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          selectedUser === user.name
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {user.name} (
                        {user.department
                          ? `${user.role} (${user.department})`
                          : user.role || "User"}
                        )
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={filterDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <FiFilter className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Filters
                </span>
                {isFilterOpen ? (
                  <FiChevronUp className="text-gray-500" />
                ) : (
                  <FiChevronDown className="text-gray-500" />
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="p-3">
                    {[
                      { value: "week", label: "This Week" },
                      { value: "month", label: "This Month" },
                      { value: "quarter", label: "Current Quarter" },
                      { value: "year", label: "This Year" },
                    ].map((period) => (
                      <button
                        type="button"
                        key={period.value}
                        onClick={() => {
                          setTimePeriod(period.value);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          timePeriod === period.value
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className={`p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${
                isLoading ? "animate-spin" : ""
              }`}
              disabled={isLoading}
            >
              <FiRefreshCw className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="w-full overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 min-w-0">
            {[
              {
                title: selectedUserId ? "Your Revenue" : "Team Revenue",
                value: `₹${dashboardData.revenue.toLocaleString()}`,
                change: dashboardData.growth,
                icon: <FiDollarSign className="text-white" size={16} />, // changed size
                color: "bg-indigo-600",
              },
              {
                title: selectedUserId ? "Your Hot Leads" : "Team Hot Leads",
                value: dashboardData.hotLeads.toLocaleString(),
                change:
                  ((dashboardData.hotLeads - dashboardData.hotLeadsPrevQuarter) /
                    (dashboardData.hotLeadsPrevQuarter || 1)) *
                  100,
                icon: <FiThermometer className="text-white" size={16} />, // changed size
                color: "bg-red-600",
              },
              {
                title: selectedUserId ? "Your Warm Leads" : "Team Warm Leads",
                value: dashboardData.warmLeads.toLocaleString(),
                change:
                  ((dashboardData.warmLeads - dashboardData.warmLeadsPrevQuarter) /
                    (dashboardData.warmLeadsPrevQuarter || 1)) *
                  100,
                icon: <FiThermometer className="text-white" size={16} />, // changed size
                color: "bg-amber-500",
              },
              {
                title: selectedUserId ? "Your Cold Leads" : "Team Cold Leads",
                value: dashboardData.coldLeads.toLocaleString(),
                change:
                  ((dashboardData.coldLeads - dashboardData.coldLeadsPrevQuarter) /
                    (dashboardData.coldLeadsPrevQuarter || 1)) *
                  100,
                icon: <FiThermometer className="text-white" size={16} />, // changed size
                color: "bg-blue-600",
              },
              {
                title: selectedUserId
                  ? "Your Projected TCV"
                  : "Team Projected TCV",
                value: `₹${dashboardData.projectedTCV.toLocaleString()}`,
                change:
                  ((dashboardData.projectedTCV -
                    dashboardData.projectedTCVPrevQuarter) /
                    (dashboardData.projectedTCVPrevQuarter || 1)) *
                  100,
                icon: <FiTrendingUp className="text-white" size={16} />, // changed size
                color: "bg-green-600",
              },
            ].map((metric, index) => (
              <div
                key={index}
                className={`${metric.color} rounded-xl p-5 text-white transition-all hover:shadow-lg`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium opacity-80">
                      {metric.title}
                    </p>
                    <h3
                      className="text-2xl font-bold mt-1 truncate"
                      style={{ maxWidth: "140px", display: "block" }} // adjust width as needed
                      title={metric.value}
                    >
                      {metric.value}
                    </h3>
                  </div>
                  <div className="bg-black bg-opacity-20 p-1 rounded-lg"> {/* changed p-2 to p-1 */}
                    {metric.icon}
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      metric.change >= 0 || isNaN(metric.change)
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {isNaN(metric.change)
                      ? "↑ 0%"
                      : metric.change >= 0
                      ? `↑ ${Math.abs(metric.change).toFixed(1)}%`
                      : `↓ ${Math.abs(metric.change).toFixed(1)}%`}
                  </span>
                  <span className="text-xs opacity-80 ml-2">vs last quarter</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts & Distribution */}
        <div className="w-full overflow-x-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 min-w-0">
            <div className="bg-white p-3 md:p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-2 min-w-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Revenue Trend
                </h2>
                <div className="flex space-x-2">
                  {["week", "month", "quarter", "year"].map((period) => (
                    <button
                      type="button"
                      key={period}
                      onClick={() => setTimePeriod(period)}
                      className={`text-xs px-3 py-1 rounded-full ${
                        timePeriod === period
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-80">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dashboardData.chartData}
                      margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#4F46E5"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4F46E5"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E5E7EB"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#6B7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#6B7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={<CustomTooltip timePeriod={timePeriod} />}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4F46E5"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            <div className="bg-white p-3 md:p-5 rounded-xl border border-gray-200 shadow-sm min-w-0">
              {/* Lead Distribution Box */}
              <div className="">
                <h3 className="text-md font-semibold text-gray-800 mb-3">
                  Lead Distribution
                </h3>
                <LeadDistribution
                  leadSources={dashboardData.leadSources}
                  isLoading={isLoading}
                />
              </div>

              {/* Education Distribution Box */}
              <div className="">
                <h3 className="text-md font-semibold text-gray-800 mb-3">
                  Education Distribution
                </h3>
                <EducationDistribution
                  leadCategories={dashboardData.leadCategories}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Performance & Activity */}
        <div className="w-full overflow-x-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
            <div className="bg-white p-3 md:p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-2 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedUserId ? "Your Performance" : "Team Performance"}
              </h2>
              <TeamPerformance
                teamPerformance={dashboardData.teamPerformance}
                isLoading={isLoading}
                selectedUserId={selectedUserId}
              />
            </div>
            <div className="bg-white p-3 md:p-5 rounded-xl border border-gray-200 shadow-sm min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              <RecentActivity
                recentActivity={dashboardData.recentActivity}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;