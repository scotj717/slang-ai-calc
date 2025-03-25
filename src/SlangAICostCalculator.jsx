import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ReferenceDot, Label, BarChart, Bar, PieChart, Pie, Cell, Area, ComposedChart
} from 'recharts';
import _ from 'lodash';

const EnhancedSlangAICalculator = () => {
  // Days of the week
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Staff state
  const [numberOfHosts, setNumberOfHosts] = useState(4);
  const [staffMembers, setStaffMembers] = useState([
    { id: 0, name: 'Host 1', wage: 16, efficiency: 85, shifts: daysOfWeek.map(() => ({ lunch: 4, dinner: 0 })) },
    { id: 1, name: 'Host 2', wage: 16, efficiency: 90, shifts: daysOfWeek.map(() => ({ lunch: 0, dinner: 4 })) },
    { id: 2, name: 'Host 3', wage: 16, efficiency: 80, shifts: daysOfWeek.map(() => ({ lunch: 3, dinner: 0 })) },
    { id: 3, name: 'Host 4', wage: 16, efficiency: 88, shifts: daysOfWeek.map(() => ({ lunch: 0, dinner: 3 })) }
  ]);
  
  // Call metrics
  const [callsPerWeek, setCallsPerWeek] = useState(410);
  const [missedCallPercentage, setMissedCallPercentage] = useState(12);
  const [callTypes, setCallTypes] = useState([
    { name: 'Information', percentage: 30, avgTime: 2, automationRate: 85 },
    { name: 'Order', percentage: 45, avgTime: 3.5, automationRate: 65 },
    { name: 'Reservation', percentage: 25, avgTime: 4, automationRate: 75 }
  ]);
  
  // Additional inputs state
  const [employeeBenefitsPercent, setEmployeeBenefitsPercent] = useState(25);
  const [callGrowthRate, setCallGrowthRate] = useState(5);
  const [projectionMonths, setProjectionMonths] = useState(12);
  const [slangPlan, setSlangPlan] = useState(399);
  const [implementationComplexity, setImplementationComplexity] = useState(2); // 1-5 scale, 5 being most complex
  const [riskTolerance, setRiskTolerance] = useState(3); // 1-5 scale, 5 being highest risk tolerance
  const [seasonalityProfile, setSeasonalityProfile] = useState('standard'); // standard, tourism, retail, etc.
  
  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedStaffId, setExpandedStaffId] = useState(null);
  const [showSensitivityAnalysis, setShowSensitivityAnalysis] = useState(false);
  const [sensitivityFactor, setSensitivityFactor] = useState('automationRate');
  const [confidenceInterval, setConfidenceInterval] = useState(80); // percentage: 80% confidence interval
  const [showSeasonality, setShowSeasonality] = useState(false);
  
  // Results state
  const [chartData, setChartData] = useState([]);
  const [breakEvenPoint, setBreakEvenPoint] = useState(null);
  const [projectionData, setProjectionData] = useState([]);
  const [timeDistributionData, setTimeDistributionData] = useState([]);
  const [callTypeDistribution, setCallTypeDistribution] = useState([]);
  const [reputationData, setReputationData] = useState({});
  
  // Metrics state
  const [metrics, setMetrics] = useState({
    currentWithoutSlangAI: 0,
    currentWithSlangAI: 0,
    monthlySavings: 0,
    annualSavings: 0,
    roi: 0,
    paybackPeriod: 0,
    monthlyCallHours: 0,
    monthlySavedHours: 0,
    costPerCallWithout: 0,
    costPerCallWith: 0,
    costReductionPercent: 0,
    fteFreed: 0,
    avgCallTime: 0,
    weightedAutomationRate: 0,
    totalWeeklyHours: 0,
    
    // By call type metrics
    infoCallHours: 0,
    orderCallHours: 0,
    reservationCallHours: 0,
    infoCallsSaved: 0,
    orderCallsSaved: 0,
    reservationCallsSaved: 0,
    
    // Reputation metrics
    reputationScore: 0,
    missedCallImpact: 0
  });

  // Update staff member
  const updateStaffMember = (id, field, value) => {
    setStaffMembers(prev => {
      const newStaff = [...prev];
      if (field === 'name' || field === 'wage' || field === 'efficiency') {
        newStaff[id][field] = value;
      }
      return newStaff;
    });
  };

  // Update staff shift
  const updateStaffShift = (staffId, dayIndex, shiftType, hours) => {
    setStaffMembers(prev => {
      const newStaff = [...prev];
      newStaff[staffId].shifts[dayIndex][shiftType] = hours;
      return newStaff;
    });
  };

  // Update call type
  const updateCallType = (index, field, value) => {
    setCallTypes(prev => {
      const newCallTypes = [...prev];
      newCallTypes[index][field] = value;
      
      // Ensure percentages add up to 100
      if (field === 'percentage') {
        const sum = newCallTypes.reduce((acc, type) => acc + type.percentage, 0);
        if (sum !== 100) {
          // Adjust other percentages proportionally
          const adjustmentFactor = (100 - value) / (sum - value);
          newCallTypes.forEach((type, i) => {
            if (i !== index) {
              type.percentage = Math.round(type.percentage * adjustmentFactor);
            }
          });
        }
      }
      
      return newCallTypes;
    });
  };

  // Calculate reputation metrics based on missed calls
  const calculateReputationMetrics = () => {
    // Calculate base reputation score (100 - missed call %)
    const baseScore = 100 - missedCallPercentage;
    
    // Calculate customer satisfaction impact
    const impactPerMissedCall = 2.5;
    const missedCallsPerWeek = (callsPerWeek * missedCallPercentage) / 100;
    const weeklyImpactedCustomers = missedCallsPerWeek * impactPerMissedCall;
    
    // Calculate financial impact of missed calls
    const missedOrderPercentage = 40;
    const avgOrderValue = 35;
    const weeklyLostRevenue = missedCallsPerWeek * (missedOrderPercentage / 100) * avgOrderValue;
    const monthlyLostRevenue = weeklyLostRevenue * 4.3;
    
    // Calculate improvement with Slang.AI
    const slangAIHandledMissedPercentage = 85;
    const missedCallsWithSlangAI = missedCallsPerWeek * (1 - slangAIHandledMissedPercentage / 100);
    const missedCallPercentageWithSlangAI = (missedCallsWithSlangAI / callsPerWeek) * 100;
    const reputationScoreWithSlangAI = 100 - missedCallPercentageWithSlangAI;
    
    // Calculate confidence intervals (95%)
    const stdev = missedOrderPercentage * 0.15; // Standard deviation assumed at 15% of the mean
    const stderr = stdev / Math.sqrt(callsPerWeek); // Standard error
    const zScore = 1.96; // 95% confidence interval
    
    const lowerBound = Math.max(0, missedOrderPercentage - (zScore * stderr));
    const upperBound = Math.min(100, missedOrderPercentage + (zScore * stderr));
    
    // Calculate risk-adjusted improvement based on implementation complexity
    const complexityFactor = 1 - (implementationComplexity * 0.05); // 5% reduction per complexity point
    const riskAdjustedImprovement = slangAIHandledMissedPercentage * complexityFactor;
    
    return {
      baseScore,
      scoreWithSlangAI: reputationScoreWithSlangAI,
      weeklyImpactedCustomers,
      monthlyLostRevenue,
      confidenceInterval: {
        lower: lowerBound,
        upper: upperBound
      },
      riskAdjustedImprovement
    };
  };

  // Calculate all metrics
  useEffect(() => {
    // Calculate total weekly hours by staff
    const activeStaff = staffMembers.slice(0, numberOfHosts);
    
    const totalWeeklyHours = activeStaff.reduce((sum, staff) => {
      const staffHours = staff.shifts.reduce((shiftSum, day) => {
        return shiftSum + day.lunch + day.dinner;
      }, 0);
      return sum + staffHours;
    }, 0);
    
    const weeksPerMonth = 4.3; // Average weeks per month
    const totalMonthlyHours = totalWeeklyHours * weeksPerMonth;
    
    // Calculate weighted average call time
    const weightedAvgCallTime = callTypes.reduce((sum, type) => {
      return sum + (type.percentage / 100) * type.avgTime;
    }, 0);
    
    // Calculate weighted automation rate
    const weightedAutomationRate = callTypes.reduce((sum, type) => {
      return sum + (type.percentage / 100) * (type.automationRate / 100);
    }, 0) * 100;
    
    // Calculate call hours by type
    const safeCallsPerWeek = callsPerWeek || 0;
    const weeklyCallHours = (safeCallsPerWeek * weightedAvgCallTime) / 60; // Convert minutes to hours
    const monthlyCallHours = weeklyCallHours * weeksPerMonth;
    
    // Call hours by type
    const infoCallHours = monthlyCallHours * (callTypes[0].percentage / 100);
    const orderCallHours = monthlyCallHours * (callTypes[1].percentage / 100);
    const reservationCallHours = monthlyCallHours * (callTypes[2].percentage / 100);
    
    // Saved hours by type
    const infoCallsSaved = infoCallHours * (callTypes[0].automationRate / 100);
    const orderCallsSaved = orderCallHours * (callTypes[1].automationRate / 100);
    const reservationCallsSaved = reservationCallHours * (callTypes[2].automationRate / 100);
    
    // Total saved hours
    const monthlySavedHours = infoCallsSaved + orderCallsSaved + reservationCallsSaved;
    
    // Calculate average wage
    const currentAvgWage = activeStaff.length > 0 
      ? activeStaff.reduce((sum, staff) => sum + staff.wage, 0) / activeStaff.length 
      : 0;
    
    // Add employee benefits multiplier
    const wageMultiplier = 1 + (employeeBenefitsPercent / 100);
    
    // Calculate labor cost without Slang.AI using each staff's actual wage
    let laborCostWithoutSlangAI = 0;
    for (let i = 0; i < activeStaff.length; i++) {
      const staffWeeklyHours = activeStaff[i].shifts.reduce((sum, day) => sum + day.lunch + day.dinner, 0);
      laborCostWithoutSlangAI += activeStaff[i].wage * wageMultiplier * staffWeeklyHours * weeksPerMonth;
    }
    
    // Calculate labor cost with Slang.AI
    // Distribution of saved hours proportional to staff hours
    const savedHoursPerStaff = [];
    let remainingSavedHours = monthlySavedHours;
    
    for (let i = 0; i < activeStaff.length; i++) {
      const staffWeeklyHours = activeStaff[i].shifts.reduce((sum, day) => sum + day.lunch + day.dinner, 0);
      const staffMonthlyHours = staffWeeklyHours * weeksPerMonth;
      const staffProportion = totalMonthlyHours > 0 ? (staffMonthlyHours / totalMonthlyHours) : 0;
      const staffSavedHours = Math.min(staffMonthlyHours, remainingSavedHours * staffProportion);
      savedHoursPerStaff.push(staffSavedHours);
      remainingSavedHours -= staffSavedHours;
    }
    
    let laborCostWithSlangAI = 0;
    for (let i = 0; i < activeStaff.length; i++) {
      const staffWeeklyHours = activeStaff[i].shifts.reduce((sum, day) => sum + day.lunch + day.dinner, 0);
      const staffMonthlyHours = staffWeeklyHours * weeksPerMonth;
      const adjustedHours = Math.max(0, staffMonthlyHours - savedHoursPerStaff[i]);
      laborCostWithSlangAI += activeStaff[i].wage * wageMultiplier * adjustedHours;
    }
    
    // Add Slang.AI subscription cost
    laborCostWithSlangAI += slangPlan;
    
    // Generate data for the wage line chart
    const wagePoints = [];
    for (let wage = 10; wage <= 30; wage += 1) {
      wagePoints.push(wage);
    }
    
    const data = wagePoints.map(wage => {
      const totalMonthlyLaborAtWage = wage * wageMultiplier * totalMonthlyHours;
      const adjustedMonthlyLaborAtWage = wage * wageMultiplier * (totalMonthlyHours - monthlySavedHours) + slangPlan;
      
      return {
        wage,
        withoutSlangAI: totalMonthlyLaborAtWage,
        withSlangAI: adjustedMonthlyLaborAtWage,
        savings: totalMonthlyLaborAtWage - adjustedMonthlyLaborAtWage
      };
    });
    
    // Find break-even point
    let breakEven = null;
    for (let i = 0; i < data.length - 1; i++) {
      if ((data[i].withoutSlangAI - data[i].withSlangAI) * (data[i+1].withoutSlangAI - data[i+1].withSlangAI) <= 0) {
        // Linear interpolation for break-even point
        const x1 = data[i].wage;
        const y1 = data[i].withoutSlangAI - data[i].withSlangAI;
        const x2 = data[i+1].wage;
        const y2 = data[i+1].withoutSlangAI - data[i+1].withSlangAI;
        const x = x1 - y1 * (x2 - x1) / (y2 - y1);
        
        breakEven = {
          wage: parseFloat(x.toFixed(2)),
          cost: data[i].withoutSlangAI + (data[i+1].withoutSlangAI - data[i].withoutSlangAI) * 
                ((x - x1) / (x2 - x1))
        };
        break;
      }
    }
    
    // Calculate additional metrics
    const monthlySavings = laborCostWithoutSlangAI - laborCostWithSlangAI;
    const annualSavings = monthlySavings * 12;
    const annualSlangCost = slangPlan * 12;
    const roi = annualSlangCost > 0 ? ((annualSavings / annualSlangCost) * 100) : 0;
    const paybackPeriod = monthlySavings > 0 ? (slangPlan / monthlySavings) : Infinity;
    
    // Calculate cost per call
    const monthlyCalls = safeCallsPerWeek * weeksPerMonth;
    const costPerCallWithout = monthlyCalls > 0 ? (laborCostWithoutSlangAI / monthlyCalls) : 0;
    const costPerCallWith = monthlyCalls > 0 ? (laborCostWithSlangAI / monthlyCalls) : 0;
    const costReductionPercent = laborCostWithoutSlangAI > 0 ? (monthlySavings / laborCostWithoutSlangAI) * 100 : 0;
    const fteFreed = monthlySavedHours / 160; // Assuming 160 hours per month is 1 FTE
    
    // Generate projection data (for bar chart)
    const projData = [];
    for (let month = 1; month <= projectionMonths; month++) {
      // Calculate growth in calls
      const growthFactor = Math.pow(1 + (callGrowthRate / 100), month / 12);
      const monthlyCallsWithGrowth = safeCallsPerWeek * weeksPerMonth * growthFactor;
      const monthlyCallHoursWithGrowth = (monthlyCallsWithGrowth * weightedAvgCallTime) / 60;
      
      // Calculate costs with growth
      const costWithoutSlangWithGrowth = currentAvgWage * wageMultiplier * 
                                        (totalMonthlyHours - monthlyCallHours + monthlyCallHoursWithGrowth);
      
      const savedHoursWithGrowth = monthlyCallHoursWithGrowth * (weightedAutomationRate / 100);
      const costWithSlangWithGrowth = currentAvgWage * wageMultiplier * 
                                      (totalMonthlyHours - monthlyCallHours + monthlyCallHoursWithGrowth - savedHoursWithGrowth) + 
                                      slangPlan;
      
      const monthlySavingsWithGrowth = costWithoutSlangWithGrowth - costWithSlangWithGrowth;
      const cumulativeSavings = month === 1 ? monthlySavingsWithGrowth : 
                               projData[month-2].cumulativeSavings + monthlySavingsWithGrowth;
      
      const monthlyROI = slangPlan > 0 ? (monthlySavingsWithGrowth / slangPlan) * 100 : 0;
      
      projData.push({
        month,
        monthlySavings: monthlySavingsWithGrowth,
        cumulativeSavings: cumulativeSavings,
        roi: monthlyROI,
        callVolume: monthlyCallsWithGrowth
      });
    }
    
    // Generate time distribution data (for pie chart)
    const timeDistData = [
      { name: 'Time Saved', value: monthlySavedHours, fill: '#10b981' },
      { name: 'Remaining Time', value: monthlyCallHours - monthlySavedHours, fill: '#3b82f6' }
    ];
    
    // Generate call type distribution data
    const callTypeDistData = callTypes.map(type => ({
      name: type.name,
      value: type.percentage,
      time: type.avgTime,
      automationRate: type.automationRate,
      fill: type.name === 'Information' ? '#ef4444' : type.name === 'Order' ? '#3b82f6' : '#f59e0b'
    }));
    
    // Calculate reputation metrics
    const repMetrics = calculateReputationMetrics();
    
    // Update state
    setChartData(data);
    setBreakEvenPoint(breakEven);
    setProjectionData(projData);
    setTimeDistributionData(timeDistData);
    setCallTypeDistribution(callTypeDistData);
    setReputationData(repMetrics);
    
    // Update metrics
    setMetrics({
      currentWithoutSlangAI: laborCostWithoutSlangAI,
      currentWithSlangAI: laborCostWithSlangAI,
      monthlySavings,
      annualSavings,
      roi,
      paybackPeriod,
      monthlyCallHours,
      monthlySavedHours,
      costPerCallWithout,
      costPerCallWith,
      costReductionPercent,
      fteFreed,
      avgCallTime: weightedAvgCallTime,
      weightedAutomationRate,
      totalWeeklyHours,
      
      // By call type metrics
      infoCallHours,
      orderCallHours,
      reservationCallHours,
      infoCallsSaved,
      orderCallsSaved,
      reservationCallsSaved,
      
      // Reputation metrics
      reputationScore: repMetrics.baseScore,
      missedCallImpact: repMetrics.weeklyImpactedCustomers,
    });
    
  }, [
    numberOfHosts, staffMembers, callsPerWeek, callTypes, 
    employeeBenefitsPercent, callGrowthRate, projectionMonths, slangPlan,
    missedCallPercentage
  ]);

  // Formatting functions
  const formatCurrency = (value) => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return `$${safeValue.toFixed(2)}`;
  };

  const formatWage = (value) => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return `$${safeValue.toFixed(2)}`;
  };

  const formatPercent = (value) => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return `${safeValue.toFixed(1)}%`;
  };

  const formatHours = (value) => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return `${safeValue.toFixed(1)} hrs`;
  };

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length >= 2) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-sm">{`Hourly Wage: ${formatWage(label)}`}</p>
          <p className="text-blue-500">{`Without Slang.AI: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-green-500">{`With Slang.AI: ${formatCurrency(payload[1].value)}`}</p>
          <p className="text-purple-500">{`Savings: ${formatCurrency(payload[0].value - payload[1].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  const ProjectionTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length >= 3) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-sm">{`Month ${label}`}</p>
          <p className="text-blue-500">{`Monthly Savings: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-green-500">{`Cumulative Savings: ${formatCurrency(payload[1].value)}`}</p>
          <p className="text-purple-500">{`ROI: ${formatPercent(payload[2].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  const PieChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-sm">{payload[0].name}</p>
          <p className="text-gray-700">{`${payload[0].value.toFixed(1)} hours`}</p>
        </div>
      );
    }
    return null;
  };

  // Render metric card
  const MetricCard = ({ title, value, description, isPositive, isCurrency, isPercentage, isTime, isHours }) => {
    let formattedValue = value;
    
    if (isCurrency) {
      formattedValue = formatCurrency(value);
    } else if (isPercentage) {
      formattedValue = formatPercent(value);
    } else if (isTime) {
      if (value === Infinity) {
        formattedValue = 'N/A';
      } else if (value <= 0) {
        formattedValue = 'Immediate';
      } else if (value <= 1) {
        formattedValue = '< 1 month';
      } else {
        formattedValue = `${value.toFixed(1)} months`;
      }
    } else if (isHours) {
      formattedValue = formatHours(value);
    }
    
    const colorClass = isPositive === undefined ? 'text-blue-600' : 
                        isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <p className={`text-lg font-bold ${colorClass}`}>{formattedValue}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    );
  };

  // Render staff section
  const renderStaffSection = () => {
    return (
      <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Staff Configuration</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Staff
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="1"
              max="4"
              value={numberOfHosts}
              onChange={(e) => setNumberOfHosts(parseInt(e.target.value))}
              className="flex-grow mr-2"
            />
            <span className="w-8 text-center font-medium">{numberOfHosts}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">Staff Details</h3>
          
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hourly Wage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weekly Hours</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffMembers.slice(0, numberOfHosts).map((staff, index) => {
                  const totalHours = staff.shifts.reduce((sum, day) => sum + day.lunch + day.dinner, 0);
                  
                  return (
                    <React.Fragment key={staff.id}>
                      <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input 
                            type="text" 
                            value={staff.name} 
                            onChange={(e) => updateStaffMember(staff.id, 'name', e.target.value)} 
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm mr-1">$</span>
                            <input 
                              type="number" 
                              min="7.25" 
                              step="0.25" 
                              value={staff.wage} 
                              onChange={(e) => updateStaffMember(staff.id, 'wage', parseFloat(e.target.value) || 0)} 
                              className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                            />
                            <span className="text-sm ml-1">/hr</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium">{totalHours} hours</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => setExpandedStaffId(expandedStaffId === staff.id ? null : staff.id)} 
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {expandedStaffId === staff.id ? 'Hide Shifts' : 'Edit Shifts'}
                          </button>
                        </td>
                      </tr>
                      
                      {expandedStaffId === staff.id && (
                        <tr>
                          <td colSpan="4" className="px-4 py-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h4 className="font-medium text-sm mb-2">Weekly Schedule</h4>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">Lunch Shift (hrs)</th>
                                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">Dinner Shift (hrs)</th>
                                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {daysOfWeek.map((day, dayIndex) => (
                                      <tr key={dayIndex} className={dayIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">{day}</td>
                                        <td className="px-2 py-2 whitespace-nowrap">
                                          <input 
                                            type="number" 
                                            min="0"
                                            max="12" 
                                            step="0.5" 
                                            value={staff.shifts[dayIndex].lunch} 
                                            onChange={(e) => updateStaffShift(staff.id, dayIndex, 'lunch', parseFloat(e.target.value) || 0)} 
                                            className="border border-gray-300 rounded px-2 py-1 text-sm w-16 text-center"
                                          />
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap">
                                          <input 
                                            type="number" 
                                            min="0" 
                                            max="12"
                                            step="0.5" 
                                            value={staff.shifts[dayIndex].dinner} 
                                            onChange={(e) => updateStaffShift(staff.id, dayIndex, 'dinner', parseFloat(e.target.value) || 0)} 
                                            className="border border-gray-300 rounded px-2 py-1 text-sm w-16 text-center"
                                          />
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-center">
                                          {staff.shifts[dayIndex].lunch + staff.shifts[dayIndex].dinner} hrs
                                        </td>
                                      </tr>
                                    ))}
                                    <tr className="bg-gray-100">
                                      <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">Weekly Total</td>
                                      <td className="px-2 py-2 whitespace-nowrap text-sm text-center">
                                        {staff.shifts.reduce((sum, day) => sum + day.lunch, 0)} hrs
                                      </td>
                                      <td className="px-2 py-2 whitespace-nowrap text-sm text-center">
                                        {staff.shifts.reduce((sum, day) => sum + day.dinner, 0)} hrs
                                      </td>
                                      <td className="px-2 py-2 whitespace-nowrap text-sm text-center font-medium">
                                        {staff.shifts.reduce((sum, day) => sum + day.lunch + day.dinner, 0)} hrs
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Call types section
  const renderCallTypesSection = () => {
    return (
      <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Call Metrics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weekly Call Volume
            </label>
            <input
              type="number"
              min="1"
              value={callsPerWeek}
              onChange={(e) => setCallsPerWeek(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Missed Call Percentage
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={missedCallPercentage} 
                onChange={(e) => setMissedCallPercentage(parseInt(e.target.value) || 0)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <span className="text-sm ml-1">%</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slang.AI Plan
            </label>
            <select
              value={slangPlan}
              onChange={(e) => setSlangPlan(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="399">Core Plan ($399/month)</option>
              <option value="599">Premium Plan ($599/month)</option>
              <option value="799">Advanced Plan ($799/month)</option>
              <option value="999">Enterprise Plan ($999/month)</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">Call Type Breakdown</h3>
          
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time (min)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Automation Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {callTypes.map((type, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium">{type.name}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={type.percentage} 
                          onChange={(e) => updateCallType(index, 'percentage', parseInt(e.target.value) || 0)} 
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
                        />
                        <span className="text-sm ml-1">%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          min="0.1" 
                          step="0.1" 
                          value={type.avgTime} 
                          onChange={(e) => updateCallType(index, 'avgTime', parseFloat(e.target.value) || 0.1)} 
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
                        />
                        <span className="text-sm ml-1">min</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={type.automationRate} 
                          onChange={(e) => updateCallType(index, 'automationRate', parseInt(e.target.value))} 
                          className="flex-grow mr-2"
                        />
                        <span className="w-8 text-center text-sm">{type.automationRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">Additional Inputs</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Benefits (%)
              </label>
              <div className="flex items-center">
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={employeeBenefitsPercent} 
                  onChange={(e) => setEmployeeBenefitsPercent(parseInt(e.target.value) || 0)} 
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
                <span className="text-sm ml-1">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Includes payroll taxes, insurance, etc.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call Growth Rate (% per year)
              </label>
              <div className="flex items-center">
                <input 
                  type="number" 
                  min="-20" 
                  max="100" 
                  value={callGrowthRate} 
                  onChange={(e) => setCallGrowthRate(parseInt(e.target.value) || 0)} 
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
                <span className="text-sm ml-1">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Projected annual growth in call volume</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Projection Months
              </label>
              <input 
                type="number" 
                min="3" 
                max="60" 
                value={projectionMonths} 
                onChange={(e) => setProjectionMonths(parseInt(e.target.value) || 12)} 
                className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Number of months to project savings</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Summary metrics
  const renderSummaryMetrics = () => {
    return (
      <div className="mb-8 bg-blue-50 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Cost Summary</h2>
        
        {/* Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700">Monthly Cost Without Slang.AI</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.currentWithoutSlangAI)}</p>
            <p className="text-xs text-gray-500">Including employee benefits</p>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700">Monthly Cost With Slang.AI</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.currentWithSlangAI)}</p>
            <p className="text-xs text-gray-500">Including subscription cost</p>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200 shadow-sm border-l-4 border-l-green-500">
            <h3 className="text-sm font-medium text-gray-700">Monthly Savings</h3>
            <p className={`text-2xl font-bold ${metrics.monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.monthlySavings >= 0 ? '+' : ''}{formatCurrency(metrics.monthlySavings)}
            </p>
            <p className="text-xs text-gray-500">
              {formatPercent(metrics.costReductionPercent)} reduction in costs
            </p>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200 shadow-sm border-l-4 border-l-red-500">
            <h3 className="text-sm font-medium text-gray-700">Break-Even Point</h3>
            {breakEvenPoint ? (
              <div>
                <p className="text-2xl font-bold text-red-600">{formatWage(breakEvenPoint.wage)}/hr</p>
                <p className="text-xs text-gray-500 mt-1">
                  {breakEvenPoint.wage <= (staffMembers.slice(0, numberOfHosts).reduce((sum, staff) => sum + staff.wage, 0) / numberOfHosts) ? 
                    `Current avg wage exceeds break-even - Cost-effective` :
                    `Current avg wage below break-even - Not cost-effective yet`
                  }
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-400">N/A</p>
            )}
          </div>
        </div>
        
        {/* Secondary Metrics */}
        <h3 className="text-sm font-medium text-gray-700 mt-4 mb-2">Advanced Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <MetricCard 
            title="Annual Savings" 
            value={metrics.annualSavings} 
            description="Projected yearly impact"
            isPositive={metrics.annualSavings >= 0}
            isCurrency
          />
          <MetricCard 
            title="ROI" 
            value={metrics.roi} 
            description="Return on investment"
            isPositive={metrics.roi >= 0}
            isPercentage
          />
          <MetricCard 
            title="Payback Period" 
            value={metrics.paybackPeriod} 
            description="Time to recover investment"
            isTime
          />
          <MetricCard 
            title="Staff Time Saved" 
            value={metrics.monthlySavedHours} 
            description="Hours per month"
            isPositive
            isHours
          />
          <MetricCard 
            title="FTE Equivalent" 
            value={metrics.fteFreed} 
            description="Full-time employees freed"
            isPositive
          />
          <MetricCard 
            title="Cost Per Call" 
            value={metrics.costPerCallWithout} 
            description={`vs ${formatCurrency(metrics.costPerCallWith)} with Slang.AI`}
            isCurrency
          />
        </div>
      </div>
    );
  };

  // Render talent management tab
  const renderTalentManagement = () => {
    return (
      <div className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Talent Management Recommendations</h2>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-lg text-blue-700 mb-2">Optimal Staff Allocation</h3>
            <p className="text-gray-600 mb-4">
              Based on your current call volume of {callsPerWeek} calls per week and an average call time of {metrics.avgCallTime.toFixed(1)} minutes, 
              we recommend the following staff allocation strategy with Slang.AI integration:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <h4 className="font-medium text-sm text-blue-800 mb-1">Current Staff Hours</h4>
                <p className="text-3xl font-bold text-blue-700">{metrics.totalWeeklyHours.toFixed(1)}</p>
                <p className="text-xs text-blue-600">Weekly staff hours</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <h4 className="font-medium text-sm text-green-800 mb-1">Hours Saved with Slang.AI</h4>
                <p className="text-3xl font-bold text-green-700">{(metrics.monthlySavedHours / 4.3).toFixed(1)}</p>
                <p className="text-xs text-green-600">Weekly hours saved</p>
              </div>
              
              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <h4 className="font-medium text-sm text-purple-800 mb-1">Optimal Staff Hours</h4>
                <p className="text-3xl font-bold text-purple-700">{(metrics.totalWeeklyHours - (metrics.monthlySavedHours / 4.3)).toFixed(1)}</p>
                <p className="text-xs text-purple-600">With Slang.AI implemented</p>
              </div>
            </div>
            
            <h4 className="font-medium text-md mt-6 mb-3">Staffing Strategy Options</h4>
            
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white font-bold rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-1">
                    1
                  </div>
                  <div className="ml-3">
                    <h5 className="font-medium text-blue-800">Cost Minimization Strategy</h5>
                    <p className="text-sm mt-1">Reduce staff hours by {Math.min(metrics.monthlySavedHours / 4.3, metrics.totalWeeklyHours * 0.3).toFixed(1)} hours per week, focusing on lower-traffic periods.</p>
                    <p className="text-sm mt-1">Monthly savings potential: {formatCurrency(metrics.monthlySavings * 0.9)}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-start">
                  <div className="bg-green-500 text-white font-bold rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-1">
                    2
                  </div>
                  <div className="ml-3">
                    <h5 className="font-medium text-green-800">Service Quality Strategy (Recommended)</h5>
                    <p className="text-sm mt-1">Maintain current staffing but reallocate {Math.min(metrics.monthlySavedHours / 4.3, metrics.totalWeeklyHours * 0.2).toFixed(1)} hours per week to higher-value customer interactions.</p>
                    <p className="text-sm mt-1">Improve customer satisfaction while still saving {formatCurrency(metrics.monthlySavings * 0.7)} monthly.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                <div className="flex items-start">
                  <div className="bg-purple-500 text-white font-bold rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-1">
                    3
                  </div>
                  <div className="ml-3">
                    <h5 className="font-medium text-purple-800">Growth Preparation Strategy</h5>
                    <p className="text-sm mt-1">Keep current staffing levels and use Slang.AI to handle projected {callGrowthRate}% annual call growth without additional hiring.</p>
                    <p className="text-sm mt-1">Focus staff training on complex interactions and upselling opportunities.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-lg text-blue-700 mb-2">Staff Training & Transition Plan</h3>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-medium text-md mb-2">Phase 1: Preparation (2 Weeks)</h4>
                <ul className="list-disc ml-5 space-y-1 text-sm">
                  <li>Conduct team meetings to explain Slang.AI implementation and benefits</li>
                  <li>Identify call types and patterns that Slang.AI will handle</li>
                  <li>Document current processes and identify areas for improvement</li>
                </ul>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-medium text-md mb-2">Phase 2: Implementation (2 Weeks)</h4>
                <ul className="list-disc ml-5 space-y-1 text-sm">
                  <li>Train staff on Slang.AI interaction, handoffs, and monitoring</li>
                  <li>Provide upskilling opportunities for staff to handle complex interactions</li>
                  <li>Implement progressive rollout of Slang.AI capabilities</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-md mb-2">Phase 3: Optimization (Ongoing)</h4>
                <ul className="list-disc ml-5 space-y-1 text-sm">
                  <li>Regular review of call metrics and staff feedback</li>
                  <li>Further refinement of automation rules and handoffs</li>
                  <li>Continuous training on new features and capabilities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render reputation impact tab
  const renderReputationImpact = () => {
    return (
      <div className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Customer Experience & Reputation Impact</h2>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-lg text-blue-700 mb-2">Current Reputation Metrics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <h4 className="font-medium text-sm text-red-800 mb-1">Missed Calls</h4>
                <p className="text-3xl font-bold text-red-700">{missedCallPercentage}%</p>
                <p className="text-xs text-red-600">{(callsPerWeek * missedCallPercentage / 100).toFixed(0)} calls per week</p>
              </div>
              
              <div className="bg-orange-50 p-3 rounded border border-orange-200">
                <h4 className="font-medium text-sm text-orange-800 mb-1">Impacted Customers</h4>
                <p className="text-3xl font-bold text-orange-700">{metrics.missedCallImpact.toFixed(0)}</p>
                <p className="text-xs text-orange-600">Potential weekly impact</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <h4 className="font-medium text-sm text-blue-800 mb-1">Reputation Score</h4>
                <p className="text-3xl font-bold text-blue-700">{metrics.reputationScore.toFixed(1)}</p>
                <p className="text-xs text-blue-600">Out of 100 points</p>
              </div>
              
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <h4 className="font-medium text-sm text-red-800 mb-1">Monthly Revenue Loss</h4>
                <p className="text-3xl font-bold text-red-700">{formatCurrency(reputationData.monthlyLostRevenue || 0)}</p>
                <p className="text-xs text-red-600">From missed orders</p>
              </div>
            </div>
            
            <h4 className="font-medium text-md mt-6 mb-3">Impact of Slang.AI Implementation</h4>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="font-medium text-green-800 text-sm">Missed Call Reduction</h5>
                  <div className="flex items-baseline mt-1">
                    <span className="text-2xl font-bold text-green-700">{missedCallPercentage}%</span>
                    <span className="text-lg font-bold text-green-700 mx-2">→</span>
                    <span className="text-2xl font-bold text-green-700">{(missedCallPercentage * 0.15).toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">85% reduction in missed calls</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-green-800 text-sm">Reputation Score Improvement</h5>
                  <div className="flex items-baseline mt-1">
                    <span className="text-2xl font-bold text-green-700">{metrics.reputationScore.toFixed(1)}</span>
                    <span className="text-lg font-bold text-green-700 mx-2">→</span>
                    <span className="text-2xl font-bold text-green-700">{reputationData?.scoreWithSlangAI?.toFixed(1) || (metrics.reputationScore + 10).toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">{(((reputationData?.scoreWithSlangAI || (metrics.reputationScore + 10)) - metrics.reputationScore) / metrics.reputationScore * 100).toFixed(1)}% improvement</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-green-800 text-sm">Monthly Revenue Recovery</h5>
                  <div className="flex items-baseline mt-1">
                    <span className="text-2xl font-bold text-green-700">+{formatCurrency((reputationData?.monthlyLostRevenue || 0) * 0.85)}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">From previously missed orders</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Additional Customer Experience Benefits</h4>
              <ul className="list-disc ml-5 space-y-2 text-sm">
                <li><span className="font-medium">24/7 Availability:</span> Never miss another call, even outside business hours</li>
                <li><span className="font-medium">Consistent Experience:</span> Every caller receives the same high-quality information</li>
                <li><span className="font-medium">Reduced Wait Times:</span> Most common queries resolved instantly without holding</li>
                <li><span className="font-medium">Staff Focus:</span> Team members can focus on complex customer interactions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render charts section
  const renderCharts = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Cost Breakdown Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-md font-semibold mb-4">Monthly Cost vs. Hourly Wage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="wage" 
                  label={{ value: 'Hourly Wage ($)', position: 'insideBottom', offset: -5 }} 
                  tickFormatter={formatWage}
                />
                <YAxis 
                  label={{ value: 'Monthly Cost ($)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="withoutSlangAI" 
                  name="Without Slang.AI" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={false} 
                />
                <Line 
                  type="monotone" 
                  dataKey="withSlangAI" 
                  name="With Slang.AI" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={false} 
                />
                {breakEvenPoint && (
                  <ReferenceDot
                    x={breakEvenPoint.wage}
                    y={breakEvenPoint.cost}
                    r={6}
                    fill="red"
                    stroke="none"
                  >
                    <Label value="Break-even" position="top" />
                  </ReferenceDot>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {breakEvenPoint ? 
              `Slang.AI becomes cost-effective when hourly wages exceed ${formatWage(breakEvenPoint.wage)}` :
              "No break-even point found within the wage range"
            }
          </p>
        </div>
        
        {/* Projection Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-md font-semibold mb-4">Savings Projection ({projectionMonths} Months)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Savings ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<ProjectionTooltip />} />
                <Legend />
                <Bar dataKey="monthlySavings" name="Monthly Savings" fill="#3b82f6" />
                <Line type="monotone" dataKey="cumulativeSavings" name="Cumulative Savings" stroke="#10b981" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Projected cumulative savings over time with {callGrowthRate}% annual call growth
          </p>
        </div>
      </div>
    );
  };
  
  // Render pie charts section
  const renderPieCharts = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Time Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-md font-semibold mb-4">Time Savings Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={timeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {timeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<PieChartTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {formatHours(metrics.monthlySavedHours)} saved per month from {formatHours(metrics.monthlyCallHours)} total
          </p>
        </div>
        
        {/* Call Type Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-md font-semibold mb-4">Call Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={callTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {callTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<PieChartTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Distribution of call types affects overall automation rate
          </p>
        </div>
      </div>
    );
  };

  // Render tabs
  const renderTabs = () => {
    return (
      <div className="flex mb-6 border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'talent' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('talent')}
        >
          Talent Management
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'reputation' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('reputation')}
        >
          Reputation Impact
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'analysis' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('analysis')}
        >
          Advanced Analysis
        </button>
      </div>
    );
  };

  // Render dashboard tab
  const renderDashboard = () => {
    return (
      <div>
        {/* Staff Section */}
        {renderStaffSection()}
        
        {/* Call Types Section */}
        {renderCallTypesSection()}
        
        {/* Summary Metrics */}
        {renderSummaryMetrics()}
        
        {/* Visual Charts */}
        {renderCharts()}
        
        {/* Pie Charts */}
        {renderPieCharts()}
      </div>
    );
  };

  // Render Advanced Analysis Tab
  const renderAdvancedAnalysis = () => {
    // Generate sensitivity analysis data
    const generateSensitivityData = () => {
      let data = [];
      
      if (sensitivityFactor === 'automationRate') {
        // Test automation rates from 40% to 100% in 5% increments
        for (let rate = 40; rate <= 100; rate += 5) {
          // Calculate ROI at this automation rate
          const adjustedCallTypes = callTypes.map(type => ({
            ...type,
            automationRate: rate
          }));
          
          // Calculate weighted automation impact
          const weightedRate = adjustedCallTypes.reduce((sum, type) => {
            return sum + (type.percentage / 100) * (rate / 100);
          }, 0) * 100;
          
          // Calculate savings
          const monthlySavedHours = (callsPerWeek * 4.3 * metrics.avgCallTime / 60) * (weightedRate / 100);
          const monthlySavings = monthlySavedHours * 
            (staffMembers.slice(0, numberOfHosts).reduce((sum, staff) => sum + staff.wage, 0) / numberOfHosts) * 
            (1 + employeeBenefitsPercent / 100);
          
          // Calculate ROI
          const roi = ((monthlySavings * 12) / (slangPlan * 12)) * 100;
          
          data.push({
            automationRate: rate,
            roi: roi,
            savings: monthlySavings
          });
        }
      } else if (sensitivityFactor === 'callVolume') {
        // Test call volumes from -50% to +100% of current
        const baseVolume = callsPerWeek;
        for (let change = -50; change <= 100; change += 10) {
          const adjustedVolume = baseVolume * (1 + change / 100);
          
          // Calculate impact on savings
          const monthlySavedHours = (adjustedVolume * 4.3 * metrics.avgCallTime / 60) * (metrics.weightedAutomationRate / 100);
          const monthlySavings = monthlySavedHours * 
            (staffMembers.slice(0, numberOfHosts).reduce((sum, staff) => sum + staff.wage, 0) / numberOfHosts) * 
            (1 + employeeBenefitsPercent / 100);
          
          // Calculate ROI
          const roi = ((monthlySavings * 12) / (slangPlan * 12)) * 100;
          
          data.push({
            change: change,
            callVolume: adjustedVolume,
            roi: roi,
            savings: monthlySavings
          });
        }
      }
      
      return data;
    };
    
    // Generate seasonality model data
    const generateSeasonalityData = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Seasonality profiles
      const profiles = {
        standard: [0.9, 0.95, 1.0, 1.05, 1.1, 1.05, 1.0, 0.95, 1.0, 1.05, 1.1, 1.2],
        tourism: [0.7, 0.8, 0.9, 1.0, 1.1, 1.3, 1.5, 1.6, 1.2, 0.9, 0.8, 0.7],
        retail: [0.8, 0.7, 0.8, 0.9, 1.0, 0.9, 0.9, 1.0, 1.1, 1.2, 1.5, 1.8],
        education: [1.2, 1.3, 1.1, 1.0, 1.3, 0.8, 0.6, 0.7, 1.4, 1.2, 1.1, 0.9]
      };
      
      const selectedProfile = profiles[seasonalityProfile] || profiles.standard;
      
      return months.map((month, i) => {
        const seasonalFactor = selectedProfile[i];
        const adjustedCallVolume = callsPerWeek * seasonalFactor;
        
        // Calculate monthly metrics with this call volume
        const monthlyCallHours = (adjustedCallVolume * 4.3 * metrics.avgCallTime / 60);
        const monthlySavedHours = monthlyCallHours * (metrics.weightedAutomationRate / 100);
        const monthlySavings = monthlySavedHours * 
          (staffMembers.slice(0, numberOfHosts).reduce((sum, staff) => sum + staff.wage, 0) / numberOfHosts) * 
          (1 + employeeBenefitsPercent / 100);
        
        return {
          month,
          callVolume: adjustedCallVolume,
          savingsWithSlangAI: monthlySavings,
          seasonalFactor
        };
      });
    };
    
    // Generate confidence interval data for projections
    const generateConfidenceIntervalData = () => {
      // Create data for projection with confidence intervals
      return projectionData.map(point => {
        // Calculate standard error based on month (increasing uncertainty over time)
        const timeUncertainty = 0.02 * point.month; // 2% more uncertainty per month
        const baseUncertainty = 0.05; // 5% base uncertainty
        const totalUncertainty = baseUncertainty + timeUncertainty;
        
        // Calculate upper and lower bounds based on confidence interval
        const confidenceZ = confidenceInterval === 95 ? 1.96 : 
                           confidenceInterval === 90 ? 1.645 : 
                           confidenceInterval === 80 ? 1.28 : 1.0;
        
        const margin = point.monthlySavings * totalUncertainty * confidenceZ;
        
        return {
          ...point,
          upperBound: point.monthlySavings + margin,
          lowerBound: Math.max(0, point.monthlySavings - margin)
        };
      });
    };
    
    // Risk-adjusted ROI calculation
    const calculateRiskAdjustedROI = () => {
      // Scale from 1-5 to 0.7-1.0 risk adjustment factor
      const complexityRiskFactor = 1 - (implementationComplexity * 0.06);
      
      // Adjust risk factor based on risk tolerance
      const riskToleranceAdjustment = (riskTolerance - 3) * 0.03; // +/- 3% per level of risk tolerance
      const combinedRiskFactor = complexityRiskFactor + riskToleranceAdjustment;
      
      // Apply risk factor to ROI
      const riskAdjustedROI = metrics.roi * combinedRiskFactor;
      
      return {
        baseROI: metrics.roi,
        riskAdjustedROI: riskAdjustedROI,
        riskFactor: combinedRiskFactor
      };
    };
    
    const riskAdjustedMetrics = calculateRiskAdjustedROI();
    const sensitivityData = generateSensitivityData();
    const seasonalData = generateSeasonalityData();
    const confidenceData = generateConfidenceIntervalData();
    
    return (
      <div>
        <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Advanced Financial Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Sensitivity Analysis */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-lg text-blue-700 mb-3">Sensitivity Analysis</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variable to Test
                </label>
                <select
                  value={sensitivityFactor}
                  onChange={(e) => setSensitivityFactor(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                >
                  <option value="automationRate">Automation Rate</option>
                  <option value="callVolume">Call Volume</option>
                </select>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensitivityData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={sensitivityFactor === 'automationRate' ? 'automationRate' : 'change'} 
                      label={{ 
                        value: sensitivityFactor === 'automationRate' ? 'Automation Rate (%)' : 'Call Volume Change (%)', 
                        position: 'insideBottom', 
                        offset: -5 
                      }} 
                    />
                    <YAxis 
                      label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="roi" 
                      name="ROI %" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                How changes in {sensitivityFactor === 'automationRate' ? 'automation rate' : 'call volume'} affect your ROI
              </p>
            </div>
            
            {/* Risk-Adjusted ROI */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-lg text-blue-700 mb-3">Risk-Adjusted ROI Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Implementation Complexity (1-5)
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={implementationComplexity} 
                    onChange={(e) => setImplementationComplexity(parseInt(e.target.value))} 
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 px-1">
                    <span>Simple</span>
                    <span>Complex</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Tolerance (1-5)
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={riskTolerance} 
                    onChange={(e) => setRiskTolerance(parseInt(e.target.value))} 
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 px-1">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-center mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Standard ROI</h4>
                  <p className="text-4xl font-bold text-blue-600">{formatPercent(riskAdjustedMetrics.baseROI)}</p>
                </div>
                
                <div className="text-4xl text-gray-300">↓</div>
                
                <div className="text-center mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Risk-Adjusted ROI</h4>
                  <p className={`text-4xl font-bold ${riskAdjustedMetrics.riskAdjustedROI >= riskAdjustedMetrics.baseROI ? 'text-green-600' : 'text-yellow-600'}`}>
                    {formatPercent(riskAdjustedMetrics.riskAdjustedROI)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Risk adjustment factor: {(riskAdjustedMetrics.riskFactor * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Confidence Intervals */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-lg text-blue-700 mb-3">Projection with Confidence Intervals</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confidence Level
                </label>
                <select
                  value={confidenceInterval}
                  onChange={(e) => setConfidenceInterval(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                >
                  <option value="80">80% Confidence</option>
                  <option value="90">90% Confidence</option>
                  <option value="95">95% Confidence</option>
                </select>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={confidenceData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Monthly Savings ($)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="upperBound" fillOpacity="0.2" stroke="none" fill="#3b82f6" name="Upper Bound" />
                    <Area type="monotone" dataKey="lowerBound" fillOpacity="0" stroke="none" fill="#3b82f6" name="Lower Bound" />
                    <Line type="monotone" dataKey="monthlySavings" name="Expected Savings" stroke="#3b82f6" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {confidenceInterval}% confidence interval for monthly savings projections
              </p>
            </div>
            
            {/* Seasonality Analysis */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-lg text-blue-700 mb-3">Seasonal Variation Analysis</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Seasonality Profile
                </label>
                <select
                  value={seasonalityProfile}
                  onChange={(e) => setSeasonalityProfile(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                >
                  <option value="standard">Standard</option>
                  <option value="tourism">Tourism/Hospitality</option>
                  <option value="retail">Retail</option>
                  <option value="education">Education</option>
                </select>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={seasonalData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" label={{ value: 'Call Volume', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Savings ($)', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="callVolume" name="Call Volume" fill="#3b82f6" />
                    <Line yAxisId="right" type="monotone" dataKey="savingsWithSlangAI" name="Savings with Slang.AI" stroke="#10b981" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Monthly variations based on {seasonalityProfile} business seasonality profile
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Main render
  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Slang.AI ROI Calculator</h1>
      
      {/* Tab Navigation */}
      {renderTabs()}
      
      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'talent' && renderTalentManagement()}
      {activeTab === 'reputation' && renderReputationImpact()}
      {activeTab === 'analysis' && renderAdvancedAnalysis()}
    </div>
  );
};

export default EnhancedSlangAICalculator;