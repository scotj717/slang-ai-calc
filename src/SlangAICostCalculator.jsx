import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
  Label,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter
} from 'recharts';
import _ from 'lodash';

const AdvancedSlangAICalculator = () => {
  // Main inputs state
  const [numberOfHosts, setNumberOfHosts] = useState(4);
  const [hoursPerHost, setHoursPerHost] = useState(Array(10).fill(15));
  const [wagePerHost, setWagePerHost] = useState(Array(10).fill(16));
  const [callsPerWeek, setCallsPerWeek] = useState(410);
  const [avgCallTime, setAvgCallTime] = useState(3);
  const [percentSaved, setPercentSaved] = useState(70);
  const [slangPlan, setSlangPlan] = useState(399);

  // Additional inputs state
  const [employeeBenefitsPercent, setEmployeeBenefitsPercent] = useState(25);
  const [callGrowthRate, setCallGrowthRate] = useState(5);
  const [projectionMonths, setProjectionMonths] = useState(12);
  const [callTypes, setCallTypes] = useState([
    { name: 'Sales', percentage: 30, avgTime: 4, automationRate: 65 },
    { name: 'Support', percentage: 45, avgTime: 3, automationRate: 75 },
    { name: 'General', percentage: 25, avgTime: 2, automationRate: 60 }
  ]);

  // New additional inputs
  const [trainingCost, setTrainingCost] = useState(500);
  const [implementationTimeWeeks, setImplementationTimeWeeks] = useState(2);
  const [staffTurnoverRate, setStaffTurnoverRate] = useState(15);
  const [customerSatisfactionImpact, setCustomerSatisfactionImpact] = useState(5);
  const [revenueImpactPercent, setRevenueImpactPercent] = useState(2);
  const [avgRevenuePerCall, setAvgRevenuePerCall] = useState(25);
  const [missedCallsPercent, setMissedCallsPercent] = useState(8);
  const [hoursOfOperation, setHoursOfOperation] = useState({
    mon: { open: 8, close: 17, enabled: true },
    tue: { open: 8, close: 17, enabled: true },
    wed: { open: 8, close: 17, enabled: true },
    thu: { open: 8, close: 17, enabled: true },
    fri: { open: 8, close: 17, enabled: true },
    sat: { open: 10, close: 15, enabled: false },
    sun: { open: 10, close: 15, enabled: false }
  });
  const [afterHoursCallPercent, setAfterHoursCallPercent] = useState(12);
  const [seasonalityFactors, setSeasonalityFactors] = useState([
    { month: 'Jan', factor: 0.9 },
    { month: 'Feb', factor: 0.85 },
    { month: 'Mar', factor: 0.95 },
    { month: 'Apr', factor: 1.0 },
    { month: 'May', factor: 1.05 },
    { month: 'Jun', factor: 1.1 },
    { month: 'Jul', factor: 1.15 },
    { month: 'Aug', factor: 1.2 },
    { month: 'Sep', factor: 1.05 },
    { month: 'Oct', factor: 1.0 },
    { month: 'Nov', factor: 1.1 },
    { month: 'Dec', factor: 1.3 }
  ]);

  // UI state
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showBusinessImpact, setShowBusinessImpact] = useState(false);
  const [showHoursOfOperation, setShowHoursOfOperation] = useState(false);
  const [showSeasonality, setShowSeasonality] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedView, setSelectedView] = useState('financial');

  // Results state
  const [chartData, setChartData] = useState([]);
  const [breakEvenPoint, setBreakEvenPoint] = useState(null);
  const [projectionData, setProjectionData] = useState([]);
  const [timeDistributionData, setTimeDistributionData] = useState([]);
  const [callTypeDistribution, setCallTypeDistribution] = useState([]);
  const [seasonalProjections, setSeasonalProjections] = useState([]);
  const [weekdayData, setWeekdayData] = useState([]);
  const [comparativeMetrics, setComparativeMetrics] = useState([]);
  const [sensitivityAnalysis, setSensitivityAnalysis] = useState([]);

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
    // New metrics
    firstYearTCO: 0,
    fiveYearTCO: 0,
    implementationCosts: 0,
    afterHoursSavings: 0,
    missedCallRevenueLoss: 0,
    missedCallRevenueRecovered: 0,
    customerRetentionValue: 0,
    callQualityScore: 0,
    seasonalityCostVariance: 0,
    peakSeasonSavings: 0,
    totalWorkingHours: 0,
    staffUtilizationRate: 0,
    callAutomationRateWeighted: 0,
    threeYearNPV: 0,
    carbonFootprintReduction: 0,
    trainingTimeSaved: 0
  });

  // Update hours or wages for a specific host
  const updateHostHours = (index, value) => {
    const newHours = [...hoursPerHost];
    newHours[index] = value;
    setHoursPerHost(newHours);
  };

  const updateHostWage = (index, value) => {
    const newWages = [...wagePerHost];
    newWages[index] = value;
    setWagePerHost(newWages);
  };

  const updateCallType = (index, field, value) => {
    const newCallTypes = [...callTypes];
    newCallTypes[index][field] = value;
    if (field === 'percentage') {
      const sum = newCallTypes.reduce((acc, type) => acc + type.percentage, 0);
      if (sum !== 100) {
        const adjustmentFactor = (100 - value) / (sum - value);
        newCallTypes.forEach((type, i) => {
          if (i !== index) {
            type.percentage = Math.round(type.percentage * adjustmentFactor);
          }
        });
      }
    }
    setCallTypes(newCallTypes);
  };

  const updateSeasonalFactor = (index, value) => {
    const newFactors = [...seasonalityFactors];
    newFactors[index].factor = value;
    setSeasonalityFactors(newFactors);
  };

  const updateHoursOfOperation = (day, field, value) => {
    setHoursOfOperation(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: field === 'enabled' ? value : parseInt(value)
      }
    }));
  };

  // Calculate all metrics
  useEffect(() => {
    const safeNumberOfHosts = numberOfHosts === '' || isNaN(numberOfHosts) ? 1 : numberOfHosts;
    const safeHoursPerHost = hoursPerHost.map(h => (h === '' || isNaN(h) ? 0 : h));
    const safeWagePerHost = wagePerHost.map(w => (w === '' || isNaN(w) ? 4.74 : w));
    const safeCallsPerWeek = callsPerWeek === '' || isNaN(callsPerWeek) ? 0 : callsPerWeek;
    const safeAvgCallTime = avgCallTime === '' || isNaN(avgCallTime) ? 0.1 : avgCallTime;

    const wagePoints = [];
    for (let wage = 4.74; wage <= 30; wage += 0.5) {
      wagePoints.push(parseFloat(wage.toFixed(2)));
    }

    const totalWeeklyHours = safeHoursPerHost.slice(0, safeNumberOfHosts).reduce((sum, hours) => sum + hours, 0);
    const weeksPerMonth = 4.3;
    const totalMonthlyHours = totalWeeklyHours * weeksPerMonth;

    const weeklyCallHours = (safeCallsPerWeek * safeAvgCallTime) / 60;
    const monthlyCallHours = weeklyCallHours * weeksPerMonth;

    const weightedAutomationRate = callTypes.reduce((sum, type) => {
      return sum + (type.percentage / 100) * (type.automationRate / 100);
    }, 0) * 100;

    const effectivePercentSaved = Math.max(percentSaved, weightedAutomationRate);
    const monthlySavedHours = monthlyCallHours * (effectivePercentSaved / 100);

    const currentAvgWage =
      safeNumberOfHosts > 0
        ? safeWagePerHost.slice(0, safeNumberOfHosts).reduce((sum, wage) => sum + wage, 0) / safeNumberOfHosts
        : 0;

    const wageMultiplier = 1 + employeeBenefitsPercent / 100;

    let laborCostWithoutSlangAI = 0;
    for (let i = 0; i < safeNumberOfHosts; i++) {
      laborCostWithoutSlangAI += safeWagePerHost[i] * wageMultiplier * safeHoursPerHost[i] * weeksPerMonth;
    }

    const savedHoursPerHost = [];
    let remainingSavedHours = monthlySavedHours;
    for (let i = 0; i < safeNumberOfHosts; i++) {
      const hostMonthlyHours = safeHoursPerHost[i] * weeksPerMonth;
      const hostProportion = hostMonthlyHours / totalMonthlyHours || 0;
      const hostSavedHours = Math.min(hostMonthlyHours, remainingSavedHours * hostProportion);
      savedHoursPerHost.push(hostSavedHours);
      remainingSavedHours -= hostSavedHours;
    }

    let laborCostWithSlangAI = 0;
    for (let i = 0; i < safeNumberOfHosts; i++) {
      const hostMonthlyHours = safeHoursPerHost[i] * weeksPerMonth;
      const adjustedHours = Math.max(0, hostMonthlyHours - savedHoursPerHost[i]);
      laborCostWithSlangAI += safeWagePerHost[i] * wageMultiplier * adjustedHours;
    }
    laborCostWithSlangAI += slangPlan;

    const data = wagePoints.map(wage => {
      const totalMonthlyLaborAtWage = wage * wageMultiplier * totalMonthlyHours;
      const adjustedMonthlyLaborAtWage = wage * wageMultiplier * (totalMonthlyHours - monthlySavedHours) + slangPlan;
      return {
        wage,
        withoutSlangAI: totalMonthlyLaborAtWage,
        withSlangAI: adjustedMonthlyLaborAtWage
      };
    });

    let breakEven = null;
    for (let i = 0; i < data.length - 1; i++) {
      if ((data[i].withoutSlangAI - data[i].withSlangAI) * (data[i + 1].withoutSlangAI - data[i + 1].withSlangAI) <= 0) {
        const x1 = data[i].wage;
        const y1 = data[i].withoutSlangAI - data[i].withSlangAI;
        const x2 = data[i + 1].wage;
        const y2 = data[i + 1].withoutSlangAI - data[i + 1].withSlangAI;
        const x = x1 - (y1 * (x2 - x1)) / (y2 - y1);
        breakEven = {
          wage: parseFloat(x.toFixed(2)),
          cost: data[i].withoutSlangAI + (data[i + 1].withoutSlangAI - data[i].withoutSlangAI) * ((x - x1) / (x2 - x1))
        };
        break;
      }
    }

    const monthlySavings = laborCostWithoutSlangAI - laborCostWithSlangAI;
    const annualSavings = monthlySavings * 12;
    const annualSlangCost = slangPlan * 12;
    const roi = annualSlangCost > 0 ? (annualSavings / annualSlangCost) * 100 : 0;
    const paybackPeriod = monthlySavings > 0 ? slangPlan / monthlySavings : Infinity;

    const monthlyCalls = safeCallsPerWeek * weeksPerMonth;
    const costPerCallWithout = monthlyCalls > 0 ? laborCostWithoutSlangAI / monthlyCalls : 0;
    const costPerCallWith = monthlyCalls > 0 ? laborCostWithSlangAI / monthlyCalls : 0;
    const costReductionPercent = laborCostWithoutSlangAI > 0 ? (monthlySavings / laborCostWithoutSlangAI) * 100 : 0;
    const fteFreed = monthlySavedHours / 160;

    const implementationCosts = trainingCost + (implementationTimeWeeks * totalWeeklyHours * currentAvgWage * wageMultiplier * 0.1);
    const firstYearTCO = slangPlan * 12 + implementationCosts - annualSavings;
    const fiveYearTCO = slangPlan * 60 + implementationCosts - annualSavings * 5;

    const staffUtilizationRate =
      totalMonthlyHours > 0 ? ((totalMonthlyHours - monthlySavedHours) / totalMonthlyHours) * 100 : 0;

    const workingHoursPerWeek = Object.values(hoursOfOperation).reduce((sum, day) => {
      return day.enabled ? sum + (day.close - day.open) : sum;
    }, 0);
    const totalBusinessHours = workingHoursPerWeek * 4.3;
    const afterHoursSavings = (afterHoursCallPercent / 100) * monthlyCalls * costPerCallWithout;

    const missedCallsPerMonth = monthlyCalls * (missedCallsPercent / 100);
    const missedCallRevenueLoss = missedCallsPerMonth * avgRevenuePerCall;
    const missedCallRevenueRecovered = missedCallRevenueLoss * (effectivePercentSaved / 100);

    const customerRetentionValue = monthlyCalls * (customerSatisfactionImpact / 100) * avgRevenuePerCall * 3;
    const callQualityScore = 75 + customerSatisfactionImpact * 2;

    const avgSeasonalFactor = seasonalityFactors.reduce((sum, month) => sum + month.factor, 0) / 12;
    const maxSeasonalFactor = Math.max(...seasonalityFactors.map(month => month.factor));
    const seasonalityCostVariance = (maxSeasonalFactor - avgSeasonalFactor) * monthlyCallHours * currentAvgWage * wageMultiplier;
    const peakSeasonSavings = maxSeasonalFactor * monthlySavings;

    const discountRate = 0.08;
    let threeYearNPV = -implementationCosts;
    for (let i = 1; i <= 36; i++) {
      const monthlyDiscountFactor = Math.pow(1 + discountRate / 12, i);
      threeYearNPV += monthlySavings / monthlyDiscountFactor;
    }

    const carbonFootprintReduction = fteFreed * 1.2;
    const trainingTimeSaved = (staffTurnoverRate / 100) * safeNumberOfHosts * 20 * (effectivePercentSaved / 100);

    const projData = [];
    for (let month = 1; month <= projectionMonths; month++) {
      const growthFactor = Math.pow(1 + callGrowthRate / 100, month / 12);
      const monthlyCallsWithGrowth = safeCallsPerWeek * weeksPerMonth * growthFactor;
      const monthlyCallHoursWithGrowth = (monthlyCallsWithGrowth * safeAvgCallTime) / 60;
      const costWithoutSlangWithGrowth = currentAvgWage * wageMultiplier * (totalMonthlyHours - monthlyCallHours + monthlyCallHoursWithGrowth);
      const savedHoursWithGrowth = monthlyCallHoursWithGrowth * (effectivePercentSaved / 100);
      const costWithSlangWithGrowth = currentAvgWage * wageMultiplier * (totalMonthlyHours - monthlyCallHours + monthlyCallHoursWithGrowth - savedHoursWithGrowth) + slangPlan;
      const monthlySavingsWithGrowth = costWithoutSlangWithGrowth - costWithSlangWithGrowth;
      const cumulativeSavings = month === 1 ? monthlySavingsWithGrowth : projData[month - 2].cumulativeSavings + monthlySavingsWithGrowth;
      const monthlyROI = slangPlan > 0 ? (monthlySavingsWithGrowth / slangPlan) * 100 : 0;
      projData.push({
        month,
        monthlySavings: monthlySavingsWithGrowth,
        cumulativeSavings,
        roi: monthlyROI,
        callVolume: monthlyCallsWithGrowth
      });
    }

    const timeDistData = [
      { name: 'Time Saved', value: monthlySavedHours, fill: '#10b981' },
      { name: 'Remaining Time', value: monthlyCallHours - monthlySavedHours, fill: '#3b82f6' }
    ];

    const callTypeDistData = callTypes.map(type => ({
      name: type.name,
      value: type.percentage,
      time: type.avgTime,
      automationRate: type.automationRate,
      fill: type.name === 'Sales' ? '#ef4444' : type.name === 'Support' ? '#3b82f6' : '#f59e0b'
    }));

    const seasonalProjData = seasonalityFactors.map(month => {
      const monthlyCalls = safeCallsPerWeek * weeksPerMonth * month.factor;
      const monthlyCallHours = (monthlyCalls * safeAvgCallTime) / 60;
      const savedHours = monthlyCallHours * (effectivePercentSaved / 100);
      const costWithout = currentAvgWage * wageMultiplier * monthlyCallHours;
      const costWith = currentAvgWage * wageMultiplier * (monthlyCallHours - savedHours) + slangPlan;
      const savings = costWithout - costWith;
      return {
        month: month.month,
        factor: month.factor,
        costWithoutSlangAI: costWithout,
        costWithSlangAI: costWith,
        savings,
        callVolume: monthlyCalls
      };
    });

    const weekdayData = [
      { name: 'Monday', calls: safeCallsPerWeek * 0.22, hours: hoursOfOperation.mon.enabled ? hoursOfOperation.mon.close - hoursOfOperation.mon.open : 0 },
      { name: 'Tuesday', calls: safeCallsPerWeek * 0.20, hours: hoursOfOperation.tue.enabled ? hoursOfOperation.tue.close - hoursOfOperation.tue.open : 0 },
      { name: 'Wednesday', calls: safeCallsPerWeek * 0.19, hours: hoursOfOperation.wed.enabled ? hoursOfOperation.wed.close - hoursOfOperation.wed.open : 0 },
      { name: 'Thursday', calls: safeCallsPerWeek * 0.18, hours: hoursOfOperation.thu.enabled ? hoursOfOperation.thu.close - hoursOfOperation.thu.open : 0 },
      { name: 'Friday', calls: safeCallsPerWeek * 0.16, hours: hoursOfOperation.fri.enabled ? hoursOfOperation.fri.close - hoursOfOperation.fri.open : 0 },
      { name: 'Saturday', calls: safeCallsPerWeek * 0.03, hours: hoursOfOperation.sat.enabled ? hoursOfOperation.sat.close - hoursOfOperation.sat.open : 0 },
      { name: 'Sunday', calls: safeCallsPerWeek * 0.02, hours: hoursOfOperation.sun.enabled ? hoursOfOperation.sun.close - hoursOfOperation.sun.open : 0 }
    ];

    const comparativeMetrics = [
      { metric: 'Cost Savings', withoutSlangAI: 0, withSlangAI: 75 },
      { metric: 'Staff Utilization', withoutSlangAI: 100, withSlangAI: staffUtilizationRate },
      { metric: 'After-hours Coverage', withoutSlangAI: 20, withSlangAI: 90 },
      { metric: 'Call Quality', withoutSlangAI: 85, withSlangAI: callQualityScore },
      { metric: 'Revenue Impact', withoutSlangAI: 50, withSlangAI: 50 + revenueImpactPercent * 5 },
      { metric: 'Scalability', withoutSlangAI: 40, withSlangAI: 85 }
    ];

    const sensitivityData = [];
    for (let wageMultiplierFactor = 0.7; wageMultiplierFactor <= 1.3; wageMultiplierFactor += 0.1) {
      const adjustedWage = currentAvgWage * wageMultiplierFactor;
      const costWithout = adjustedWage * wageMultiplierFactor * totalMonthlyHours;
      const costWith = adjustedWage * wageMultiplierFactor * (totalMonthlyHours - monthlySavedHours) + slangPlan;
      sensitivityData.push({
        factor: 'Wage',
        multiplier: wageMultiplierFactor.toFixed(1),
        savings: costWithout - costWith,
        roi: ((costWithout - costWith) * 12 / (slangPlan * 12)) * 100
      });
    }
    for (let volumeMultiplier = 0.7; volumeMultiplier <= 1.3; volumeMultiplier += 0.1) {
      const adjustedCalls = safeCallsPerWeek * volumeMultiplier;
      const adjustedCallHours = (adjustedCalls * safeAvgCallTime) / 60 * weeksPerMonth;
      const adjustedSavedHours = adjustedCallHours * (effectivePercentSaved / 100);
      const costWithout = currentAvgWage * wageMultiplier * (totalMonthlyHours - monthlyCallHours + adjustedCallHours);
      const costWith = currentAvgWage * wageMultiplier * (totalMonthlyHours - monthlyCallHours + adjustedCallHours - adjustedSavedHours) + slangPlan;
      sensitivityData.push({
        factor: 'Call Volume',
        multiplier: volumeMultiplier.toFixed(1),
        savings: costWithout - costWith,
        roi: ((costWithout - costWith) * 12 / (slangPlan * 12)) * 100
      });
    }

    setChartData(data);
    setBreakEvenPoint(breakEven);
    setProjectionData(projData);
    setTimeDistributionData(timeDistData);
    setCallTypeDistribution(callTypeDistData);
    setSeasonalProjections(seasonalProjData);
    setWeekdayData(weekdayData);
    setComparativeMetrics(comparativeMetrics);
    setSensitivityAnalysis(sensitivityData);

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
      firstYearTCO,
      fiveYearTCO,
      implementationCosts,
      afterHoursSavings,
      missedCallRevenueLoss,
      missedCallRevenueRecovered,
      customerRetentionValue,
      callQualityScore,
      seasonalityCostVariance,
      peakSeasonSavings,
      totalWorkingHours: totalBusinessHours,
      staffUtilizationRate,
      callAutomationRateWeighted: effectivePercentSaved,
      threeYearNPV,
      carbonFootprintReduction,
      trainingTimeSaved
    });
  }, [
    numberOfHosts,
    hoursPerHost,
    wagePerHost,
    callsPerWeek,
    avgCallTime,
    percentSaved,
    slangPlan,
    employeeBenefitsPercent,
    callGrowthRate,
    projectionMonths,
    callTypes,
    trainingCost,
    implementationTimeWeeks,
    staffTurnoverRate,
    customerSatisfactionImpact,
    revenueImpactPercent,
    avgRevenuePerCall,
    missedCallsPercent,
    hoursOfOperation,
    afterHoursCallPercent,
    seasonalityFactors
  ]);

  // Helper functions
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

  const formatNumber = (value) => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return safeValue.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (
      active &&
      payload &&
      payload.length >= 2 &&
      payload[0] &&
      payload[0].value !== undefined &&
      payload[1] &&
      payload[1].value !== undefined
    ) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-sm">{`Hourly Wage: ${formatWage(label)}`}</p>
          <p className="text-blue-500">{`Without Slang.AI: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-green-500">{`With Slang.AI: ${formatCurrency(payload[1].value)}`}</p>
          <p className="text-purple-500">{`Savings: ${formatCurrency(payload[0].value - payload[1].value)}`}</p>
          <p className="text-gray-500 text-xs mt-2">Monthly labor cost</p>
        </div>
      );
    }
    return null;
  };

  const ProjectionTooltip = ({ active, payload, label }) => {
    if (
      active &&
      payload &&
      payload.length >= 3 &&
      payload[0] &&
      payload[0].value !== undefined &&
      payload[1] &&
      payload[1].value !== undefined &&
      payload[2] &&
      payload[2].value !== undefined
    ) {
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
    if (
      active &&
      payload &&
      payload.length &&
      payload[0] &&
      payload[0].value !== undefined &&
      payload[0].name
    ) {
      const percentage = metrics.monthlyCallHours
        ? (payload[0].value / metrics.monthlyCallHours) * 100
        : 0;
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-sm">{payload[0].name}</p>
          <p className="text-gray-700">{`${payload[0].value.toFixed(1)} hours (${percentage.toFixed(1)}%)`}</p>
        </div>
      );
    }
    return null;
  };

  const CallTypeTooltip = ({ active, payload }) => {
    if (active && payload && payload.length && payload[0]) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-sm">{payload[0].name}</p>
          <p className="text-gray-700">{`${payload[0].value}% of calls`}</p>
          <p className="text-gray-700">{`Avg time: ${payload[0].payload.time} min`}</p>
          <p className="text-gray-700">{`Automation: ${payload[0].payload.automationRate}%`}</p>
        </div>
      );
    }
    return null;
  };

  const SeasonalTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length >= 3) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-sm">{label}</p>
          <p className="text-blue-500">{`Without Slang.AI: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-green-500">{`With Slang.AI: ${formatCurrency(payload[1].value)}`}</p>
          <p className="text-purple-500">{`Savings: ${formatCurrency(payload[2].value)}`}</p>
          <p className="text-gray-500">{`Seasonal Factor: ${payload[0].payload.factor.toFixed(2)}x`}</p>
        </div>
      );
    }
    return null;
  };

  const currentAvgWage =
    numberOfHosts > 0
      ? wagePerHost.slice(0, numberOfHosts).reduce((sum, wage) => sum + (wage === '' || isNaN(wage) ? 0 : wage), 0) / numberOfHosts
      : 0;

  const MetricCard = ({ title, value, description, isPositive, isCurrency, isPercentage, isTime, icon }) => {
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
    }
    const colorClass = isPositive === undefined ? 'text-blue-600' : isPositive ? 'text-green-600' : 'text-red-600';
    return (
      <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          {icon && <span className="mr-1 text-blue-500">{icon}</span>}
          {title}
        </h3>
        <p className={`text-lg font-bold ${colorClass}`}>{formattedValue}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    );
  };

  const renderAdvancedMetrics = () => {
    if (selectedView === 'financial') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <MetricCard
            title="Annual Savings"
            value={metrics.annualSavings}
            description="Projected yearly impact"
            isPositive={metrics.annualSavings >= 0}
            isCurrency
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 0v8" />
              </svg>
            }
          />
          <MetricCard
            title="ROI"
            value={metrics.roi}
            description="Return on investment"
            isPositive={metrics.roi >= 0}
            isPercentage
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <MetricCard
            title="Payback Period"
            value={metrics.paybackPeriod}
            description="Time to recover investment"
            isTime
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <MetricCard
            title="5-Year TCO"
            value={metrics.fiveYearTCO}
            description="Total cost of ownership"
            isPositive={metrics.fiveYearTCO < 0}
            isCurrency
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              </svg>
            }
          />
          <MetricCard
            title="3-Year NPV"
            value={metrics.threeYearNPV}
            description="Net present value"
            isPositive={metrics.threeYearNPV >= 0}
            isCurrency
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            }
          />
          <MetricCard
            title="Implementation Cost"
            value={metrics.implementationCosts}
            description="Setup & training costs"
            isPositive={false}
            isCurrency
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37" />
              </svg>
            }
          />
        </div>
      );
    } else if (selectedView === 'operational') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <MetricCard
            title="Staff Time Saved"
            value={metrics.monthlySavedHours}
            description="Hours per month"
            isPositive
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <MetricCard
            title="FTE Equivalent"
            value={metrics.fteFreed}
            description="Full-time employees freed"
            isPositive
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <MetricCard
            title="Staff Utilization"
            value={metrics.staffUtilizationRate}
            description="Remaining work percentage"
            isPercentage
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              </svg>
            }
          />
          <MetricCard
            title="Automation Rate"
            value={metrics.callAutomationRateWeighted}
            description="Weighted by call type"
            isPercentage
            isPositive
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517" />
              </svg>
            }
          />
          <MetricCard
            title="Call Quality Score"
            value={metrics.callQualityScore}
            description="Out of 100"
            isPositive={metrics.callQualityScore >= 75}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915" />
              </svg>
            }
          />
          <MetricCard
            title="Training Time Saved"
            value={metrics.trainingTimeSaved}
            description="Hours per year"
            isPositive
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13" />
              </svg>
            }
          />
        </div>
      );
    } else if (selectedView === 'revenue') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <MetricCard
            title="After-Hours Savings"
            value={metrics.afterHoursSavings}
            description="Monthly cost avoided"
            isPositive
            isCurrency
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
          />
          <MetricCard
            title="Missed Call Revenue"
            value={metrics.missedCallRevenueRecovered}
            description="Monthly revenue saved"
            isPositive
            isCurrency
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
              </svg>
            }
          />
          <MetricCard
            title="Retention Value"
            value={metrics.customerRetentionValue}
            description="3-month LTV impact"
            isPositive
            isCurrency
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7" />
              </svg>
            }
          />
          <MetricCard
            title="Cost Per Call"
            value={metrics.costPerCallWithout}
            description={`vs ${formatCurrency(metrics.costPerCallWith)} with Slang.AI`}
            isCurrency
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493" />
              </svg>
            }
          />
          <MetricCard
            title="Peak Season Savings"
            value={metrics.peakSeasonSavings}
            description="During busiest month"
            isPositive
            isCurrency
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2" />
              </svg>
            }
          />
          <MetricCard
            title="Carbon Reduction"
            value={metrics.carbonFootprintReduction}
            description="Metric tons CO₂/year"
            isPositive
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1" />
              </svg>
            }
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2 text-center">Slang.AI ROI Calculator</h1>
      <p className="text-center text-gray-600 mb-6">
        Compare your current phone labor costs with automated Slang.AI solutions
      </p>

      {/* Navigation Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto">
        <button
          className={`py-2 px-4 font-medium whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`py-2 px-4 font-medium whitespace-nowrap ${
            activeTab === 'details'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('details')}
        >
          Detailed Analysis
        </button>
        <button
          className={`py-2 px-4 font-medium whitespace-nowrap ${
            activeTab === 'projections'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('projections')}
        >
          Projections
        </button>
        <button
          className={`py-2 px-4 font-medium whitespace-nowrap ${
            activeTab === 'comparative'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('comparative')}
        >
          Comparative Analysis
        </button>
        <button
          className={`py-2 px-4 font-medium whitespace-nowrap ${
            activeTab === 'sensitivity'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('sensitivity')}
        >
          Sensitivity Analysis
        </button>
      </div>

      {/* Input Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Staff Configuration */}
        {/* ... (Staff Configuration JSX remains unchanged) ... */}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          {/* Summary Metrics */}
          <div className="mb-8 bg-blue-50 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Cost Summary
            </h2>

            {/* Primary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* ... (Metric blocks remain unchanged) ... */}
            </div>

            {/* Metrics View Selection */}
            <div className="flex justify-center mb-3">
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  className={`px-3 py-1 text-sm rounded-md ${selectedView === 'financial' ? 'bg-white shadow' : ''}`}
                  onClick={() => setSelectedView('financial')}
                >
                  Financial
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md ${selectedView === 'operational' ? 'bg-white shadow' : ''}`}
                  onClick={() => setSelectedView('operational')}
                >
                  Operational
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md ${selectedView === 'revenue' ? 'bg-white shadow' : ''}`}
                  onClick={() => setSelectedView('revenue')}
                >
                  Revenue Impact
                </button>
              </div>
            </div>

            {/* Secondary Metrics */}
            <h3 className="text-sm font-medium text-gray-700 mt-4 mb-2">Advanced Metrics</h3>
            {renderAdvancedMetrics()}
          </div>

          {/* Visual Charts (Primary) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Cost Breakdown Chart */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-md font-semibold mb-4">Monthly Cost vs. Hourly Wage</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="wage" label={{ value: 'Hourly Wage ($)', position: 'insideBottom', offset: -5 }} tickFormatter={formatWage} />
                    <YAxis label={{ value: 'Monthly Cost ($)', angle: -90, position: 'insideLeft' }} tickFormatter={(value) => `$${value}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="withoutSlangAI" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="withSlangAI" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdvancedSlangAICalculator;